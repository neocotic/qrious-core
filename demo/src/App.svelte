<script lang="ts">
  import { renderCanvas } from '../../src/index'
  import { onMount } from "svelte";

  let canvas: HTMLCanvasElement

  onMount(() => {
    renderCanvas("hi", canvas);
  })
</script>

<canvas bind:this={canvas}></canvas>
<p></p>