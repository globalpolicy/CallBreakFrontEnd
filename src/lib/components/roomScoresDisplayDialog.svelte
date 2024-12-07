<script lang="ts">
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { GetGameWiseScores } from '@/api';
	import * as Dialog from '$lib/components/ui/dialog';
	import { untrack } from 'svelte';
	import { toast } from 'svelte-sonner';

	let { roomUid, openState = $bindable(false) }: { roomUid: string; openState: boolean } = $props();

	let gameWiseScores: Array<{
		gameId: number;
		gameScores: Array<{
			playerId: number;
			playerName: string;
			declaredScore: number;
			actualScore: number;
		}>;
	}> = $state([]);

	let players: Array<{
		playerId: number;
		playerName: string;
	}> = $state([]);
	let scoreSets: Array<{
		gameId: number;
		playersScores: Array<{
			declaredScore: number;
			actualScore: number;
		}>;
	}> = $state([]);
	let playersTotalScores: number[] = $state([]);

	$effect(() => {
		//console.log('$effect called');
		if (openState && roomUid) {
			GetGameWiseScores(roomUid).then((response) => {
				if (response.success) {
					untrack(() => {
						gameWiseScores = response.data;
						ComputeTableColumnsAndRows();
					});
				} else {
					openState = false; // no point in displaying no data/stale data
					toast.error(response.data as any as string);
				}
			});
		}
	});

	function ComputeTableColumnsAndRows() {
		if (gameWiseScores.length > 0) {
			players = [];
			scoreSets = [];
			playersTotalScores = [];

			//#region Get the game with the highest number of players (ideally, all games should have the same, but it is possible that a new game was created without all players declaring their scores first)
			let gameIndexWithHighestPlayerCount = 0;

			let maxPlayerCount = 0;
			for (let i = 0; i < gameWiseScores.length; i++) {
				if (gameWiseScores[i].gameScores.length > maxPlayerCount) {
					maxPlayerCount = gameWiseScores[i].gameScores.length;
					gameIndexWithHighestPlayerCount = i;
				}
			}
			//#endregion

			//#region Populate players for column names
			for (let playerScore of gameWiseScores[gameIndexWithHighestPlayerCount].gameScores) {
				players.push({
					playerId: playerScore.playerId,
					playerName: playerScore.playerName
				});
			}
			//#endregion

			//#region Populate score sets
			for (const gameScores of gameWiseScores) {
				let playersScores: Array<{
					declaredScore: number;
					actualScore: number;
				}> = []; // this should end up having elements for all the players in the room, regardless of whether or not they had declared scores

				for (let i = 0; i < players.length; i++) {
					let playerId = players[i].playerId;
					let playerScore = gameScores.gameScores.find((x) => x.playerId == playerId);
					if (playerScore)
						playersScores.push({
							declaredScore: playerScore.declaredScore,
							actualScore: playerScore.actualScore
						});
					else
						playersScores.push({
							declaredScore: 0,
							actualScore: 0
						});
				}
				scoreSets.push({ gameId: gameScores.gameId, playersScores: playersScores });
			}
			//#endregion

			//#region Populate total scores as an array, for all players, for the final row
			for (const player of players) {
				let playerTotal = 0;
				for (const game of gameWiseScores) {
					let playerScoreForThisGame = game.gameScores.find((el) => el.playerId == player.playerId);
					if (playerScoreForThisGame) {
						let playerScoreForThisGameConsolidated =
							playerScoreForThisGame.actualScore >= playerScoreForThisGame.declaredScore
								? Number(
										playerScoreForThisGame.declaredScore +
											'.' +
											(playerScoreForThisGame.actualScore - playerScoreForThisGame.declaredScore)
									)
								: -playerScoreForThisGame.declaredScore;
						playerTotal += playerScoreForThisGameConsolidated;
					}
				}

				playersTotalScores.push(playerTotal);
			}
			//#endregion
		}
	}
</script>

<Dialog.Root bind:open={openState}>
	<Dialog.Trigger></Dialog.Trigger>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title class="self-center pb-2"
				>Room <span class="text-muted-foreground">{roomUid}</span></Dialog.Title
			>
			<Dialog.Description>
				<div class="scores-container w-512">
					{#if gameWiseScores.length > 0}
						<Table.Root>
							<Table.Header>
								<Table.Row>
									<Table.Head>GameId</Table.Head>
									{#each players as player}
										<Table.Head>
											<div>
												{player.playerName}

												#{player.playerId}
											</div>
										</Table.Head>
									{/each}
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{#each scoreSets as scoreSet}
									<Table.Row>
										<Table.Cell>{scoreSet.gameId}</Table.Cell>
										{#each scoreSet.playersScores as playerScore}
											<Table.Cell>
												{@render MakeScoreElement(
													playerScore.actualScore,
													playerScore.declaredScore
												)}
											</Table.Cell>
										{/each}
									</Table.Row>
								{/each}
								<Table.Row>
									<Table.Cell>TOTAL</Table.Cell>
									{#each playersTotalScores as playerTotalScore}
										<Table.Cell>{playerTotalScore.toFixed(1)}</Table.Cell>
									{/each}
								</Table.Row>
							</Table.Body>
						</Table.Root>
					{/if}
				</div>
			</Dialog.Description>
		</Dialog.Header>
	</Dialog.Content>
</Dialog.Root>

{#snippet MakeScoreElement(actualScore: number, declaredScore: number)}
	<Tooltip.Root>
		<Tooltip.Trigger>
			<div>
				{#if actualScore >= declaredScore}
					{declaredScore}.{actualScore - declaredScore}
				{:else}
					<span class="rounded-full border-2 border-rose-500 p-2">{declaredScore}</span>
					<span class="p-2 opacity-25">{actualScore}</span>
				{/if}
			</div>
		</Tooltip.Trigger>
		<Tooltip.Content>
			<p>
				Declared Score: {declaredScore}
			</p>
			<p>
				Actual Score: {actualScore}
			</p>
		</Tooltip.Content>
	</Tooltip.Root>
{/snippet}
