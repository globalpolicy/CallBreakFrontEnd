<script lang="ts">
	import { Input } from './ui/input';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { Button } from './ui/button';
	import * as Drawer from '$lib/components/ui/drawer';

	let {
		onCreateButtonClick,
		openState = $bindable(false)
	}: { onCreateButtonClick: (noOfPlayers: number) => void; openState: boolean } = $props();
	let numberOfPlayersInNewRoom = $state(4);

	function onOpenChange(newState: boolean) {
		openState = newState;
	}
</script>

<Drawer.Root open={openState} {onOpenChange}>
	<Drawer.Trigger></Drawer.Trigger>
	<Drawer.Content>
		<Drawer.Header>
			<Drawer.Title class="mx-auto mb-4 max-w-sm	justify-center"
				>Please enter the new room's capacity</Drawer.Title
			>
			<Drawer.Description class="mx-auto max-w-sm justify-center">
				<Input type="number" bind:value={numberOfPlayersInNewRoom} min="2" max="6" />
			</Drawer.Description>
		</Drawer.Header>
		<Drawer.Footer class="mx-auto max-w-sm justify-center">
			<Tooltip.Root>
				<Tooltip.Trigger>
					<Button onclick={() => onCreateButtonClick(numberOfPlayersInNewRoom)}>Submit</Button>
				</Tooltip.Trigger>
				<Tooltip.Content>
					Caution: All existing rooms will be deactivated before creating a new room.
				</Tooltip.Content>
			</Tooltip.Root>
			<Drawer.Close>Cancel</Drawer.Close>
		</Drawer.Footer>
	</Drawer.Content>
</Drawer.Root>
