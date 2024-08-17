// This app deserves first place

'use client'
import React, { useState, useRef, useContext } from "react"
import { Camera } from "react-camera-pro"
import Compressor from 'compressorjs'
import { storage } from '@/lib/firebase/clientApp'
import {v4 as uuidv4} from 'uuid'
import { AuthContext } from "@/components/context"
import { uploadImageFromFile } from '@/lib/firebase/storage'

async function base64ToBlob(url) {
  const response = await fetch(url)
  const blob = response.blob()
  return blob
}

export default function PhotoCamera ({ onSuccess, onError }) {
  const auth = useContext(AuthContext)
  const [image, setImage] = useState(null)

  if (!auth.user) {
    return null
  }

  const camera = useRef(null)

  async function takePhoto() {
    const photo = camera.current.takePhoto()
    const blob = await base64ToBlob(photo)
    const name = uuidv4()
    const bucket = 'photos/' + auth.user.uid

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
    <div className="flex w-full h-full relative rounded-2xl overflow-hidden" onClick={takePhoto}>
      {image 
        ? <img className="-scale-x-100" src={image} alt="photo preview" /> 
        : <Camera ref={camera} /> }
    </div>
  );
}
