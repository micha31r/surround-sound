// Function to make API calls to Spotify
async function fetchSpotify({ headers, endpoint, method, body, token }) {
  const res = await fetch(`https://api.spotify.com/${endpoint}`, {
    mode: 'cors',
    headers: {
      Authorization: `Bearer ${token}`,
      ...headers
    },
    method,
    body: typeof(body) === "string" ? body : JSON.stringify(body)
  })

  // console.log(res)

  try {
    return await res.json()
  } catch (error) {
    console.log(error)
    return null
  }
}

// Get a song based on song title
export async function getSong(title, token) {
  const results = [];

  const res = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(title)}&type=track`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  if (data?.tracks?.items?.length) {
    return data.tracks.items[0]
  }

  return null
}

// Get songs based on song title
export async function getSongs(songs, token) {
  const results = [];

  for (const { artist, song } of songs) {
    const res = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(song)}&type=track`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const data = await res.json()
    if (data?.tracks?.items?.length) {
      results.push(data.tracks.items[0])
    }
  }

  return results
}

// Create and Display Playlist
export async function createPlaylist({ name, description, image, songs, userId, token }) {
  const songURIs = songs.map(song => song.uri)

  const res = await fetchSpotify({
    endpoint: `v1/users/${userId}/playlists`, 
    method: 'POST',
    body: {
      name,
      description,
      public: false
    },
    token: token
  })

  // Add songs to the playlist
  await fetchSpotify({
    endpoint: `v1/playlists/${res.id}/tracks`,
    method: 'POST',
    body: {
      uris: songURIs
    },
    token: token
  })

  // Set playlist image
  await fetchSpotify({
    headers: {
      "Content-Type": "image/jpeg"
    },
    endpoint: `v1/playlists/${res.id}/images`,
    method: 'PUT',
    body: image.replace("data:image/jpeg;base64,", ""),
    token: token
  })

  // Return playlist ID
  return res.id
}

// Get a playlist based on ID
export async function getPlaylist({ playlistId, token }) {
  const res = await fetchSpotify({
    endpoint: `v1/playlists/${playlistId}`, 
    method: 'GET',
    token: token
  })

  return res
}

export async function getTopArtists({ token }) {
  const res = await fetchSpotify({
    endpoint: `v1/me/top/artists`, 
    method: 'GET',
    token: token
  })

  return res
}