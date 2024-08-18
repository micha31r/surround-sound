// This app deserves first place

'use client'
import React, { useState, useRef, useContext } from "react"
import { Camera } from "react-camera-pro"
import Compressor from 'compressorjs'
import { storage } from '@/lib/firebase/clientApp'
import {v4 as uuidv4} from 'uuid'
import { AuthContext } from "@/components/context"
import { uploadImageFromFile } from '@/lib/firebase/storage'
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

async function base64ToBlob(url) {
  const response = await fetch(url, {
    mode: 'cors'
  })
  const blob = response.blob()
  return blob
}

export default function PhotoCamera ({ onSuccess, onError }) {
  const auth = useContext(AuthContext)
  const router = useRouter()
  const [image, setImage] = useState(null)
  const [canTakePhoto, setCanTakePhoto] = useState(true)

  const colorCodeHex = JSON.parse(localStorage.getItem('colorCodeHex')) || 'transparent'
  const colorName = JSON.parse(localStorage.getItem('colorName'))

  const camera = useRef(null)

  if (!auth.user) {
    return null
  }

  async function takePhoto() {
    const photo = camera.current.takePhoto()
    const blob = await base64ToBlob(photo)
    const name = uuidv4() + '.jpg'
    const bucket = 'photos/' + auth.user.uid

    setCanTakePhoto(false)

    // Set preview
    setImage(photo)

    new Compressor(blob, {
      width: 1000,
      height: 1000,
      quality: 0.8,
      convertSize: 0, // Force convert all images to JPG
      success(compressedFile) {
        uploadImageFromFile(storage, compressedFile, bucket, name, auth.user.uid).then(snapshot => {
          onSuccess && onSuccess(snapshot)
        }).catch(error => {
          console.log(error)
          onError && onError(error)
        })
      },
      error(error) {
        console.log(error)
        onError && onError(error)
      },
    })
  }

  return (
    <div className="flex w-full h-full relative rounded-2xl overflow-hidden">
      {image 
        ? <img className="-scale-x-100 opacity-80" src={image} alt="photo preview" /> 
        : <Camera ref={camera} /> }
        
      {/* Color filter */}
      <div className="pointer-events-none select-none absolute w-full h-full inset-0 rounded-2xl opacity-20" style={{
        background: colorCodeHex
      }}></div>

      {colorName && (
        <p onClick={() => router.push('/mood')} className="cursor-pointer absolute top-2 left-1/2 -translate-x-1/2 bg-background/20 p-2 rounded-md font-medium text-white text-sm">{colorName}</p>
      )}

      {/* Shutter button */}
      <Button onClick={takePhoto} variant="ghost" className="absolute w-12 h-12 left-1/2 -translate-x-1/2 rounded-full bottom-4 bg-white" disabled={!canTakePhoto}/>
      
      {!canTakePhoto && <p className="cursor-pointer absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-2 rounded-md font-medium text-white">Generating...</p>}
    </div>
  );
}
