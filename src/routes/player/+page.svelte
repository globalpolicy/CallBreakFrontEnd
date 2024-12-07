<script lang="ts">
	import { goto, invalidate } from '$app/navigation';
	import { playerDetails } from '$lib/stores/tokenstore';
	import RoomPlayersList from '@/components/roomPlayersList.svelte';
	import { onMount } from 'svelte';
	import FloatingButton from '@/components/floatingButton.svelte';
	import { LogOut } from 'lucide-svelte';
	import * as ContextMenu from '$lib/components/ui/context-menu';
	import RoomScoresDisplayDialog from '@/components/roomScoresDisplayDialog.svelte';
	import { GetPlayerDetails } from '@/api';

	const playerUid: string = $playerDetails;

	let gameScoreShowState = $state(false);
	let playerRoomUidPromise = $derived.by(async () => {
		let response = await GetPlayerDetails(playerUid);
		if (response.success) {
			return response.data.roomInfoShort.roomUid;
		} else throw new Error(response.data as any as string);
	});

	onMount(async () => {
		if (playerUid === '' || playerUid === null) goto('/');
	});

	async function LeaveRoom() {
		$playerDetails = ''; // clear the player's uid from store
		await invalidate('some:rootlayoutloadfunction'); // force the load() function for the root page to re-execute. SMH... EDIT: the 'await' is critical here for some reason..
		goto('/');
	}

	function GotoActiveGame() {
		goto('/activegame/' + playerUid);
	}
</script>

{#if playerUid && playerUid != ''}
	{#await playerRoomUidPromise}
		<div class="flex h-screen items-center justify-center">Loading player info..</div>
	{:then playerRoomUid}
		<ContextMenu.Root>
			<ContextMenu.Trigger>
				<div class="flex h-screen items-center justify-center">
					<RoomPlayersList {playerUid} />
				</div>
			</ContextMenu.Trigger>
			<ContextMenu.Content>
				<ContextMenu.Item onclick={GotoActiveGame}>Go to game</ContextMenu.Item>
				<ContextMenu.Item onclick={() => (gameScoreShowState = true)}>Show scores</ContextMenu.Item>
			</ContextMenu.Content>
		</ContextMenu.Root>

		<RoomScoresDisplayDialog roomUid={playerRoomUid} bind:openState={gameScoreShowState}
		></RoomScoresDisplayDialog>

		<FloatingButton onClickHandler={() => LeaveRoom()}
			><LogOut class="my-float"></LogOut></FloatingButton
		>
	{:catch someError}
		{someError.message}
	{/await}
{/if}
