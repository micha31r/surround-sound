import BottomNavbar from "@/components/BottomNavbar"
import ClientAuthGuard from "@/components/ClientAuthGuard"
import Navbar from "@/components/Navbar"

export default async function ClientAuthLayout({ children }) {
  return (
    <ClientAuthGuard>
      <Navbar />
      {children}
      <BottomNavbar />
    </ClientAuthGuard>
  )
}