<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Badge } from '$lib/components/ui/badge';
	import { onDestroy, onMount } from 'svelte';
	import { GetPlayerDetails, GetRoomPlayers, type Player } from '$lib/api';
	import { SignalRManager, type PlayerInfo } from '$lib/signalRmgr';

	let {
		playerUid,
		sideButtonClickHandler = undefined,
		sideButtonText = ''
	}: {
		playerUid: string;
		sideButtonClickHandler: Function | undefined;
		sideButtonText: string | undefined;
	} = $props();

	let playersInRoom: { players: Player[] } = $state({
		players: []
	});
	let playerRoomDetails = $state();
	let signalrManager: SignalRManager;

	onMount(async () => {
		try {
			signalrManager = await SignalRManager.GetInstance(playerUid);

			signalrManager.AddPlayerCameOnlineHandler(PlayerCameOnline);
			signalrManager.AddPlayerWentOfflineHandler(PlayerWentOffline);
			signalrManager.AddConnectionClosedHandler(ConnectionClosed);

			await signalrManager.ConnectionStart();
			await signalrManager.JoinHub(); // connect to SignalR hub

			UpdatePlayersInRoom(); // retrieve all players in this room via API call and update the state

			playerRoomDetails = GetPlayerDetails(playerUid);
		} catch (error) {
			console.log(error);
		}
	});

	onDestroy(async () => {
		try {
			await signalrManager.ConnectionClose();
		} catch (error) {
			console.log(error);
		}
	});

	function UpdatePlayersInRoom() {
		// update playersInRoom when we have all players in the room
		GetRoomPlayers(playerUid).then((payload) => {
			if (payload.success) {
				playersInRoom = payload.data;
			}
		});
	}

	//#region SignalR callbacks

	function PlayerCameOnline(player: PlayerInfo) {
		console.log(`Player came online: ${player.name} #${player.id}`);
		UpdatePlayersInRoom();
	}

	function PlayerWentOffline(player: PlayerInfo) {
		console.log(`Player went offline: ${player.name} #${player.id}`);
		UpdatePlayersInRoom();
	}

	function ConnectionClosed() {
		console.log('Connection closed!');
	}

	//#endregion
</script>

<Card.Root class="xl:col-span-2">
	<Card.Header class="flex flex-row items-center">
		<div class="grid gap-2">
			<Card.Title>
				{#await playerRoomDetails}
					Loading room details...
				{:then roomDetails}
					{#if roomDetails?.success}
						<ul>
							<li class="my-2">
								Player: <span class="text-muted-foreground">{roomDetails?.data.playerName}</span>
							</li>
							<li class="my-2">
								Room: <span class="text-muted-foreground"
									>{roomDetails?.data.roomInfoShort.roomUid}</span
								>
							</li>
							<li class="my-2">
								Capacity: <span class="text-muted-foreground"
									>{roomDetails?.data.roomInfoShort.capacity}</span
								>
							</li>
							<li class="my-2">
								Occupancy: <span class="text-muted-foreground">{playersInRoom.players.length}</span>
							</li>
						</ul>
					{:else}
						Could not load player room details!
					{/if}
				{/await}
			</Card.Title>

		</div>
		{#if sideButtonClickHandler}
			<Button onclick={sideButtonClickHandler} size="sm" class="ml-5 ml-auto gap-1"
				>{sideButtonText}</Button
			>
		{/if}
	</Card.Header>
	<Card.Content>
		{#if playersInRoom.players.length > 0}
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Player</Table.Head>
						<Table.Head class="text-right">Join Date</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each playersInRoom.players as player}
						<Table.Row>
							<Table.Cell>
								<div class="font-medium">
									{player.playerName}
									{#if player.isOnline}
										<span><Badge variant="destructive">Online</Badge></span>
									{/if}
								</div>
								<div class="text-muted-foreground text-sm md:inline">
									#{player.playerId}
								</div>
							</Table.Cell>

							<Table.Cell class="text-right">{player.joinedAt}</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		{/if}
	</Card.Content>
</Card.Root>
