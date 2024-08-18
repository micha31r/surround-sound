'use effect'

import ColorWheel from "@/components/ColorWheel"
import Section from "@/components/Section"

export default function MoodPage() {
  return (
    <main className="w-full space-y-8">
      <Section className="flex-1" classNameInner="gap-3">
        <ColorWheel />
      </Section>
    </main>
  )
}