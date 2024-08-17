// Fetch User's Top Tracks
const token = 'TOKEN';

// Function to make API calls to Spotify
async function fetchWebApi(endpoint, method, body) {
  const res = await fetch(`https://api.spotify.com/${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    method,
    body: JSON.stringify(body)
  });
  return await res.json();
}

// Function to get the user's top tracks
async function getTopTracks() {
  return (await fetchWebApi('v1/me/top/tracks?time_range=short_term&limit=20', 'GET')).items;
}

// Generate Recommendations with OpenAI
import { OpenAI } from "openai";

const client = new OpenAI();

// Function to get recommendations based on mood, image URL, and top tracks
async function getRecommendations(mood, imageUrl, topTracks) {
  try {
    const thread = await client.beta.threads.create();
    const messageContent = [
      {
        type: "text",
        text: `<${mood}> <${topTracks.map(track => track.artists[0].name).join(', ')}> <${imageUrl}>`,
      },
      {
        type: "image_url",
        image_url: { url: imageUrl },
      },
    ];

    const message = await client.beta.threads.messages.create(thread.id, {
      role: "user",
      content: messageContent,
    });

    const run = await client.beta.threads.runs.createAndPoll(thread.id, {
      assistant_id: "asst_ogSQGhM8tBmyeww08BeMYf0d",
      instructions: "",
    });

    if (run.status === "completed") {
      const messages = await client.beta.threads.messages.list(thread.id);
      const out = messages.data[0].content[0].text.value;
      return JSON.parse(out); // Assuming the output is a JSON string
    } else {
      console.log(run.status);
      return null;
    }
  } catch (error) {
    console.error("An error occurred:", error);
    return null;
  }
}

// Search for Songs on Spotify
async function searchTracks(trackNames) {
  const trackUrls = [];

  for (const trackName of trackNames) {
    const searchRes = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(trackName)}&type=track`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await searchRes.json();
    if (data.tracks.items.length > 0) {
      trackUrls.push(data.tracks.items[0].uri);
    }
  }

  return trackUrls;
}

// Create and Display Playlist
async function createPlaylist(name, description, trackUris) {
  const userRes = await fetchWebApi('v1/me', 'GET');
  const userId = userRes.id;

  const playlistRes = await fetchWebApi(`v1/users/${userId}/playlists`, 'POST', {
    name,
    description,
    public: false
  });

  const playlistId = playlistRes.id;

  await fetchWebApi(`v1/playlists/${playlistId}/tracks`, 'POST', {
    uris: trackUris
  });

  return playlistId;
}

// Function to display the playlist in an iframe
function displayPlaylist(playlistId) {
  return (
    <iframe
      title="Spotify Embed: Recommendation Playlist"
      src={`https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=0`}
      width="100%"
      height="100%"
      style={{ minHeight: '360px' }}
      frameBorder="0"
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
    />
  );
}

// Main function to execute the app logic
async function main() {
  const mood = "Happy"; // Example mood
  const imageUrl = "https://example.com/image.jpg"; // Example image URL

  const topTracks = await getTopTracks();
  const recommendations = await getRecommendations(mood, imageUrl, topTracks);

  if (recommendations) {
    const { trackNames, playlistName, playlistDescription } = recommendations;
    const trackUris = await searchTracks(trackNames);

    // Display the playlist preview
    const preview = displayPlaylist(trackUris);
    console.log(preview);

    // Save the playlist when user confirms
    const saveButton = document.getElementById("saveButton");
    saveButton.addEventListener("click", async () => {
      const playlistId = await createPlaylist(playlistName, playlistDescription, trackUris);
      console.log(`Playlist created: ${playlistId}`);
    });
  }
}

main();
