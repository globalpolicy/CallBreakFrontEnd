<script lang="ts">
	import type { Snippet } from 'svelte';
	let { onClickHandler, children }: { onClickHandler: Function; children: Snippet } = $props();
</script>

<!-- ref: https://codepen.io/androidcss/pen/yOopGp -->

<button
	class="float"
	onclick={() => {
		onClickHandler();
	}}
>
	{@render children()}
</button>

<style>
	.float {
		position: fixed;
		width: 60px;
		height: 60px;
		bottom: 40px;
		right: 40px;
		background-color: #0c9;
		color: #fff;
		border-radius: 50px;
		text-align: center;
		box-shadow: 2px 2px 3px #999;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	/* .my-float {
		margin-top: 22px;
	} */
</style>
