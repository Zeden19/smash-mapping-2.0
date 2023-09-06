<script lang="ts">
    export let data

</script>

<svelte:head>
    <title>Smash Mapping | @{data.username}</title>
    <meta name="description" content={data.bio}>
</svelte:head>

<main>
    <p style="position: absolute">I know this page is really empty....</p>
    <div class="user-info">
        <h1>@{data.username}</h1>
        <img src={data.photoURL ?? "/user.png"} alt="photoURL" width="256"/>
        <p>{data.bio}</p>
    </div>
</main>

<style>
    * {
        background-color: #26282B;
    }

    main {
        height: 93vh;
        color: white;
    }

    h1 {
        color: #0092ff;
    }

    .user-info {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }
</style>