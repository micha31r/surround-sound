import BottomNavbar from "@/components/BottomNavbar"
import Navbar from "@/components/Navbar"

export default async function ClientAuthLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  )
}