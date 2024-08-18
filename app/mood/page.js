'use effect'

import ColorWheel from "@/components/ColorWheel"
import Section from "@/components/Section"

export default function MoodPage() {
  return (
    <main className="flex w-full h-[calc(100svh-112px)]">
      <Section className="flex-1 my-auto" classNameInner="space-y-8">
        <h3 className="text-center text-lg font-medium">Colour Mood</h3>
        <ColorWheel />
      </Section>
    </main>
  )
}