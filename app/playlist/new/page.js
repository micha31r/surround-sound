'use client'
import { useRouter } from "next/navigation"
import { useContext, useEffect, useState } from "react"
import { AuthContext } from "@/components/context"
import { getSong } from "@/lib/spotify/songs"
import Image from "next/image"
import Section from "@/components/Section"
import { Button } from "@/components/ui/button"
import { createPlaylist } from "@/lib/spotify/songs"
import { CameraIcon, PlusCircleIcon } from "@heroicons/react/24/solid"
import { createFBPlaylist } from "@/lib/firebase/playlist"
import { db } from "@/lib/firebase/clientApp"
import SpotifyPlayer from "@/components/SpotifyPlayer"

// Convert image URL to base64
// https://stackoverflow.com/questions/22172604/convert-image-from-url-to-base64
async function URLToBase64(url) {
  const data = await fetch(url)
  const blob = await data.blob()

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(blob)
    reader.onloadend = () => {
      const base64data = reader.result
      resolve(base64data)
    }
    reader.onerror = reject
  })
}

function formatDuration(ms) {
  let totalSeconds = Math.floor(ms / 1000);
  let minutes = Math.floor(totalSeconds / 60);
  let seconds = totalSeconds % 60;

  // Add leading zero to seconds if needed
  let formattedSeconds = seconds < 10 ? '0' + seconds : seconds;

  return `${minutes}:${formattedSeconds}`;
}

export default function NewPlaylistPage() {
  const router = useRouter()
  const auth = useContext(AuthContext)
  const [title, setTitle] = useState("")
  const [summary, setSummary] = useState("")
  const [image, setImage] = useState("")
  const [songs, setSongs] = useState([])
  const [currentTrackURI, setCurrentTrackURI] = useState(null)
  const [allowPlaylistSave, setAllowPlaylistSave] = useState(true)

  const playlistString = localStorage.getItem('playlistSongs')
  const playlistImageURL = localStorage.getItem('playlistImageURL')
  const playlistImagePath = localStorage.getItem('playlistImagePath')
  const spotifyAccessToken = localStorage.getItem('spotifyAccessToken')

  useEffect(() => {
    if (!playlistString || !playlistImageURL || !playlistImagePath || !spotifyAccessToken || !auth.user) {
      return
    }

    (async () => {
      try {
        // Set playlist cover image
        const imageData = await URLToBase64(playlistImageURL)
        setImage(imageData)

        // Get generated playlist data
        const playlist = JSON.parse(playlistString)
        setTitle(playlist.playlistTitle)
        setSummary(playlist.summary)
  
        for (const { song, artist } of playlist.songs) {
          const data = await getSong(song, spotifyAccessToken)
          setSongs((songs) => [...songs, data])
        }
       
      } catch (error) {
        throw error
      }
    })()
  }, [])


  if ((!playlistString || !playlistImageURL || !playlistImagePath)) {
    // Redirect to the dashboard if there are no playlist songs
    router.push("/dashboard")
    return null
  }

  if (!spotifyAccessToken || !auth.user) {
    // Redirect to login if auth is not valid
    router.push("/login")
    return null
  }

  async function savePlaylistCallback() {
    const spotifyUserId = auth.user.uid.split(":")[1]

    if (spotifyUserId) {
      setAllowPlaylistSave(false)

      const playlistId = await createPlaylist({
        name: title,
        description: summary,
        image: image,
        songs: songs,
        userId: spotifyUserId,
        token: spotifyAccessToken,
      })

      await createFBPlaylist(db, {
        userId: auth.user.uid,
        imagePath: playlistImagePath,
        spotifyPlaylistId: playlistId,
        mood: "happy",
      })

      router.push('/playlist/' + playlistId)
    }
  }

  return (
    <main className="w-full h-svh space-y-8">
      <Section className="flex-1" classNameInner="gap-3">
        <img className="max-w-40 aspect-square object-cover rounded-lg mx-auto" src={image} alt="playlist cover image" />
        <h1 className="text-lg font-medium">{title}</h1>
        <p className="text-sm">{summary}</p>
        <div className="grid grid-cols-2 gap-2">
          <Button className="gap-2" onClick={savePlaylistCallback} disabled={!allowPlaylistSave}>
            {allowPlaylistSave 
              ? (
                  <>
                    <span>Save Playlist</span>
                    <PlusCircleIcon className="w-5 h-5" />
                  </>
                )
              : 'Saving...'
            }
          </Button>
          <Button className="gap-2 text-muted-foreground" variant="secondary" onClick={() => router.push('/dashboard')}>
            <span>Generate New</span>
            <CameraIcon className="w-5 h-5" />
          </Button>
        </div>
      </Section>
      
      <Section className="flex-1">
        <div className="space-y-1">
          {songs.map((song) => (
            <div key={song.id} className="flex items-center gap-2" onClick={() => setCurrentTrackURI(song.uri)}>
              <Image className="w-12 h-12 rounded-md" src={song.album.images[0].url} alt={song.name} width={100} height={100} />
              <div className="flex w-full gap-2 items-center">
                <div className="flex-1">
                  <h2 className="text-sm line-clamp-1">{song.name}</h2>
                  <p className="text-sm text-muted-foreground line-clamp-1">{song.artists.map(artist => artist.name).join(", ")}</p>
                </div>
                <p className="text-sm text-muted-foreground w-max">{formatDuration(song.duration_ms)}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Spotify embedded player */}
      {currentTrackURI && (
        <Section className="sticky bottom-[52px] flex-1 bg-background/80 backdrop-blur-lg" classNameInner="py-4">
          <div className="h-20 overflow-hidden rounded-xl">
            <SpotifyPlayer key={currentTrackURI} currentTrackURI={currentTrackURI} height={100} />
          </div>
        </Section>
      )}
    </main>
  )
}