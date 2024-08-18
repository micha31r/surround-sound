'use client'
import Logo from "@/components/Logo"
import Section from "@/components/Section"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { MoonIcon, SunIcon } from "@heroicons/react/24/solid"
import { useTheme } from "next-themes"

function ThemeButton({ className }) {
  const { theme, setTheme } = useTheme()

  function switchTheme() {
    if (theme === 'light') {
      setTheme('dark')
    } else {
      setTheme('light')
    }
  }

  return (
    <Button variant="secondary" size="icon" className={cn("text-muted-foreground rounded-full", className)} onClick={switchTheme}>
      {theme === 'light' && <SunIcon className="w-5 h-5"/>}
      {theme === 'dark' && <MoonIcon className="w-5 h-5"/>}
    </Button>
  )
}

export default function Navbar() {
  return (
    <nav className="sticky top-0 bg-background/80 backdrop-blur-lg">
      <Section className="py-3" classNameInner="flex flex-row">
        <div className="flex items-center gap-2 flex-1">
          <Logo />
          <p className="font-medium">SurroundSound</p>
        </div>
        <ThemeButton />
      </Section>
    </nav>
  )
}