<script setup lang="ts">
import { reactive, ref } from "vue";

// Global constant containing the API base URL -> /api
const baseURL = __API_PATH__;

// Reactive variables for managing loading state and response message
const isLoading = ref(false);
const message = ref("");

// Function to fetch data from the server
async function fetchAPI(endpoint:string="") {
  try {
    // Set loading state to true
    isLoading.value = true;
    
    const relURL = baseURL + "/" + endpoint;
    console.log(relURL);

    // Send a GET request to the server
    const response = await fetch(relURL);

    // Parse the JSON response
    const data = await response.json();
    console.log(data);

    // Update the message with the response data
    message.value = relURL + " says : \n" + JSON.stringify(data);
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
      <button @click="fetchAPI('spt')">Spotify</button>
      <button @click="fetchAPI('ytm')">Youtube Music</button>
    </div>
    <div>
      <!-- Display loading message while fetching data -->
      <p v-if="isLoading">Loading...</p>

      <!-- Display the response message if available -->
      <pre v-else-if="message">{{ message }}</pre>
    </div>
  </div>
</template>
