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

  async function onSuccess(snapshot) {
    // Get image URL of the uploaded image
    const imageURL = await getDownloadURL(snapshot.ref)

    // Save image URL and ID to local storage
    localStorage.setItem('playlistImageURL', imageURL)
    localStorage.setItem('playlistImagePath', snapshot.ref.fullPath)

    // Generate songs based on parameters
    const resultsString = await generateSongs(imageURL)

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
    <main className="flex w-full h-svh">
      <Section className="flex-1">
        <div className="w-full h-svh">
          <PhotoCamera onSuccess={onSuccess} />
        </div>
      </Section>
    </main>
  )
}