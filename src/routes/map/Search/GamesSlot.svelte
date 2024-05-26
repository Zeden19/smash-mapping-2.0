<script lang>
  export let option;
  export let height = `16px`;

  let hidden = false

</script>

<span>
  <img src={option.src} {height} alt={option.label} {hidden} on:error={() => (hidden = true)} />
  {option.label}
</span>

<style>
  span {
    display: flex;
    align-items: center;
    gap: 2px;
  }
</style>