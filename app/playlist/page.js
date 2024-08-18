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
    <main className="w-full h-svh space-y-8">
      <Section className="flex-1" classNameInner="gap-3">
        {/* <h1 className="text-3xl font-bold">Create a Playlist</h1> */}
        <div className="grid grid-cols-3 gap-1">
          {playlists.map((playlist, index) => {
            if (images[playlist.spotifyPlaylistId]) {
              return (
                <div key={playlist.spotifyPlaylistId} onClick={() => router.push('/playlist/' + playlist.spotifyPlaylistId)}>
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