<script lang="ts">
	import * as Drawer from '$lib/components/ui/drawer';
	import { Button } from '@/components/ui/button';
	import { Input } from '@/components/ui/input';

	let {
		openState = $bindable(false),
		onOkButtonClicked
	}: {
		openState: boolean;
		onOkButtonClicked: (score: number) => void;
	} = $props();

	let declaredScore = $state(1);
	function onOpenChange(newState: boolean) {
		openState = newState;
	}
</script>

<Drawer.Root open={openState} {onOpenChange}>
	<Drawer.Trigger></Drawer.Trigger>
	<Drawer.Content>
		<Drawer.Header>
			<Drawer.Title class="mx-auto mb-4 max-w-sm	justify-center"
				>Please declare your anticipated score</Drawer.Title
			>
			<Drawer.Description class="mx-auto max-w-sm justify-center">
				<Input type="number" bind:value={declaredScore} min="1" max="26" />
			</Drawer.Description>
		</Drawer.Header>
		<Drawer.Footer class="mx-auto max-w-sm justify-center">
			<Button
				onclick={() => {
					onOkButtonClicked(declaredScore);
				}}>Submit</Button
			>
			<Drawer.Close>Cancel</Drawer.Close>
		</Drawer.Footer>
	</Drawer.Content>
</Drawer.Root>
