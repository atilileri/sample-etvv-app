<script setup lang="ts">
import { reactive, ref } from "vue";
import {routes as rt} from "../../common/common" // todo - move this to vite.config.ts
// Global constant containing the API base URL -> /api
const baseURL = __API_PATH__; // todo - duplicate of rt.api, commonalize

// On page load, try to fetch auth code from current browser search URL
const args = new URLSearchParams(window.location.search);
const code = args.get('code');

// If we find a code, we're in a callback, do a token exchange
if (code) {
  // Remove code from URL so we can refresh correctly.
  const url = new URL(window.location.href);
  // todo - currently callback is to spt/cb. Do we really need that? Just return to root
  // url.searchParams.delete("code");
  // const updatedUrl = url.search ? url.href : url.href.replace('?', '');
  window.history.replaceState({}, document.title, url.origin /*was updatedUrl*/);

  window.onload = async function() {
    if (code) {
      isLoading.value = true;
      var res = await fetch(`${baseURL}/${rt.spotify}/${rt.callback}?${new URLSearchParams({code: code})}`);
      // todo - load playlists into page
      message.value = (await res.json()).userInfo;
      isLoading.value = false;
    }
  };
}

// Reactive variables for managing loading state and response message
const isLoading = ref(false);
const message = ref("");

// Function to fetch data from the server
async function fetchAPI(endpoint:string="") {
  try {
    // Set loading state to true
    isLoading.value = true;
    
    const relURL = `${baseURL}/${endpoint}`;
    
    console.log(`fetch: ${relURL}`);
    // Send a GET request to the server
    var response = await fetch(relURL);

    // Parse the JSON response
    var data = await response.json();
    console.log(`Auth URL: ${data.authURL}`);

    // todo - move this function outside, don't use fetch to login, make a separate function
    const scope = 'user-read-private user-read-email';
    const clientId = '6ed196785dbb45bcb629ccc36aeab596'; // todo - move to common
    const authorizationEndpoint = "https://accounts.spotify.com/authorize";
    const authUrl = new URL(authorizationEndpoint)
    const params = {
      response_type: 'code',
      client_id: clientId,
      scope: scope,
      code_challenge_method: 'S256',
      redirect_uri: `http://localhost:5173/${rt.spotify}/${rt.callback}`, // todo - this callback is wrong. whole redesign might be needed. INSERT /api
    };

  authUrl.search = new URLSearchParams(params).toString();
  window.location.href = authUrl.toString(); // Redirect the user to the authorization server for login

  } catch (error) {
    // Handle errors
    message.value = "Error fetching data";
    console.error(error);
  } finally {
    // Reset loading state
    isLoading.value = false;
  }
}

</script>

<template>
  <!-- Button to trigger the fetchAPI function -->
   <div style="display: block;">
    <div>
      <button @click="fetchAPI()">Fetch</button>
      <button @click="fetchAPI(rt.spotify)">Spotify</button>
      <button @click="fetchAPI(rt.youtubeMusic)">Youtube Music</button>
    </div>
    <div>
      <!-- Display loading message while fetching data -->
      <p v-if="isLoading">Loading...</p>

      <!-- Display the response message if available -->
      <pre v-else-if="message">{{ message }}</pre>
    </div>
  </div>
</template>
