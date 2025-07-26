'use client'

import Image from "next/image"
import { useState } from "react"

interface ImageWithFallbackProps {
  src: string
  alt: string
  fallbackSrc?: string
  fill?: boolean
  className?: string
  priority?: boolean
  [key: string]: any
}

export function ImageWithFallback({
  src,
  alt,
  fallbackSrc = "/images/logo.png",
  priority = false,
  ...props
}: ImageWithFallbackProps) {
  const [error, setError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  const handleLoad = () => {
    setIsLoading(false)
  }

  // Special handling for thumbnail files
  const isThumbnail = src.includes('thumbnail.svg') || src.includes('thumbnail.png')

  return (
    <>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0618F3]">
          <div className="h-full w-full bg-[#0618F3] animate-pulse" />
        </div>
      )}
      <Image
        src={error ? fallbackSrc : src}
        alt={alt}
        priority={priority}
        onLoad={handleLoad}
        onError={() => {
          setError(true)
          setIsLoading(false)
        }}
        {...props}
        className={`${props.className || ''} ${isThumbnail ? 'object-cover' : ''}`}
        style={isThumbnail ? {
          ...props.style,
          objectPosition: 'center 20%',  // Adjust positioning to show more of the bottom part of the image
        } : props.style}
      />
    </>
  )
} 