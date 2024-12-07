<script lang="ts">
	import Button from './ui/button/button.svelte';
	import * as Tooltip from '$lib/components/ui/tooltip';

	let {
		cardsInfo,
		actualScore = 0,
		declaredScore = 0,
		isUpNext = false,
		onCardPicked,
		onDeclareClicked
	}: {
		cardsInfo: {
			playerId: number;
			playerName: string;
			cardsStr: string;
		};
		declaredScore: number;
		actualScore: number;
		isUpNext: boolean;
		onCardPicked: (cardName: string) => void;
		onDeclareClicked: () => void;
	} = $props();

	let cards: string[] = $derived(cardStrToArray(cardsInfo.cardsStr));

	function cardStrToArray(cardsStr: string): string[] {
		let retval: string[] = [];

		let tokens = cardsStr.split(',');
		tokens.forEach((token) => {
			let trimmedToken = token.trim();
			if (trimmedToken != '') retval.push(trimmedToken.toUpperCase());
		});

		return retval;
	}
</script>

<div class="rounded-sm border-2 border-red-500 p-2" class:pulsate={isUpNext}>
	{#if cardsInfo}
		{#each cards as card}
			<input
				type="image"
				class="card hover overlap"
				src={`../cards/${card}.svg`}
				onclick={() => {
					onCardPicked(card);
				}}
				alt={card}
			/>
		{/each}
		<p class="font-semibold">
			{cardsInfo.playerName}<span class="text-muted-foreground">#{cardsInfo.playerId}</span>
			| Score: {actualScore}/{declaredScore}
			{#if declaredScore == 0}
				<span class="ml-2">
					<Tooltip.Root>
						<Tooltip.Trigger
							><Button size="sm" variant="destructive" onclick={onDeclareClicked}>Declare</Button
							></Tooltip.Trigger
						>
						<Tooltip.Content>
							<p>Declare your score</p>
						</Tooltip.Content>
					</Tooltip.Root>
				</span>
			{/if}
		</p>
	{:else}
		Empty hand
	{/if}
</div>

<style>
	input.card {
		display: inline-block;
		width: 80px;
		margin-top: 50px;
		cursor: pointer;
	}
	input.card.hover:hover {
		margin-top: 0px;
		padding-bottom: 50px;
	}
	input.card.overlap:nth-child(n + 2) {
		margin-left: -56px;
	}
	input.card:not(.overlap) {
		padding: 4px;
	}

	.pulsate {
		border: 2px solid gold;
		animation: pulse 2s infinite;
		animation-direction: alternate;
	}
	@keyframes pulse {
		0% {
			box-shadow: 0 0 0px gold;
		}
		100% {
			box-shadow: 0 0 30px gold;
		}
	}
</style>
