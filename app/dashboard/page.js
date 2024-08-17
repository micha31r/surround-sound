import { getAuthenticatedServerApp } from "@/lib/firebase/serverApp"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const { currentUser } = await getAuthenticatedServerApp()

  if (!currentUser) {
    redirect("/login")
    return null
  }

  console.log(123)
  console.log(currentUser.uid)

  return (
    <div>
      <h1>{currentUser.uid}</h1>
    </div>
  )
}