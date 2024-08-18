'use client'
import Section from "@/components/Section"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { CameraIcon, MusicalNoteIcon, RectangleStackIcon, SparklesIcon } from "@heroicons/react/24/solid"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function BottomNavbar() {
  const pathname = usePathname()

  return (
    <nav className="sticky bottom-0 bg-background/80 backdrop-blur-lg">
      <Section className="py-2" classNameInner="flex flex-row justify-around">
        <Button variant="primary" size="icon" className={cn("text-muted-foreground rounded-full", {
          'text-primary': pathname.includes("/mood")
        })} asChild>
          <Link href="/mood">
            <SparklesIcon className="w-6 h-6"/>
          </Link>
        </Button>
        <Button variant="primary" size="icon" className={cn("text-muted-foreground rounded-full", {
          'text-primary': pathname.includes("/dashboard")
        })} asChild>
          <Link href="/dashboard">
            <CameraIcon className="w-6 h-6"/>
          </Link>
        </Button>
        <Button variant="primary" size="icon" className={cn("text-muted-foreground rounded-full", {
          'text-primary': pathname.includes("/playlist")
        })}>
          <Link href="/playlist">
            <RectangleStackIcon className="w-6 h-6"/>
          </Link>
        </Button>
      </Section>
    </nav>
  )
}