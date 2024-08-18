'use client'
import PhotoCamera from "@/components/PhotoCamera"
import Section from "@/components/Section"
import { useContext } from "react"
import { AuthContext } from "@/components/context"
import { generateSongs } from "@/lib/openai/generate"
import { getDownloadURL } from "firebase/storage";
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const auth = useContext(AuthContext)
  const router = useRouter()

  const colorCodeHex = JSON.parse(localStorage.getItem('colorCodeHex')) || 'transparent'

  async function onSuccess(snapshot) {
    // Get image URL of the uploaded image
    const imageURL = await getDownloadURL(snapshot.ref)

    // Save image URL and ID to local storage
    localStorage.setItem('playlistImageURL', imageURL)
    localStorage.setItem('playlistImagePath', snapshot.ref.fullPath)

    // Get colorName
    const colorName = localStorage.getItem('colorName') || 'yellow'

    // Generate songs based on parameters
    const resultsString = await generateSongs(imageURL, colorName)

    try {
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
          <div className="pointer-events-none select-none absolute w-full h-full inset-0 z-10 rounded-2xl opacity-20" style={{
            background: colorCodeHex
          }}></div>
        </div>
      </Section>
    </main>
  )
}