<script lang="ts">
	import {
		DoesActiveGameExist,
		GetDiscardPile,
		GetLatestPlay,
		GetMyHand,
		GetPlayerDetails,
		GetPlayersHandCounts,
		GetRoomPlayers,
		PlayCard,
		StartNewGame,
		GetScores,
		type Player,
		DeclareScore
	} from '@/api';
	import Button from '@/components/ui/button/button.svelte';
	import { SignalRManager, type PlayerInfo, type PlayCardCallbackInfo } from '@/signalRmgr';
	import { onDestroy, onMount, tick, untrack } from 'svelte';
	import { page } from '$app/stores';
	import DiscardPileOfCards from '@/components/discardPileOfCards.svelte';
	import HandOfCards from '@/components/handOfCards.svelte';
	import HandOfCardsBack from '@/components/handOfCardsBack.svelte';
	import ScoreDeclarationDrawer from '@/components/scoreDeclarationDrawer.svelte';
	import { toast } from 'svelte-sonner';
	import * as Tooltip from '$lib/components/ui/tooltip';

	let playerUid = $page.params.playeruid; // load playerUid from slug

	let playerBasicInfo = $state({
		playerId: -1,
		playerName: '',
		isRoomAdmin: false
	});
	let signalrManager: SignalRManager;
	let playersInRoom: Player[] = $state([]);
	let activeGameExists = $state(false);

	let orderedOpponentHandCounts: Array<{
		playerId: number;
		playerName: string;
		noOfCards: number;
	}> = $state([]);

	let selfHandStr = $state('');

	let discardPile: Array<{
		playerId: number;
		playerName: string;
		cardName: string;
	}> = $state([]);

	let playersScores: Array<{
		playerId: number;
		playerName: string;
		declaredScore: number | undefined;
		actualScore: number;
	}> = $state([]);
	let latestPlay: {
		playerId: number;
		playerName: string;
		playedCard: string;
		roundIsOver: boolean;
		gameIsOver: boolean;
		nextTurnPlayerId: number;
	} = $state({
		playerId: -1,
		playerName: '',
		playedCard: '',
		roundIsOver: false,
		gameIsOver: false,
		nextTurnPlayerId: -1
	});
	let scoreDeclarationDrawerOpenState = $state(false);
	let animateWinnerState = $state(false);
	// let animateWinnerState: boolean = $derived.by(async () => {
	// 	let retval = false;
	// 	if (
	// 		latestPlay.roundIsOver &&
	// 		playersInRoom.length > 0 &&
	// 		orderedOpponentHandCounts.length > 0
	// 	) {
	// 		console.log('About to toggle animate on now. Waiting for DOM to finish updates.');
	// 		await tick();
	// 		retval = true;
	// 	}
	// 	return retval;
	// });

	onMount(async () => {
		console.log('Mounting active game page..');
		signalrManager = await SignalRManager.GetInstance(playerUid);
		signalrManager.AddPlayerCameOnlineHandler(PlayerCameOnline);
		signalrManager.AddPlayerWentOfflineHandler(PlayerWentOffline);
		signalrManager.AddCardsHaveBeenDealtHandler(CardsHaveBeenDealt);
		signalrManager.AddCardHasBeenPlayedHandler(CardHasBeenPlayed);
		signalrManager.AddScoresUpdatedHandler(ScoresHaveBeenUpdated);
		await signalrManager.ConnectionStart();
		await signalrManager.JoinHub(); // connect to SignalR hub
	});

	onDestroy(async () => {
		await signalrManager.ConnectionClose();
	});

	//#region Game metadata update functions

	function UpdatePlayerBasicInfo(): Promise<void> {
		return new Promise((resolve, reject) => {
			GetPlayerDetails(playerUid).then((x) => {
				//console.log(x.data);
				playerBasicInfo.playerId = x.data.playerId;
				playerBasicInfo.isRoomAdmin = x.data.isRoomAdmin;
				playerBasicInfo.playerName = x.data.playerName;
				if (x.data.roomInfoShort.occupancy < x.data.roomInfoShort.capacity) {
					alert(
						`Only ${x.data.roomInfoShort.occupancy}/${x.data.roomInfoShort.capacity} players in room. Cannot start game.`
					);
					history.back();
				}
				resolve();
			});
		});
	}

	function UpdateActiveGameExists(): Promise<void> {
		return new Promise((resolve, reject) => {
			DoesActiveGameExist(playerUid).then((payload) => {
				if (payload.success) {
					activeGameExists = payload.data;
				}
				resolve();
			});
		});
	}

	function UpdatePlayersInRoom(): Promise<void> {
		return new Promise((resolve, reject) => {
			GetRoomPlayers(playerUid).then((payload) => {
				if (payload.success) {
					playersInRoom = payload.data.players;
				}
				resolve();
			});
		});
	}

	//#endregion

	//#region Game state update functions
	function UpdateGameState() {
		UpdatePlayerBasicInfo().then((_) => {
			UpdateActiveGameExists().then((_) => {
				UpdatePlayersInRoom().then((_) => {
					UpdatePlayersHandCounts().then((_) => {
						UpdateLatestPlayInfo();
						UpdateDiscardPile();
						UpdateSelfHand();
						UpdatePlayersScores();
					});
				});
			});
		});
	}

	function UpdateDiscardPile() {
		GetDiscardPile(playerUid).then((payload) => {
			if (payload.success) {
				discardPile = GetDiscardPileFromPlayedCards(payload.data, playersInRoom);
			}
		});
	}

	function UpdateSelfHand() {
		GetMyHand(playerUid).then((payload) => {
			if (payload.success) {
				selfHandStr = payload.data;
			}
		});
	}

	function UpdatePlayersHandCounts(): Promise<void> {
		return new Promise((resolve, reject) => {
			GetPlayersHandCounts(playerUid).then((playersHandsCountsInfo) => {
				if (playersHandsCountsInfo.success) {
					orderedOpponentHandCounts = GetOrderedOpponentHands(
						playersHandsCountsInfo.data,
						playerBasicInfo.playerId,
						playersInRoom
					);
				}
				resolve();
			});
		});
	}

	function UpdatePlayersScores() {
		GetScores(playerUid).then((payload) => {
			if (payload.success) {
				playersScores = payload.data;
			}
		});
	}

	function UpdateLatestPlayInfo() {
		GetLatestPlay(playerUid).then((payload) => {
			if (payload.success) {
				latestPlay = payload.data;

				if (latestPlay.roundIsOver) {
					tick().then(() => {
						animateWinnerState = true;
					});
				} else {
					animateWinnerState = false;
				}

				if (latestPlay.gameIsOver) {
					setTimeout(() => {
						latestPlay.nextTurnPlayerId = -1; // this is to prevent player boxes from glowing anymore. it's in a timeout coz we want the winner animation to play
						alert('Game Over!');
					}, 2000);
				}
			}
		});
	}
	//#endregion

	//#region Animation related functions
	function ComputeAnimationDeltas() {
		{
			let retval = {
				x: 0,
				y: 0
			};

			let winnerPlayerId = latestPlay.nextTurnPlayerId;

			let winnerHandDiv = document.getElementById('player-' + winnerPlayerId);
			let discardPileDiv = document.getElementById('discard-pile');

			console.log('--start--');
			console.log(winnerPlayerId);
			console.log(winnerHandDiv);
			console.log(discardPileDiv);
			console.log('--end--');

			if (winnerHandDiv && discardPileDiv) {
				let targetY =
					(winnerHandDiv!.getBoundingClientRect().bottom +
						winnerHandDiv!.getBoundingClientRect().top) /
					2;
				let targetX =
					(winnerHandDiv!.getBoundingClientRect().left +
						winnerHandDiv!.getBoundingClientRect().right) /
					2;

				let srcY =
					(discardPileDiv!.getBoundingClientRect().bottom +
						discardPileDiv!.getBoundingClientRect().top) /
					2;
				let srcX =
					(discardPileDiv!.getBoundingClientRect().left +
						discardPileDiv!.getBoundingClientRect().right) /
					2;

				retval = {
					x: targetX - srcX,
					y: targetY - srcY
				};
			}

			console.log(retval);
			return retval;
		}
	}
	//#endregion

	//#region UI event handlers

	function StartGameClicked() {
		StartNewGame(playerUid).then((response) => {
			if (response.success) {
				console.log('New game started. Loading new game state.');
				//UpdateGameState(); // commented because we already do this when we receive the CardsHaveBeenDealt() notification; and yes, all players of the room receive it
			}
		});
	}

	function CardPicked(cardName: string) {
		PlayCard(playerUid, cardName).then((payload) => {
			if (payload.success) {
				console.log('Successfully played ' + cardName);
				latestPlay = payload.data;

				if (latestPlay.roundIsOver) {
					animateWinnerState = true;
					UpdatePlayersScores();
				} else {
					animateWinnerState = false;
				}

				if (latestPlay.gameIsOver) {
					setTimeout(() => {
						latestPlay.nextTurnPlayerId = -1; // this is to prevent player boxes from glowing anymore. it's in a timeout coz we want the winner animation to play
						alert('Game Over!');
					}, 2000);
				}

				UpdateDiscardPile();
				UpdateSelfHand();
			} else {
				toast.error(payload.data as any as string);
			}
		});
	}

	function OpenScoreDeclarationDrawer() {
		scoreDeclarationDrawerOpenState = true;
	}

	function ScoreDeclarationOkClicked(declaredScore: number) {
		DeclareScore(playerUid, declaredScore).then((response) => {
			if (!response.success) {
				toast.error(response.data);
			} else {
				toast.info('Score declared successfully!');
				scoreDeclarationDrawerOpenState = false;
				UpdatePlayersScores();
			}
		});
	}

	//#endregion

	//#region SignalR callback functions

	function PlayerCameOnline(player: PlayerInfo) {
		console.log('Player came online: ' + player.name + ' #' + player.id);
	}

	function PlayerWentOffline(player: PlayerInfo) {
		console.log('Player went offline: ' + player.name + ' #' + player.id);
	}

	function CardsHaveBeenDealt() {
		console.log('Cards have been dealt.');
		UpdateGameState();
	}

	function CardHasBeenPlayed(playedCardInfo: PlayCardCallbackInfo) {
		console.log('Card has been played.');
		latestPlay = playedCardInfo;

		if (latestPlay.roundIsOver) {
			animateWinnerState = true;
			UpdatePlayersScores();
		} else {
			animateWinnerState = false;
		}

		if (latestPlay.gameIsOver) {
			setTimeout(() => {
				latestPlay.nextTurnPlayerId = -1; // this is to prevent player boxes from glowing anymore. it's in a timeout coz we want the winner animation to play
				alert('Game Over!');
			}, 2000);
		}

		UpdateDiscardPile();
		UpdatePlayersHandCounts();
	}

	function ScoresHaveBeenUpdated() {
		console.log('Scores have been updated.');
		UpdatePlayersScores();
	}
	//#endregion

	//#region Convenience functions for data transformation. No side-effects, no globals usage, pure functions.

	function GetDiscardPileFromPlayedCards(
		playedCards: Array<{ playerId: number; card: string }>,
		playersInTheRoom: Player[]
	): Array<{
		playerId: number;
		playerName: string;
		cardName: string;
	}> {
		let retval = [];
		for (const playedCard of playedCards) {
			if (playedCard.card)
				// check for if no card has been played (e.g. it's the first round)
				retval.push({
					playerId: playedCard.playerId,
					playerName: playersInTheRoom.find((player) => player.playerId == playedCard.playerId)!
						.playerName,
					cardName: playedCard.card
				});
		}
		return retval;
	}

	// This function returns an ordered array of opponent-only player hands such that its elements are in ascending order of playerId and the first element is
	// the playerId after the self player. If self playerId is the highest, circle back to the first. This makes it so that the arrangement of players in the game
	// respects the increasing order of playerId for all players, leading to a consistent player arrangement
	function GetOrderedOpponentHands(
		playerIdNoOfCardsDict: Map<number, number>,
		selfPlayerId: number,
		playersInTheRoom: Player[]
	): Array<{
		playerId: number;
		playerName: string;
		noOfCards: number;
	}> {
		let retval = [];

		// construct the tmp array with all available info plus the playerName info
		let tmp = [];
		for (const [playerId, handCount] of playerIdNoOfCardsDict) {
			tmp.push({
				playerId: playerId,
				playerName: playersInTheRoom.find((player) => player.playerId == playerId)!.playerName,
				noOfCards: handCount
			});
		}

		// sort the tmp array in place by playerId ASC, meaning the earlier players will be towards the start.
		tmp.sort((opponentObj1, opponentObj2) => {
			return opponentObj1.playerId - opponentObj2.playerId;
		});

		// populate the retval array starting from on elemenet after the self player element in tmp array, circling back to the start if necessary ultil retval has 1 less than tot. players
		let selfPlayerIndex = tmp.findIndex((el) => el.playerId == selfPlayerId);
		while (retval.length < tmp.length - 1) {
			retval.push(tmp[++selfPlayerIndex % tmp.length]);
		}

		return retval;
	}
	//#endregion

	UpdateGameState(); // kick it off..
</script>

<div
	id="game-container"
	class={!activeGameExists ? 'flex h-screen flex-col items-center justify-center gap-8' : ''}
>
	{#if activeGameExists}
		{#if playersInRoom.length > 0 && orderedOpponentHandCounts.length > 0}
			{#if playersInRoom.length == 2}
				<div class="mt-16 flex flex-col gap-y-48">
					<div class="flex justify-center">
						<div id={'player-' + orderedOpponentHandCounts[0].playerId}>
							<HandOfCardsBack
								cardsInfo={orderedOpponentHandCounts[0]}
								isUpNext={latestPlay.nextTurnPlayerId == orderedOpponentHandCounts[0].playerId}
								actualScore={playersScores.find(
									(x) => x.playerId == orderedOpponentHandCounts[0].playerId
								)?.actualScore ?? 0}
								declaredScore={playersScores.find(
									(x) => x.playerId == orderedOpponentHandCounts[0].playerId
								)?.declaredScore ?? 0}
							></HandOfCardsBack>
						</div>
					</div>
					<div class="flex justify-center">
						<div id="discard-pile">
							<DiscardPileOfCards
								cards={discardPile}
								animateFlag={animateWinnerState}
								--delY={ComputeAnimationDeltas().y + 'px'}
								--delX={ComputeAnimationDeltas().x + 'px'}
								onAnimationOver={() => {
									discardPile = [];
								}}
							></DiscardPileOfCards>
						</div>
					</div>
					<div class="flex justify-center">
						<div id={'player-' + playerBasicInfo.playerId}>
							<HandOfCards
								cardsInfo={{
									playerId: playerBasicInfo.playerId,
									playerName: playerBasicInfo.playerName,
									cardsStr: selfHandStr
								}}
								isUpNext={latestPlay.nextTurnPlayerId == playerBasicInfo.playerId}
								actualScore={playersScores.find((x) => x.playerId == playerBasicInfo.playerId)
									?.actualScore ?? 0}
								declaredScore={playersScores.find((x) => x.playerId == playerBasicInfo.playerId)
									?.declaredScore ?? 0}
								onCardPicked={CardPicked}
								onDeclareClicked={OpenScoreDeclarationDrawer}
							></HandOfCards>
						</div>
					</div>
				</div>
			{:else if playersInRoom.length == 3}
				<div class="mt-16 flex flex-col gap-y-14">
					<div class="mt-4 flex justify-around">
						<div id={'player-' + orderedOpponentHandCounts[1].playerId}>
							<HandOfCardsBack
								cardsInfo={orderedOpponentHandCounts[1]}
								isUpNext={latestPlay.nextTurnPlayerId == orderedOpponentHandCounts[1].playerId}
								actualScore={playersScores.find(
									(x) => x.playerId == orderedOpponentHandCounts[1].playerId
								)?.actualScore ?? 0}
								declaredScore={playersScores.find(
									(x) => x.playerId == orderedOpponentHandCounts[1].playerId
								)?.declaredScore ?? 0}
							></HandOfCardsBack>
						</div>
						<div id={'player-' + orderedOpponentHandCounts[0].playerId}>
							<HandOfCardsBack
								cardsInfo={orderedOpponentHandCounts[0]}
								isUpNext={latestPlay.nextTurnPlayerId == orderedOpponentHandCounts[0].playerId}
								actualScore={playersScores.find(
									(x) => x.playerId == orderedOpponentHandCounts[0].playerId
								)?.actualScore ?? 0}
								declaredScore={playersScores.find(
									(x) => x.playerId == orderedOpponentHandCounts[0].playerId
								)?.declaredScore ?? 0}
							></HandOfCardsBack>
						</div>
					</div>
					<div class="flex justify-center">
						<div id="discard-pile">
							<DiscardPileOfCards
								cards={discardPile}
								animateFlag={animateWinnerState}
								--delY={ComputeAnimationDeltas().y + 'px'}
								--delX={ComputeAnimationDeltas().x + 'px'}
								onAnimationOver={() => {
									discardPile = [];
								}}
							></DiscardPileOfCards>
						</div>
					</div>
					<div class="mt-14 flex justify-center">
						<div id={'player-' + playerBasicInfo.playerId}>
							<HandOfCards
								cardsInfo={{
									playerId: playerBasicInfo.playerId,
									playerName: playerBasicInfo.playerName,
									cardsStr: selfHandStr
								}}
								isUpNext={latestPlay.nextTurnPlayerId == playerBasicInfo.playerId}
								actualScore={playersScores.find((x) => x.playerId == playerBasicInfo.playerId)
									?.actualScore ?? 0}
								declaredScore={playersScores.find((x) => x.playerId == playerBasicInfo.playerId)
									?.declaredScore ?? 0}
								onCardPicked={CardPicked}
								onDeclareClicked={OpenScoreDeclarationDrawer}
							></HandOfCards>
						</div>
					</div>
				</div>
			{:else if playersInRoom.length == 4}
				<div class="mt-16 flex flex-col gap-y-28">
					<div class="flex justify-center">
						<div id={'player-' + orderedOpponentHandCounts[1].playerId}>
							<HandOfCardsBack
								cardsInfo={orderedOpponentHandCounts[1]}
								isUpNext={latestPlay.nextTurnPlayerId == orderedOpponentHandCounts[1].playerId}
								actualScore={playersScores.find(
									(x) => x.playerId == orderedOpponentHandCounts[1].playerId
								)?.actualScore ?? 0}
								declaredScore={playersScores.find(
									(x) => x.playerId == orderedOpponentHandCounts[1].playerId
								)?.declaredScore ?? 0}
							></HandOfCardsBack>
						</div>
					</div>
					<div class="flex justify-around">
						<div id={'player-' + orderedOpponentHandCounts[2].playerId}>
							<HandOfCardsBack
								cardsInfo={orderedOpponentHandCounts[2]}
								isUpNext={latestPlay.nextTurnPlayerId == orderedOpponentHandCounts[2].playerId}
								actualScore={playersScores.find(
									(x) => x.playerId == orderedOpponentHandCounts[2].playerId
								)?.actualScore ?? 0}
								declaredScore={playersScores.find(
									(x) => x.playerId == orderedOpponentHandCounts[2].playerId
								)?.declaredScore ?? 0}
							></HandOfCardsBack>
						</div>
						<div id="discard-pile">
							<DiscardPileOfCards
								cards={discardPile}
								animateFlag={animateWinnerState}
								--delY={ComputeAnimationDeltas().y + 'px'}
								--delX={ComputeAnimationDeltas().x + 'px'}
								onAnimationOver={() => {
									discardPile = [];
								}}
							></DiscardPileOfCards>
						</div>
						<div id={'player-' + orderedOpponentHandCounts[0].playerId}>
							<HandOfCardsBack
								cardsInfo={orderedOpponentHandCounts[0]}
								isUpNext={latestPlay.nextTurnPlayerId == orderedOpponentHandCounts[0].playerId}
								actualScore={playersScores.find(
									(x) => x.playerId == orderedOpponentHandCounts[0].playerId
								)?.actualScore ?? 0}
								declaredScore={playersScores.find(
									(x) => x.playerId == orderedOpponentHandCounts[0].playerId
								)?.declaredScore ?? 0}
							></HandOfCardsBack>
						</div>
					</div>
					<div class="flex justify-center">
						<div id={'player-' + playerBasicInfo.playerId}>
							<HandOfCards
								cardsInfo={{
									playerId: playerBasicInfo.playerId,
									playerName: playerBasicInfo.playerName,
									cardsStr: selfHandStr
								}}
								isUpNext={latestPlay.nextTurnPlayerId == playerBasicInfo.playerId}
								actualScore={playersScores.find((x) => x.playerId == playerBasicInfo.playerId)
									?.actualScore ?? 0}
								declaredScore={playersScores.find((x) => x.playerId == playerBasicInfo.playerId)
									?.declaredScore ?? 0}
								onCardPicked={CardPicked}
								onDeclareClicked={OpenScoreDeclarationDrawer}
							></HandOfCards>
						</div>
					</div>
				</div>
			{:else if playersInRoom.length == 5}{:else if playersInRoom.length == 6}{:else if playersInRoom.length == 0}{:else}WRONG
				NUMBER OF PLAYERS!{/if}

			<ScoreDeclarationDrawer
				bind:openState={scoreDeclarationDrawerOpenState}
				onOkButtonClicked={ScoreDeclarationOkClicked}
			></ScoreDeclarationDrawer>
		{/if}
	{:else if playerBasicInfo.isRoomAdmin}
		<div>
			<p class="text-center">NO ACTIVE GAME FOUND.</p>
			<p class="text-center">START A NEW GAME TO BEGIN..</p>
		</div>
	{:else}
		<div>
			<p class="text-center">NO ACTIVE GAME FOUND.</p>
			<p class="text-center">WAITING FOR ROOM ADMIN TO START ONE..</p>
		</div>
	{/if}
	<div class="flex flex-col items-center justify-center gap-4">
		{#if latestPlay.gameIsOver}
			<div class="game-over"></div>
		{/if}
		{#if playerBasicInfo.isRoomAdmin}
			<Tooltip.Root>
				<Tooltip.Trigger>
					<Button variant="destructive" onclick={StartGameClicked}>New Game</Button>
				</Tooltip.Trigger>
				<Tooltip.Content>
					Deactivate the currently active game, and start a new one.
				</Tooltip.Content>
			</Tooltip.Root>
		{/if}
	</div>
</div>
