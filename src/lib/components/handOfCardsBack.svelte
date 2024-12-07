<script lang="ts">
	let {
		cardsInfo,
		actualScore = 0,
		declaredScore = 0,
		isUpNext = false
	}: {
		cardsInfo: {
			playerId: number;
			playerName: string;
			noOfCards: number;
		};
		declaredScore: number;
		actualScore: number;
		isUpNext: boolean;
	} = $props();
</script>

<div class="rounded-sm border-2 border-red-500 p-2" class:next-turn={isUpNext}>
	{#if cardsInfo}
		{#each { length: cardsInfo.noOfCards } as __, _}
			<img class="card overlap" src={`../cards/BLUE_BACK.svg`} alt="O" />
		{/each}

		<p class="font-semibold">
			{cardsInfo.playerName}<span class="text-muted-foreground">#{cardsInfo.playerId}</span>
			| Score: {actualScore}/{declaredScore}
		</p>
	{:else}
		Empty hand
	{/if}
</div>

<style>
	img.card {
		display: inline-block;
		width: 80px;
	}
	img.card.overlap:nth-child(n + 2) {
		margin-left: -56px;
	}

	.next-turn {
		border: 2px solid gold;
		animation: pulse 1s infinite;
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
