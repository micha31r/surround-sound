'use client'
import { useState } from 'react'
import Wheel from '@uiw/react-color-wheel'
import { hsvaToHex } from '@uiw/color-convert'
import { useEffect } from 'react'
import { GetColorName } from 'hex-color-to-color-name'

export default function ColorWheel() {
  const colorName = JSON.parse(localStorage.getItem('colorName'))
  const colorCode = JSON.parse(localStorage.getItem('colorCode'))

  const [hsva, setHsva] = useState(colorCode || { h: 214, s: 43, v: 90, a: 1 });
  const [name, setName] = useState(colorName || '');

  useEffect(() => {
    setName(GetColorName(hsvaToHex(hsva)))
    localStorage.setItem('colorName', JSON.stringify(name))
    localStorage.setItem('colorCode', JSON.stringify(hsva))
    localStorage.setItem('colorCodeHex', JSON.stringify(hsvaToHex(hsva)))
  }, [hsva])

  return (
    <div className="space-y-8">
      <div className="mx-auto w-max">
        <Wheel color={hsva} onChange={(color) => setHsva({ ...hsva, ...color.hsva })} />
      </div>
      <div className="mx-auto w-48 rounded-xl p-2 line-clamp-1 text-center text-sm" style={{ background: hsvaToHex(hsva) }}>
        <p className="bg-background/20 p-2 rounded-md font-medium text-white">{name}</p>
      </div>
    </div>
  )
}