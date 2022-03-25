<script lang="ts">
  import { renderText, renderTwoTone } from "../../../src/index"

  const renderSystems = [{
    name: "Unicode",
    render: renderTwoTone,
    lineSpacing: "1.1rem",
    tracking: "-0.05em"
  }, {
    name: "ASCII",
    render: renderText,
    lineSpacing: ".75rem",
    tracking: "0"
  }]


  let selectedRenderSystem = renderSystems[0]
  let value = ""

</script>
<div class="flex flex-row h-screen w-screen">
  <div class="h-full flex-grow">
    <input placeholder="https://example.com" class="flex-grow w-full text-center" bind:value={value}>
    <h1 class="font-mono text-center my-10" style="
    line-height: {selectedRenderSystem.lineSpacing};
    letter-spacing: {selectedRenderSystem.tracking}
    ">
      {@html selectedRenderSystem
        .render(value || "https://example.com")
        .replaceAll("\n", "<br/>")
        .replaceAll(" ", "&nbsp;")
      }
    </h1>
  </div>
  <div class="flex-shrink flex flex-col w-32 border-l-4 border-gray-300">
    {#each renderSystems as renderSystem, i}
      <div tabindex={i} class="
        w-full {selectedRenderSystem == renderSystem ? "bg-gray-200" : "bg-gray-100"} hover:bg-gray-300
        hover:cursor-pointer transition-colors p-4
      " on:click={() => {selectedRenderSystem = renderSystem}}>{renderSystem.name}</div>
    {/each}
  </div>
</div>