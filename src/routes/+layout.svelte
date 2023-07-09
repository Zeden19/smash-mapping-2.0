<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Kanit:wght@300&display=swap" rel="stylesheet">
<script>
    import '../app.css'
    import {page} from "$app/stores";
    import {dev} from '$app/environment';
    import {inject} from '@vercel/analytics';

    inject({mode: dev ? 'development' : 'production'});
</script>

<nav id="nav">
    <h2>Smash Mapping <img class="title-marker" src="markers/red-marker.png" alt="red-marker"></h2>
    <ul id="navigation">
        <li class:selected="{$page.url.pathname === '/'}"><a href="/">Home</a></li>
        <li class:selected="{$page.url.pathname === '/about'}"><a href="/about">About</a></li>
        <li class:selected="{$page.url.pathname === '/contact'}"><a href="/contact">Contact</a></li>
    </ul>
</nav>

<slot/>


<style>
    nav {
        background-color: #26282B;
        padding: 10px;
        height: 4%;
        display: flex;
        align-items: center;
        border-bottom: #222223 3px solid;
    }

    nav a {
        padding: 0 1em;
        text-decoration: none;
        color: white;
        font-family: 'Bebas Neue', sans-serif;
    }

    nav ul {
        list-style-type: none;
        display: flex;
        flex-wrap: nowrap;
        padding-inline-start: 0;
        justify-content: right;
        padding-top: 8px;
    }

    nav li {
        letter-spacing: 1px;
        font-size: 1.8em;
        display: inline;
        background: none;
        margin-inline: 10px;
        padding: 2px;
        border-radius: 10px;
    }

    nav h2 {
        font-family: Impact, serif;
        font-size: 2.3em;
        font-style: italic;
        color: white;
        white-space: nowrap;
        display: flex;
        align-items: center;
    }

    .title-marker {
        rotate: 17deg;
        margin-left: 7px;
    }

    nav a:hover {
        color: red;
    }

    .selected {
        text-decoration: underline white solid 2px;
        text-underline-offset: 6px;
    }


    /*small screens*/
    @media (max-width: 500px) {
        nav h2 {
            margin: 5px 1.5vw 5px 5px;
            font-size: 2.6vh;
            white-space: normal;
        }

        .title-marker {
            width: 11px;
            height: 20px;
            flex-shrink: 0;
            margin-left: 0;
        }

        nav li {
            font-size: 6vw;
            margin-inline: 12px;
        }

        nav a {
            padding: 0
        }
    }

    /*large screens*/
    @media (min-width: 500px) {
        nav h2 {
            margin: 5px 3em 0 3em;
        }
    }
</style>