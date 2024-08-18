'use client'
import PhotoCamera from "@/components/PhotoCamera"
import Section from "@/components/Section"
import { useContext } from "react"
import { AuthContext } from "@/components/context"
import { generateSongs } from "@/lib/openai/generate"
import { getDownloadURL } from "firebase/storage";
import { useRouter } from "next/navigation"
import { getTopArtists } from "@/lib/spotify/songs"

export const maxDuration = 60;

export default function DashboardPage() {
  const auth = useContext(AuthContext)
  const router = useRouter()

  async function onSuccess(snapshot) {
    const spotifyAccessToken = localStorage.getItem('spotifyAccessToken')
    const topArtists = await getTopArtists({ token: spotifyAccessToken })
    const topArtistsList = []
    console.log(topArtists)

    // Set default top artists
    if (!topArtists?.items?.length) {
      topArtistsList.push("Drake")
      topArtistsList.push("Kanye West")
      topArtistsList.push("Taylor Swift")
      topArtistsList.push("Olivia Rodrigo")
      topArtistsList.push("Harry Styles")
      topArtistsList.push("Billie Ellish")
    } else {
      topArtists.items.slice(0, 10).forEach(artist => {
        topArtistsList.push(artist.name)
      })
    }

    const topArtistsString = topArtistsList.join(", ")

    // Get image URL of the uploaded image
    const imageURL = await getDownloadURL(snapshot.ref)

    // Save image URL and ID to local storage
    localStorage.setItem('playlistImageURL', imageURL)
    localStorage.setItem('playlistImagePath', snapshot.ref.fullPath)

    // Get colorName
    const colorName = localStorage.getItem('colorName') || 'yellow'

    // Generate songs based on parameters
    const resultsString = await generateSongs(imageURL, colorName, topArtistsString)

    try {
      console.log(resultsString)
      // Check if results is a valid JSON string
      const playlist = JSON.parse(resultsString)

      // Store the playlist in local storage
      localStorage.setItem('playlistSongs', JSON.stringify(playlist))

      router.push("/playlist/new")
    } catch (error) {
      console.error("Invalid recommendation format:", error);
    }
  }

  return (
    <main className="flex w-full">
      <Section>
        <div className="relative flex-1">
          <div className="h-[calc(100svh-112px)]">
            <PhotoCamera onSuccess={onSuccess} />
          </div>
        </div>
      </Section>
    </main>
  )
}