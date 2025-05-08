<script>
  import {blur} from 'svelte/transition';
  import {enhance} from "$app/forms";
  import {errorMessage, loading, noData, tooManyRequestsError} from "../../stores.js"

  export let form;

  let formElement;
  let timer;

  let search;
  let searchResults;

  const debounce = (key) => {
    clearTimeout(timer);

    if (search === '') {
      return;
    }

    timer = setTimeout(() => {
      if (search && key !== "Enter") {
        formElement.requestSubmit();
      }
    }, 750);
  }
</script>


<aside in:blur={{duration: 300}}>
  <div class="search">
    <form class="search-player-form" on:submit={() => clearTimeout(timer)} action="?/nameSearch" method="post"
          bind:this={formElement} use:enhance={async ({}) => {
            $loading = true;
            return async ({update, result : {data}}) => {
                await update({reset: false});
                $loading = false;
                if (!data.error) searchResults = data;
                else searchResults = undefined;
            };
        }}>
      <input bind:value={search} on:keyup={({key}) => debounce(key)}
             type="text"
             placeholder="Search by Tournament name"
             name="tournamentName"/>
    </form>
  </div>

  <div class="bottom">
    <p>{$loading ? "Loading..." : ""}</p>

    <p class="error">{form?.error ? form.error : ""}</p>

    <p class="error">{$errorMessage ? "There was an error loading the map" : ""}</p>

    <p class="error">{$noData ? "No tournaments found" : ""}</p>

    <p class="success">{searchResults ? "Successfully found tournaments" : ""}</p>

    <p class="error">{$tooManyRequestsError ? "You cannot search for more than 90 tournaments" : ""}</p>
  </div>

</aside>


<style>
  aside {
    overflow: scroll;
    height: 60%;
    font-family: "Kanit", serif;
    padding: 5px 0 5px 5px;
    white-space: nowrap;
    justify-items: left;
    text-align: left;
    position: relative;
    z-index: 0;
  }

  .search-player-form {
    position: relative;
    width: 100%;
  }

  .search {
    max-height: 60%;
    width: 100%;
    display: flex;
    flex-direction: column;
    position: relative;
    z-index: 1;
  }

  .search > form > input {
    font-size: 16px;
    width: 95%;
  }


  .error {
    color: red;
    white-space: normal;
  }

  .success {
    color: limegreen;
    white-space: normal;
  }

  .bottom {
    display: block;
    white-space: normal;
    position: sticky;
  }
</style>
