<script>
  import {slide} from "svelte/transition";
  let guideOpen = false;
  let legendOpen = false;
  let TOopen = false;

</script>

<div transition:slide>
  <button tabindex="0" on:click={() => guideOpen = !guideOpen} class="title">
    <span class:guideOpen class="arrow-right"></span>
    Guide
  </button>

  {#if guideOpen}
    <p transition:slide={{y: 200, duration: 500}} class="content">

      To use, click the filter icon on the sidebar to the left. <br><br>

      Select a start and end date, and any other filters
      and click "search". All the tournaments will be shown on the map. <br><br>

      Clicking on a marker will show all the tournament information. Additionally, clicking on the tournament
      icon on the sidebar will show you a list view of the tournaments. You can click on the tournament to pan
      the camera to that tournament. You can search for tournaments by location or name as well.<br><br>


      Found a bug? <a style="cursor: pointer" href="/contact">Contact</a> me
    </p>
  {/if}

  <button tabindex="0" on:click={() => legendOpen = !legendOpen} class="title">
    <span class:legendOpen class="arrow-right"></span>
    Legend
  </button>

  {#if legendOpen}
    <aside transition:slide={{y: 200, duration: 500}} class="content">
      <p>In Smash Mapping, marker colours mean different things.</p>

      <p>The markers and their meanings are:</p>

      <div class="marker">
        <img src="markers/red-marker.png" alt="red-pointer"> Below 50
        attendees
      </div>

      <div class="marker">
        <img src="markers/green-marker.png" alt="green-pointer"> Between 51 and 150 attendees
      </div>

      <div class="marker">
        <img src="markers/blue-marker.png" alt="blue-pointer"> Between 151 and 300 attendees
      </div>

      <div class="marker">
        <img src="markers/orange-marker.png" alt="orange-pointer"> Between 301 and 500 attendees
      </div>

      <div class="marker">
        <img src="markers/purple-marker.png" alt="purple-pointer"> Over 500
        attendees
      </div>

      <div class="marker">
        <img src="markers/special-marker.png" alt="grey-pointer"> Special tournaments for special people (:
      </div>

      <div class="marker">
        <img src="markers/grey-marker.png" alt="grey-pointer"> Tournament is over
      </div>

    </aside>
  {/if}

  <button tabindex="0" on:click={() => TOopen = !TOopen} class="title">
    <span class:TOopen class="arrow-right"></span>
    TO Information
  </button>

  {#if TOopen}
    <div transition:slide={{y: 200, duration: 500}} class="content">
      <p>If you are a TO, getting your tournament onto Smash Mapping is easy (and
        will boost your attendance!)</p>

      <p>The only step is to host your tournament onto <a target="_blank"
                                                          href="https://www.start.gg/">Start.gg.</a>
        Thats all!</p>

      <p>If your tournament isn't on the map, make sure that your tournaments address on Start.gg is a valid
        address that can be found on Google Maps.</p>

      <p>If you are still having trouble, feel free to
        <a target="_blank" href="https://twitter.com/ZedenZeder">contact</a> me!</p>
    </div>
  {/if}

</div>


<style>
  div {
    text-align: left;
    display: block;
  }

  img {
    margin-right: 1em;
  }

  .content {
    margin: 0 5px 5px 5px;
    background: #420000;
    padding: 5px;
    box-shadow: 0 0 1px black;
    border: black solid 1px;
  }

  .marker {
    display: flex;
    align-items: center;
    font-size: 1.05em;
    margin-bottom: 5px;
    font-family: "Kanit", serif;
  }

  p {
    margin-block-start: 0;
    word-break: break-word;
  }

  .title {
    font-family: "Bebas Neue", serif;
    text-align: center;
    font-size: 2.5em;
    color: white;
    margin: 5px 5px 0 5px;
    background: maroon;
    box-shadow: 0 0 6px black;
    width: 98%;
    border: none;

  }

  .title > * {
    margin: auto;
    display: inline-block;
  }

  .arrow-right {
    width: 0;
    height: 0;
    border-top: 12px solid transparent;
    border-bottom: 12px solid transparent;
    border-left: 12px solid black;
    transition: transform 0.1s ease;
    transform: rotate(0);
  }

  .arrow-right.guideOpen,
  .arrow-right.legendOpen,
  .arrow-right.TOopen {
    transform: rotate(90deg);
  }


</style>