<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import * as Card from '@/components/ui/card/index.js';
	import { onMount } from 'svelte';

	let { data } = $props();

	onMount(async () => {
		if (!data.userMode) await goto('/'); // go back to root if the root +layout.js file hasn't said we're in userMode
	});

	function getName() {
		let retval: string = '';
		if (data.userDetails.userName) {
			retval = ', ' + data.userDetails.userName;
		} else if (data.userDetails.fullName) {
			retval = ', ' + data.userDetails.fullName.split(' ')[0];
		} else if (data.userDetails.email) {
			retval = ', ' + data.userDetails.email.split('@')[0];
		}
		return retval;
	}
</script>

{#if data.userDetails}
	<div class="flex items-center">
		<h1 class="text-lg font-semibold md:text-2xl">
			Welcome{getName()}
		</h1>
	</div>
	<div class="flex flex-1 flex-col rounded-lg border border-dashed shadow-sm">
		<div class="flex h-64 w-full items-start justify-start gap-y-4">
			<div class="p-4">
				<Card.Root
					class="sm:col-span-2"
					data-x-chunk-name="dashboard-05-chunk-0"
					data-x-chunk-description="A card for an orders dashboard with a description and a button to create a new order."
				>
					<Card.Header class="pb-3">
						<Card.Title>Notifications</Card.Title>
						<Card.Description class="max-w-lg text-balance leading-relaxed">
							No pending notifications here. We'll let you know if anything comes up.
						</Card.Description>
					</Card.Header>
				</Card.Root>
			</div>
		</div>
	</div>
{/if}
