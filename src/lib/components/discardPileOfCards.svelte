<script lang="ts">
	let {
		cards,
		animateFlag = false,
		onAnimationOver
	}: {
		cards: Array<{
			playerId: number;
			playerName: string;
			cardName: string;
		}>;
		animateFlag: boolean;
		onAnimationOver:()=>void
	} = $props();

	$effect(() => {
		if (cards && cards.length > 0) {
			for (const htmlElement of document.getElementsByClassName('card')) {
				htmlElement.addEventListener('animationend', () => {
					onAnimationOver(); // this should hopefully be the call to empty out the discard pile i.e. the cards prop
				});
			}
		}
	});
</script>

<div class="rounded-sm border-2 border-red-500 p-2">
	{#if cards.length > 0}
		{#each cards as card}
			<img
				class="card tight"
				class:animate={animateFlag}
				src={`../cards/${card.cardName}.svg`}
				title={card.playerName + '#' + card.playerId}
				alt={card.cardName}
			/>
		{/each}
	{:else}
		Empty discard pile
	{/if}
</div>

<style>
	img.card {
		display: inline-block;
		width: 80px;
		margin-top: 50px;
		cursor: pointer;
		padding: 4px;
	}
	img.card.tight {
		margin-top: 0px;
	}
	img.card.animate {
		animation-name: move-to-winner;
		animation-duration: 1s;
		animation-timing-function: ease-in;
		animation-fill-mode: forwards;
		animation-delay: 1s;
	}
	@keyframes move-to-winner {
		50% {
			opacity: 80%;
		}
		100% {
			transform: translate(var(--delX, 0px), var(--delY, 0px));
			opacity: 0%;
		}
	}
</style>
