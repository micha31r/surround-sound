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

export default function NewPlaylistPage() {
  const router = useRouter()
  const auth = useContext(AuthContext)
  const [title, setTitle] = useState("")
  const [summary, setSummary] = useState("")
  const [image, setImage] = useState("")
  const [songs, setSongs] = useState([])

  const playlistString = localStorage.getItem('playlistSongs')
  const playlistImageURL = localStorage.getItem('playlistImageURL')

  if (!playlistString || !playlistImageURL) {
    // Redirect to the dashboard if there are no playlist songs
    router.push("/dashboard")
    return null
  }

  // Get spotify auth token
  const spotifyAccessToken = localStorage.getItem('spotifyAccessToken')
        
  // Login again if no access token
  if (!spotifyAccessToken) {
    router.push("/login")
    return
  }

  useEffect(() => {
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

  async function savePlaylistCallback() {
    const spotifyUserId = auth.user.uid.split(":")[1]

    if (spotifyUserId) {
      await createPlaylist({
        name: title,
        description: summary,
        image: image,
        songs: songs,
        userId: spotifyUserId,
        token: spotifyAccessToken,
      })
    }
  }

  return (
    <main className="w-full h-svh space-y-8">
      <Section className="flex-1" classNameInner="gap-3">
        <img className="max-w-40 aspect-square object-cover rounded-lg mx-auto" src={image} alt="playlist cover image" />
        <h1 className="text-lg font-medium">{title}</h1>
        <p className="text-sm">{summary}</p>
        <div className="grid grid-cols-2 gap-2">
          <Button className="gap-2" onClick={savePlaylistCallback}>
            <span>Save Playlist</span>
            <PlusCircleIcon className="w-5 h-5" />
          </Button>
          <Button className="gap-2 text-muted-foreground" variant="secondary" onClick={() => router.push('/dashboard')}>
            <span>Take Another Photo</span>
            <CameraIcon className="w-5 h-5" />
          </Button>
        </div>
      </Section>
      <Section className="flex-1">
        <div className="space-y-1">
          {songs.map((song) => (
            <div key={song.id} className="flex items-center gap-2">
              <Image className="w-12 h-12 rounded-md" src={song.album.images[0].url} alt={song.name} width={100} height={100} />
              <div>
                <h2 className="text-sm line-clamp-1">{song.name}</h2>
                <p className="text-sm text-muted-foreground line-clamp-1">{song.artists.map(artist => artist.name).join(", ")}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </main>
  )
}