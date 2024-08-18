'use client'
import { useParams, useRouter } from "next/navigation"
import { useContext, useEffect, useState } from "react"
import { AuthContext } from "@/components/context"
import { getPlaylist, getSong } from "@/lib/spotify/songs"
import Image from "next/image"
import Section from "@/components/Section"
import { EllipsisHorizontalIcon, TrashIcon } from "@heroicons/react/24/solid"
import { deleteFBPlaylist } from "@/lib/firebase/playlist"
import { db, storage } from "@/lib/firebase/clientApp"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import SpotifyPlayer from "@/components/SpotifyPlayer"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

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

export default function PlaylistDetailPage() {
  const router = useRouter()
  const auth = useContext(AuthContext)
  const params = useParams()
  const [title, setTitle] = useState("")
  const [summary, setSummary] = useState("")
  const [image, setImage] = useState("")
  const [songs, setSongs] = useState([])
  const [currentTrackURI, setCurrentTrackURI] = useState(null)

  const playlistId = params.id
  const spotifyAccessToken = localStorage.getItem('spotifyAccessToken')

  useEffect(() => {
    if (!playlistId || !spotifyAccessToken || !auth.user) {
      return
    }

    (async () => {
      try {
        const playlist = await getPlaylist({ 
          playlistId:  playlistId,
          token: spotifyAccessToken 
        })

        if (!playlist?.id) {
          return
        }
        
        if (playlist?.images?.length) {
          setImage(await URLToBase64(playlist.images[0].url))
        }

        setTitle(playlist.name)
        setSummary(playlist.description)

        if (playlist?.tracks?.items?.length) {
          for (const track of playlist.tracks.items) {
            console.log(track.track)
            setSongs((songs) => [...songs, track.track])
          }
        }
      } catch (error) {
        throw error
      }
    })()
  }, [])

  if (!playlistId) {
    // Redirect to the dashboard if there are no playlist songs
    router.push("/playlist")
    return null
  }

  if (!spotifyAccessToken || !auth.user) {
    // Redirect to login if auth is not valid
    router.push("/login")
    return null
  }

  async function deleteCallback() {
    try {
      await deleteFBPlaylist(db, storage, { playlistId })
      router.push("/playlist")
    } catch (error) {
      throw error
    }
  }

  return (
    <main className={cn("flex-1 opacity-0 transition-opacity w-full space-y-8 min-h-[calc(100svh-112px)]", {
      "opacity-100": !!songs.length
    })}>
      <Section className="flex-1" classNameInner="gap-3">
        <img className="w-40 aspect-square object-cover rounded-lg mx-auto" src={image} alt="playlist cover image" />
        <h1 className="text-lg font-medium">{title}</h1>
        <p className="text-sm">{summary}</p>

        <div className="flex gap-2">
          <Button onClick={() => setCurrentTrackURI('spotify:playlist:' + playlistId)} className="w-20 h-9 rounded-full">Play</Button>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex gap-2 w-9 h-9 justify-center items-center bg-secondary text-muted-foreground rounded-full">
              <EllipsisHorizontalIcon className="w-5 h-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem className="w-max gap-2 text-muted-foreground cursor-pointer" onClick={deleteCallback}>
                <TrashIcon className="w-4 h-4" />
                <span>Remove From Library</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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