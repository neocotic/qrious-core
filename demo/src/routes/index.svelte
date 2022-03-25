<script lang="ts">
  import { renderText, renderTwoTone } from "../../../src/index"

  const renderSystems = [{
    name: "ASCII",
    render: renderText,
    lineSpacing: ".75rem"
  }, {
    name: "Unicode",
    render: renderTwoTone,
    lineSpacing: "1rem"
  }]


  let selectedRenderSystem = renderSystems[0]

  let value = "https://example.com"
</script>
<div class="flex">
  <select class="flex-shrink" bind:value={selectedRenderSystem}>
    {#each renderSystems as renderSystem}
      <option value={renderSystem}>
        {renderSystem.name}
      </option>
    {/each}
  </select>
  <input class="flex-grow" bind:value={value}>
</div>
<h1 class="font-mono" style="line-height: {selectedRenderSystem.lineSpacing}">
  {@html selectedRenderSystem?.render(value)?.replaceAll("\n", "<br/>")?.replaceAll(" ", "&nbsp;")}
</h1>