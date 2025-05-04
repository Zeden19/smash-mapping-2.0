<script>
  import {onMount} from "svelte";
  import {enhance} from "\$app/forms";
  import MultiSelect from 'svelte-multiselect'
  import {fade} from 'svelte/transition';
  import {blur} from "svelte/transition";
  import GamesSlot from "./GamesSlot.svelte";
  import {
    startDate,
    endDate,
    country,
    errorMessage,
    minAttendees,
    state,
    game,
    loading,
    noData,
    tooManyRequestsError,
    locationDeniedError,
    useCurrentLocationSearch,
    circles,
    radius,
    selectedPlayer
  } from "../../stores.js";
  import {games} from "$lib/vars.js";

  let minDate = new Date();
  minDate.setDate(minDate.getDate() - 14);
  minDate = minDate.toISOString().split("T")[0];
  $endDate = new Date($endDate).toISOString().split("T")[0];

  export let map;
  export let form;

  let screenSize;
  let innerCircle;
  let outerCircle;
  let pos;
  let browserFailure = false;

  let formRoute = "?/countrySearch"

  function validationChecks() {

    if ($startDate > $endDate) {
      alert("Start date must be before end date.");
      return false;
    }

    if ($endDate === undefined || $startDate === undefined) {
      alert("Please enter an end date.");
      return false;
    }

    if (isNaN($minAttendees)) {
      alert("Please enter a valid number for minimum attendees.");
      return false;
    }

    if ($minAttendees < 0) {
      alert("Minimum attendees must be greater than or equal to 0.");
      return false;
    }

    if ($state === "Choose State" && $country === "US" && !$useCurrentLocationSearch) {
      alert("Please select a state.");
      return false;
    }

    if ($useCurrentLocationSearch && radius === undefined) {
      alert("Please select a radius range.");
      return false;
    }
    return true;
  }

  function removeCircles() {
    for (const i in $circles) {
      $circles[i].setMap(null, map);
    }
    $circles = [];
  }

  async function drawCircles() {
    if ($circles.length > 0) {
      removeCircles();
    }

    await getPosition();
    map.panTo(pos);

    // inne circle representing the search radius
    outerCircle = new google.maps.Circle({
      strokeColor: "#000000",
      strokeOpacity: 1,
      strokeWeight: 2.5,
      fillColor: "#FF0000",
      fillOpacity: 0.50,
      map,
      center: pos,
      radius: $radius * 1609
    });

    // small circle for the current location
    innerCircle = new google.maps.Circle({
      strokeColor: "#000000",
      strokeOpacity: 1,
      strokeWeight: 2.5,
      fillColor: "#000000",
      fillOpacity: 1,
      map,
      center: pos,
      radius: 1000,
    });
    $circles.push(innerCircle);
    $circles.push(outerCircle);
  }

  function getPosition() {
    $loading = true;
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            resolve(pos)
            $locationDeniedError = false;
            $loading = false;

          },
          (error) => {
            $locationDeniedError = true;
            $useCurrentLocationSearch = false;
            $loading = false;
            reject(error);
          },
          {timeout: 6000, enableHighAccuracy: true, maximumAge: Infinity}
        );
      } else {
        $loading = false;
        $useCurrentLocationSearch = false;
        browserFailure = true;
        reject(new Error('Geolocation is not supported in this browser.'));
      }
    });

  }

  onMount(() => {
    $useCurrentLocationSearch ? drawCircles() : removeCircles()
  })

  $: formRoute = $useCurrentLocationSearch ? "?/locationSearch" : "?/countrySearch"
</script>

<svelte:window bind:innerWidth={screenSize}/>

<aside in:blur={{duration: 300}}>
  <form use:enhance={async ({cancel, formData}) => {
        $tooManyRequestsError = false;
        $errorMessage = false;
        $noData = false;
        $locationDeniedError = false;
        browserFailure = false;

        if (form?.error) {
            form.error = undefined
        }
        $loading = true;
        $selectedPlayer = "";

         if ($game.length === 0) {
            $game = games;
        }
          if ($useCurrentLocationSearch) {
                await getPosition();
                $loading = true;
                formData.set("lat", pos.lat)
                formData.set("lng", pos.lng)
                map.panTo(pos);
        }

        if (!validationChecks()) {
            $loading = false;
            cancel();
        }

        return async ({update}) => {
            await update({reset: false});
            $loading = false;
        };
    }} method="POST" action={formRoute}>

    <!--Games-->
    <div class="filter-item">
      <label for="games">Game(s):</label>
      <MultiSelect id="games" --sms-width="70%" --sms-text-color="black" --sms-bg="white"
                   --sms-remove-btn-hover-color="red" placeholder="Select Game(s)"
                   --sms-border="2px solid black" --sms-options-border="1px solid black"
                   --sms-font-size="12px" --sms-selected-li-padding="2px"
                   bind:selected={$game} options={games} let:option name="game">
        <GamesSlot {option}/>
      </MultiSelect>
    </div>


    <!--Country-->
    {#if !$useCurrentLocationSearch}
      <div class="filter-item">
        <label for="country">Country: </label>
        <select class="input" id="country" name="country" disabled="{$useCurrentLocationSearch}" bind:value={$country}>
          <option disabled>---NORTH AMERICA---</option>
          <option selected value="US">USA</option>
          <option value="CA">Canada</option>
          <option value="MX">Mexico</option>
          <option disabled>---EUROPE---</option>
          <option value="ES">Spain</option>
          <option value="GB">United Kingdom</option>
          <option value="IE">Ireland</option>
          <option value="FR">France</option>
          <option value="NL">Netherlands</option>
          <option value="DK">Denmark</option>
          <option value="DE">Germany</option>
          <option value="CH">Switzerland</option>
          <option value="IT">Italy</option>
          <option value="SE">Sweden</option>
          <option value="NO">Norway</option>
          <option value="FI">Finland</option>
          <option disabled>---OTHER---</option>
          <option value="JP">Japan</option>
          <option value="CN">China</option>
          <option value="AU">Australia</option>
          <option value="BR">Brazil</option>
        </select>
      </div>
    {/if}

    <!--State-->
    {#if !$useCurrentLocationSearch && $country === 'US'}
      <div class="filter-item">
        <label for="state">State:</label>
        <select class="input" id="state" name="state" disabled="{$useCurrentLocationSearch}" bind:value={$state}>
          <option selected disabled>Choose State</option>
          <option value="AL">Alabama</option>
          <option value="AK">Alaska</option>
          <option value="AZ">Arizona</option>
          <option value="AR">Arkansas</option>
          <option value="CA">California</option>
          <option value="CO">Colorado</option>
          <option value="CT">Connecticut</option>
          <option value="DE">Delaware</option>
          <option value="DC">District Of Columbia</option>
          <option value="FL">Florida</option>
          <option value="GA">Georgia</option>
          <option value="HI">Hawaii</option>
          <option value="ID">Idaho</option>
          <option value="IL">Illinois</option>
          <option value="IN">Indiana</option>
          <option value="IA">Iowa</option>
          <option value="KS">Kansas</option>
          <option value="KY">Kentucky</option>
          <option value="LA">Louisiana</option>
          <option value="ME">Maine</option>
          <option value="MD">Maryland</option>
          <option value="MA">Massachusetts</option>
          <option value="MI">Michigan</option>
          <option value="MN">Minnesota</option>
          <option value="MS">Mississippi</option>
          <option value="MO">Missouri</option>
          <option value="MT">Montana</option>
          <option value="NE">Nebraska</option>
          <option value="NV">Nevada</option>
          <option value="NH">New Hampshire</option>
          <option value="NJ">New Jersey</option>
          <option value="NM">New Mexico</option>
          <option value="NY">New York</option>
          <option value="NC">North Carolina</option>
          <option value="ND">North Dakota</option>
          <option value="OH">Ohio</option>
          <option value="OK">Oklahoma</option>
          <option value="OR">Oregon</option>
          <option value="PA">Pennsylvania</option>
          <option value="RI">Rhode Island</option>
          <option value="SC">South Carolina</option>
          <option value="SD">South Dakota</option>
          <option value="TN">Tennessee</option>
          <option value="TX">Texas</option>
          <option value="UT">Utah</option>
          <option value="VT">Vermont</option>
          <option value="VA">Virginia</option>
          <option value="WA">Washington</option>
          <option value="WV">West Virginia</option>
          <option value="WI">Wisconsin</option>
          <option value="WY">Wyoming</option>
          <option value="all">All</option>
        </select>
      </div>
    {/if}

    <!--Using Current Location-->
    <div class="filter-item">
      <label for="useCurrentLocation">Use Current Location:</label>
      <!-- reverse value of  useCurrentLocationSearch because on:input gets run b4 variable changes -->
      <input id="useCurrentLocation" name="useCurrentLocation" class="current-location-checkbox input" type="checkbox"
             bind:checked={$useCurrentLocationSearch}
             on:input={() => !$useCurrentLocationSearch ? drawCircles() : removeCircles()}/>

    </div>

    <!--Radius-->
    {#if $useCurrentLocationSearch}
      <div class="filter-item">
        <label for="radius">Radius: </label>
        <select class="input" id="radius" name="radius" on:input={() => drawCircles()} bind:value={$radius}>x
          <option selected value="25">25 miles</option>
          <option value="50">50 miles</option>
          <option value="100">100 miles</option>
          <option value="250">250 miles</option>
          <option value="500">500 miles</option>
          <option value="1000">1000 miles</option>
        </select>
        <input name="pos" value={pos} type="hidden">
      </div>
    {/if}

    <!--From Date-->
    <div class="filter-item">
      <label for="startDate"> From: </label>
      <input class="input" required id="startDate" name="startDate" min={minDate} bind:value={$startDate} type="date">
    </div>

    <!--To Date-->
    <div class="filter-item">
      <label for="endDate"> To: </label>
      <input class="input" required id="endDate" name="endDate" min="{$startDate}" bind:value={$endDate} type="date">
    </div>

    <!--Attendees-->
    <div class="filter-item">
      <label for="attendees">Attendees: </label>
      <input class="input" required id="attendees" name="attendees" type="number" min="0" step="1"
             bind:value={$minAttendees}>
    </div>

    <button class="search-button" disabled={$loading}>Search</button>
  </form>


  <div class="bottom">
    <p>{$loading ? "Loading..." : ""}</p>

    <p class="error">{form?.error ? form.error : ""}</p>

    <p class="error">{browserFailure ? "This browser does not support this feature" : ""}</p>

    <p class="error">{$errorMessage ? "There was an error loading the map" : ""}</p>

    <p class="error">{$noData ? "No tournaments found" : ""}</p>

    <p class="error">{$tooManyRequestsError ? "You cannot search for more than 150 tournaments" : ""}</p>

    <p class="error">{$locationDeniedError ? "You must allow location access to use this feature" : ""}</p>
  </div>
</aside>


<style>
  form {
    width: 100%;
  }

  aside {
    font-family: "Kanit", serif;
    padding: 5px 0 5px 5px;
    justify-items: left;
    text-align: left;
  }

  .filter-item {
    white-space: normal;
    width: 100%;
    display: flex;
    justify-content: space-between;
    margin-bottom: 5px;
    gap: 5px;
  }

  .input {
    border-radius: 5px;
    border: 2px solid black;
    margin-right: 5px;
    width: 50%;
  }

  .current-location-checkbox {
    width: 10%;
  }

  label {
    margin-bottom: 5px;
    margin-top: 5px;
  }

  .error {
    color: red;
    white-space: normal;
  }


  .bottom {
    display: block;
    white-space: normal;
  }

  :global(div.multiselect) {
    margin-right: 5px !important;
  }

  :global(div.multiselect > ul.options > li) {
    border-bottom: 1px black solid;
  }

  @media (max-width: 500px) {

    .input {
      width: 70%;
    }

    .current-location-checkbox {
      width: 10%;
    }
  }

  @media (min-width: 500px) and (max-width: 1000px) {

    .current-location-checkbox {
      width: 10%;
    }
  }
</style>
