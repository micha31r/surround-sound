'use client'
import { AuthContext } from "@/components/context"
import { useContext, useEffect, useState } from "react"
import { getFBPlaylists } from "@/lib/firebase/playlist"
import { getImageURL } from "@/lib/firebase/storage"
import { db, storage } from "@/lib/firebase/clientApp"
import Section from "@/components/Section"
import { useRouter } from "next/navigation"

export default function PlaylistPage() {
  const auth = useContext(AuthContext)
  const router = useRouter()
  const [playlists, setPlaylists] = useState([])
  const [images, setImages] = useState({})

  useEffect(() => {
    (async () => {
      if (!auth.user) {
        return
      }

      // Get the playlists for the current user
      const playlists = await getFBPlaylists(db, { userId: auth.user.uid })
      setPlaylists(playlists)
      
      console.log(playlists)

      // Get image of every playlist
      for (const playlist of playlists) {
        const url = await getImageURL(storage, '', playlist.imagePath)
        setImages((images) => ({
          ...images,
          [playlist.spotifyPlaylistId]: url
        }))
      }
    })()
  }, [auth])

  return (
    <main className="w-full space-y-8">
      <Section className="flex-1" classNameInner="gap-3 min-h-[calc(100svh-112px)]">
        <h1 className="text-lg font-medium text-center my-8">Playlist Archive</h1>
        <div className="grid grid-cols-3 gap-1">
          {playlists.map((playlist, index) => {
            if (images[playlist.spotifyPlaylistId]) {
              return (
                <div key={playlist.spotifyPlaylistId} className="cursor-pointer hover:opacity-60 transition-opacity" onClick={() => router.push('/playlist/' + playlist.spotifyPlaylistId)}>
                  <img className="w-40 aspect-[3/4] rounded-xl object-cover" src={images[playlist.spotifyPlaylistId]} alt="playlist cover image" />
                </div>
              )
            }
          })}
        </div>
      </Section>
    </main>
  )
}