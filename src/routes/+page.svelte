<script lang="ts">
	import GoogleSSO from '$lib/components/googlesso.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import { accessToken, refreshToken, playerDetails } from '$lib/stores/tokenstore';
	import { goto, invalidate } from '$app/navigation';
	import { API_ROUTES, JoinRoom } from '$lib/api';

	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';

	import { toast } from 'svelte-sonner';

	let { data } = $props(); // given by the load() function of sibling +layout.js

	let playerName = $state('');
	let roomUID = $state('');

	if (data.userMode) {
		goto('/user');
	} else if (!data.userMode && data.playerDetails && data.playerDetails != '') {
		goto('/player');
	}

	async function googleJwtObtained(jwt: string) {
		//console.log('Google JWT:' + jwt);
		const response = await fetch(API_ROUTES.GoogleSignOn, {
			method: 'POST',
			body: JSON.stringify({ GoogleJwt: jwt }),
			headers: {
				'Content-Type': 'application/json'
			}
		});
		if (!response.ok) {
			console.log('Failed to login!');
		} else {
			const json = await response.json();

			// save tokens
			accessToken.set(json.data.accessToken);
			refreshToken.set(json.data.refreshToken);

			await invalidate('some:rootlayoutloadfunction');
			goto('/user');
		}
	}

	async function joinRoom() {
		if (playerName === '') {
			toast.error('Please enter a player name.');
			return;
		}
		if (roomUID === '') {
			toast.error('Please enter a valid room UID.');
			return;
		}
		const joinRoomResponse = await JoinRoom(playerName, roomUID);

		if (!joinRoomResponse.success) {
			toast.error(`Could not join room!\n${joinRoomResponse.data}`);
			return;
		}
		toast.success(`Successfully joined room as ${joinRoomResponse.data.playerName}`);
		$playerDetails = joinRoomResponse.data.playerUid; // save newly created player's UID to store
		goto('/player'); // redirect to /player
	}
</script>

<div class="flex h-screen items-center justify-center">
	{#if !data.userMode && !data.playerMode}
		<Card.Root class="w-full max-w-sm">
			<Card.Header class="grid place-items-center">
				<Card.Title class="text-2xl">Join A Room</Card.Title>
				<Card.Description>Enter the room UID and a name to join.</Card.Description>
			</Card.Header>
			<Card.Content class="grid gap-4">
				<div class="grid gap-2">
					<Label for="roomUid">Room UID</Label>
					<Input
						id="roomUid"
						type="text"
						bind:value={roomUID}
						placeholder={`729BE27A-B5FF-4953-ABB0-69794C27C8B5`}
						required
					/>
				</div>
				<div class="grid gap-2">
					<Label for="playerName">Player Name</Label>
					<Input
						id="playerName"
						type="text"
						bind:value={playerName}
						placeholder="Lola Bhanjyang"
						required
					/>
				</div>
				<div class="grid gap-2">
					<Button class="w-full" onclick={joinRoom}>Join</Button>
				</div>
				<div class="grid gap-2">
					<div class="relative flex items-center pt-2">
						<div class="flex-grow border-t border-gray-400"></div>
						<span class="mx-4 flex-shrink text-gray-800">OR</span>
						<div class="flex-grow border-t border-gray-400"></div>
					</div>
				</div>
			</Card.Content>
			<Card.Footer class="grid place-items-center">
				<GoogleSSO onGoogleJwtReceived={googleJwtObtained} />
			</Card.Footer>
		</Card.Root>
	{/if}
</div>
