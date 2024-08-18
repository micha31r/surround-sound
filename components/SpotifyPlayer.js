'use client'
import { cn } from "@/lib/utils"
import { useEffect, useRef, useState } from "react"

// Spotify embedded player
// https://developer.spotify.com/documentation/embeds/tutorials/using-the-iframe-api
export default function SpotifyPlayer ({ currentTrackURI, height = 200 }) {
  const parentRef = useRef(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!currentTrackURI) {
      return
    }

    // Create new element to wrap around the iframe
    const element = document.createElement('div')
    element.id = 'embed-iframe'
    parentRef.current.appendChild(element)

    // Store the controller so we can destory it when the component unmounts
    let embedController

    window.onSpotifyIframeApiReady = (IFrameAPI) => {
      const options = { 
        uri: currentTrackURI,
        height: height,
      }
      const callback = (controller) => {
        embedController = controller
        embedController.addListener('ready', () => {
          setShow(true)
          embedController.play()
        });
      }
      IFrameAPI.createController(element, options, callback)
    }

    return () => embedController?.destroy()
  }, [])

  return (
    <div className={cn(`h-[${height}px] opacity-0 transition-opacity`, {
      "opacity-1": show
    })} ref={parentRef}></div>
  )
}