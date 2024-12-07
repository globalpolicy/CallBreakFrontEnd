<script lang="ts">
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';

	let {
		showState = $bindable(false),
		onSaveClicked
	}: {
		showState: boolean;
		onSaveClicked: (profileValues: { fullName: string; userName: string }) => void;
	} = $props();

	let fullName = $state('');
	let userName = $state('');

	function OnSaveClicked() {
		if (onSaveClicked)
			onSaveClicked({
				fullName,
				userName
			});
	}
</script>

<Dialog.Root bind:open={showState}>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Edit profile</Dialog.Title>
			<Dialog.Description>
				Make changes to your profile here. Click save when you're done.
			</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			<div class="grid grid-cols-4 items-center gap-4">
				<Label for="name" class="text-right">Name</Label>
				<Input id="name" class="col-span-3" bind:value={fullName} />
			</div>
			<div class="grid grid-cols-4 items-center gap-4">
				<Label for="username" class="text-right">Username</Label>
				<Input id="username" class="col-span-3" bind:value={userName} />
			</div>
		</div>
		<Dialog.Footer>
			<Button type="submit" onclick={OnSaveClicked}>Save changes</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
