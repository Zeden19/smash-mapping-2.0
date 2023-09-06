<script>
    import {user, db, userData} from "$lib/firebase.js";
    import {doc, getDoc, writeBatch} from "firebase/firestore";
    import {signOut} from "firebase/auth";
    import {auth} from "$lib/firebase.js";
    import {storage} from "$lib/firebase";
    import {updateDoc} from "firebase/firestore";
    import {getDownloadURL, ref, uploadBytes} from "firebase/storage";

    // image changing
    let previewURL;
    let uploading = false;

    // bio changing
    let bio;
    let bioChanging = false;

    let username = "";
    let loading = false;
    let isAvailable = false;

    let debounceTimer;

    async function checkAvailability() {
        isAvailable = false;
        clearTimeout(debounceTimer);
        loading = true;

        debounceTimer = setTimeout(async () => {
            const ref = doc(db, "usernames", username);
            const exists = await getDoc(ref).then((doc) => doc.exists());
            isAvailable = !exists;
            loading = false;
        }, 500);
    }

    async function confirmUsername() {
        const batch = writeBatch(db);
        batch.set(doc(db, "usernames", username), {uid: $user?.uid});
        batch.set(doc(db, "users", $user?.uid), {
            username,
            photoURL: $user?.photoURL ?? null,
            published: true,
            bio: "I am a mapper!"
        })
        await batch.commit();
    }

    async function uploadFile(e) {
        uploading = true;
        const file = e.target.files[0];
        previewURL = URL.createObjectURL(file);
        console.log(previewURL)
        const storageRef = ref(storage, `users/${$user.uid}/profile.png`)
        const results = await uploadBytes(storageRef, file);
        const url = await getDownloadURL(results.ref)

        await updateDoc(doc(db, "users", $user.uid), {photoURL: url});
        uploading = false;

    }

    async function changeBio(newBio) {
        clearTimeout(debounceTimer);
        bioChanging = true;

        debounceTimer = setTimeout(async () => {
            await updateDoc(doc(db, "users", $user.uid), {bio: newBio})
            bioChanging = false;
        }, 500)

    }
</script>

{#if $userData?.username}
    <div class="user-settings">
        <h2>Welcome {$user.displayName}</h2>
        <p><strong>Email:</strong> {$user.email}</p>
        <p><strong>Username:</strong> @{$userData.username}</p>

        <form>
            <p><strong>Bio:</strong>
                <input on:input={() => changeBio(bio)} type="text" placeholder="{$userData.bio}"
                       bind:value="{bio}"></p>
        </form>


        <form>
            <p><strong>Profile Picture:</strong></p>
            <img alt="photoURL" src={previewURL ?? $userData?.photoURL ?? "/user.png"} width="96" height="96">
            <input on:change={uploadFile} name="photoURL" type="file"
                   accept="image/png, image/jpeg, image/gif, image/webp"/>
        </form>
    </div>
{:else}
    <h2>Please choose a Username</h2>
    <form on:submit|preventDefault={() => confirmUsername()}>a
        <div class="username">
            <p>Username:</p>
            <input
                    type="text"
                    placeholder="Username"
                    bind:value={username}
                    on:input={() => checkAvailability()}>
        </div>

        <p>Is available? {isAvailable}</p>
        <button>Confirm username @{username}</button>

    </form>
{/if}

<div class="button">
    <a href="/{$userData?.username}">Profile page</a>
    <button on:click={() => signOut(auth)}>Sign out</button>
</div>

<style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@100;600&display=swap');

    .user-settings {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        width: 100%;
        height: 30%;
        margin-top: 10px;
    }

    .user-settings > h2 {
        font-family: "Bebas Neue", serif;
        margin: 0 0 10px 10px;
    }

    .user-settings > p {
        margin-block-start: 0;
        margin-block-end: 0;
        margin-bottom: 10px;
        margin-right: auto;
        word-break: break-all;
    }

    .user-settings > button {
        border-radius: 7px;
        font-size: 1.3em;
        background-color: rgba(0, 0, 0, 0.45);
    }

    .user-settings > button:hover {
        background-color: black;
    }

    .username {
        display: flex;
        margin-left: 5px;
        justify-items: flex-start;
        margin-bottom: 5px;
        gap: 10px;
    }

    p {
        font-family: "Noto Sans", sans-serif;
    }

    .button {
        font-family: "Uni Sans", sans-serif;
        display: flex;
        margin-right: auto;
    }

    a {
        background-color: black;
        border: none;
        color: white;
        padding: 10px 20px 8px 20px;
        font-size: 1.4em;
        margin: 5px 5px 5px 5px;
        border-radius: 20%;
        transition: right 0.5s ease-in-out;
        font-family: "Bebas Neue", serif;
    }
</style>