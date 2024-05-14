<script lang="ts">
  export let option
  export let idx
  export let height = `20px`
  export let gap = `5pt`

  let hidden = false

</script>

<span style:gap>
  <img src={option.src} {height} alt={option} {hidden} on:error={() => (hidden = true)} />
  {option.label}
</span>

<style>
  span {
    display: flex;
  }
</style>