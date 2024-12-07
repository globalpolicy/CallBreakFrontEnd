<!-- The main layout for /user and child routes -->

<script lang="ts">
	import CircleUser from 'lucide-svelte/icons/circle-user';
	import House from 'lucide-svelte/icons/house';
	import Room from 'lucide-svelte/icons/dice-4';
	import Bell from 'lucide-svelte/icons/bell';
	import Menu from 'lucide-svelte/icons/menu';
	import Package2 from 'lucide-svelte/icons/package-2';
	import Search from 'lucide-svelte/icons/search';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import { accessToken, refreshToken } from '@/stores/tokenstore';
	import EditProfileDialog from '@/components/editProfileDialog.svelte';
	import { SetProfileInfo } from '@/api';
	import { toast } from 'svelte-sonner';

	let editProfileShowState = $state(false);

	function RoomsTabClicked() {
		goto('/user/rooms');
	}

	function DashboardTabClicked() {
		goto('/user');
	}

	async function LogoutClicked() {
		$accessToken = '';
		$refreshToken = '';
		await invalidateAll();
		await goto('/');
	}

	async function SaveProfileChanges(profileInfo: { fullName: string; userName: string }) {
		editProfileShowState = false;
		let response = await SetProfileInfo($accessToken, profileInfo.fullName, profileInfo.userName);
		if (response.success) {
			toast.success('Successfully saved profile!');
		} else {
			toast.error('An error occurred while saving profile!');
		}
	}
</script>

<div class="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
	<div class="bg-muted/40 hidden border-r md:block">
		<div class="flex h-full max-h-screen flex-col gap-2">
			<div class="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
				<a href="/" class="flex items-center gap-2 font-semibold">
					<Package2 class="h-6 w-6" />
					<span class="">CallBrelte</span>
				</a>
			</div>
			<div class="flex-1">
				<nav class="grid items-start px-2 text-sm font-medium lg:px-4">
					<a
						href="##"
						onclick={DashboardTabClicked}
						class="hover:text-primary flex items-center gap-3 rounded-lg px-3 py-2 transition-all"
						class:bg-muted={!$page.data.roomTabActive}
						class:text-muted-foreground={$page.data.roomTabActive}
					>
						<House class="h-4 w-4" />
						Dashboard
					</a>
					<a
						href="##"
						onclick={RoomsTabClicked}
						class="hover:text-primary flex items-center gap-3 rounded-lg px-3 py-2 transition-all"
						class:bg-muted={$page.data.roomTabActive}
						class:text-muted-foreground={!$page.data.roomTabActive}
					>
						<Room class="h-4 w-4" />
						Rooms
					</a>
				</nav>
			</div>
			<div class="text-muted-foreground mb-4 mt-auto p-4 text-xs">
				Copyright © 2024 <br />Ajashra Engineering
			</div>
		</div>
	</div>
	<div class="flex flex-col">
		<header class="bg-muted/40 flex h-14 items-center gap-4 border-b px-4 lg:h-[60px] lg:px-6">
			<Sheet.Root>
				<Sheet.Trigger>
					<Button variant="outline" size="icon" class="shrink-0 md:hidden">
						<Menu class="h-5 w-5" />
						<span class="sr-only">Toggle navigation menu</span>
					</Button>
				</Sheet.Trigger>
				<Sheet.Content side="left" class="flex flex-col">
					<nav class="grid gap-2 text-lg font-medium">
						<a href="##" class="my-2 ml-2 flex items-center gap-2 text-lg font-semibold">
							<Package2 class="h-6 w-6" />
							<span class="sr-only">CallBrelte</span>
						</a>
						<a
							href="##"
							onclick={DashboardTabClicked}
							class="hover:text-primary flex items-center gap-3 rounded-lg px-3 py-2 transition-all"
							class:bg-muted={!$page.data.roomTabActive}
							class:text-muted-foreground={$page.data.roomTabActive}
						>
							<House class="h-4 w-4" />
							Dashboard
						</a>
						<a
							href="##"
							onclick={RoomsTabClicked}
							class="hover:text-primary flex items-center gap-3 rounded-lg px-3 py-2 transition-all"
							class:bg-muted={$page.data.roomTabActive}
							class:text-muted-foreground={!$page.data.roomTabActive}
						>
							<Room class="h-4 w-4" />
							Rooms
						</a>
					</nav>
					<div class="text-muted-foreground mb-4 mt-auto p-4 text-xs">
						Copyright © 2024 <br />Ajashra Engineering
					</div>
				</Sheet.Content>
			</Sheet.Root>
			<div class="w-full flex-1"></div>
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					<Button variant="secondary" size="icon" class="rounded-full">
						<CircleUser class="h-5 w-5" />
						<span class="sr-only">Toggle user menu</span>
					</Button>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content align="end">
					<DropdownMenu.Label>My Account<br />{$page.data.userDetails.email}</DropdownMenu.Label>
					<DropdownMenu.Separator />
					<DropdownMenu.Item onclick={() => (editProfileShowState = true)}
						>Settings</DropdownMenu.Item
					>
					<DropdownMenu.Separator />
					<DropdownMenu.Item onclick={LogoutClicked}>Logout</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</header>
		<main class="flex max-h-dvh flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
			<EditProfileDialog bind:showState={editProfileShowState} onSaveClicked={SaveProfileChanges}
			></EditProfileDialog>
			<slot />
		</main>
	</div>
</div>
