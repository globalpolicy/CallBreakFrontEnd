<script lang="ts">
	import { accessToken } from '@/stores/tokenstore';
	import { CreateRoom } from '$lib/api.js';
	import { goto } from '$app/navigation';
	import * as Card from '$lib/components/ui/card/index.js';
	import ScrollArea from '@/components/ui/scroll-area/scroll-area.svelte';
	import RoomPlayersList from '$lib/components/roomPlayersList.svelte';

	import * as ContextMenu from '$lib/components/ui/context-menu';
	import RoomScoresDisplayDialog from '@/components/roomScoresDisplayDialog.svelte';
	import FloatingButton from '@/components/floatingButton.svelte';
	import CreateNewRoomDrawer from '@/components/createNewRoomDrawer.svelte';
	import { Plus } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	let gameScoresToDisplayForRoomUid = $state('');
	let gameScoreShowState = $state(false);
	let createNewRoomModalShowState = $state(false);
	let { data } = $props();

	//console.log(data);

	let sortedRooms = data.userDetails.rooms.toSorted((a, b) => {
		let aDate = new Date(a.createdAt);
		let bDate = new Date(b.createdAt);
		return -aDate.getTime() + bDate.getTime(); // descending order
	});

	async function createRoom(numberOfPlayers: number) {
		let newRoomInfo = await CreateRoom($accessToken, numberOfPlayers);
		debugger;
		if (newRoomInfo.success) {

			window.location.href='/user/rooms'
		} else {
			toast.error(newRoomInfo.data as any as string);
		}
	}

	function takeToActiveGame(playerUid: string) {
		goto(`/activegame/${playerUid}`);
	}

	function showScoresForRoom(roomUid: string) {
		console.log('Show scores for roomUID:' + roomUid);
		gameScoresToDisplayForRoomUid = roomUid;
		gameScoreShowState = true;
	}

	function showCreateNewRoomModal() {
		createNewRoomModalShowState = true;
	}
</script>

<div class="flex items-center">
	<h1 class="text-lg font-semibold md:text-2xl">Rooms</h1>
</div>

<div class="flex max-h-full flex-1 justify-center rounded-lg border border-dashed shadow-sm">
	{#if sortedRooms}
		<ScrollArea class="h-full w-full flex-1 rounded-md">
			<div class="flex max-h-full flex-col items-center gap-1 overflow-y-auto text-center">
				{#each sortedRooms as room}
					{#if room.isActive}
						<ContextMenu.Root>
							<ContextMenu.Trigger>
								<div class="py-2">
									<RoomPlayersList playerUid={room.roomAdminUid}></RoomPlayersList>
								</div>
							</ContextMenu.Trigger>
							<ContextMenu.Content>
								<ContextMenu.Item onclick={() => takeToActiveGame(room.roomAdminUid)}
									>Go to game</ContextMenu.Item
								>
								<ContextMenu.Item onclick={() => showScoresForRoom(room.roomUid)}
									>Show scores</ContextMenu.Item
								>
							</ContextMenu.Content>
						</ContextMenu.Root>
					{:else}
						<ContextMenu.Root>
							<ContextMenu.Trigger>
								<Card.Root
									class="my-2 xl:col-span-2 {room.isActive ? '' : 'text-muted-foreground'} "
								>
									<Card.Header class="flex flex-row items-center">
										<div class="grid gap-2">
											<Card.Title>UID: {room.roomUid}</Card.Title>
											<Card.Description>Created at {room.createdAt}</Card.Description>
										</div>
									</Card.Header>
									<Card.Content>Capacity: {room.capacity}</Card.Content>
								</Card.Root>
							</ContextMenu.Trigger>
							<ContextMenu.Content>
								<ContextMenu.Item onclick={() => showScoresForRoom(room.roomUid)}
									>Show scores</ContextMenu.Item
								>
							</ContextMenu.Content>
						</ContextMenu.Root>
					{/if}
				{/each}
			</div>
		</ScrollArea>
		<RoomScoresDisplayDialog
			roomUid={gameScoresToDisplayForRoomUid}
			bind:openState={gameScoreShowState}
		></RoomScoresDisplayDialog>
	{/if}
</div>

<FloatingButton onClickHandler={showCreateNewRoomModal}><Plus></Plus></FloatingButton>
<CreateNewRoomDrawer onCreateButtonClick={createRoom} bind:openState={createNewRoomModalShowState}
></CreateNewRoomDrawer>
