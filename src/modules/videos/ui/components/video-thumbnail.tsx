import { Skeleton } from "@/components/ui/skeleton"
import { formatDuration } from "@/lib/utils"
import { THUMBNAIL_FALLBACK } from "@/modules/constants"
import Image from "next/image"
import { useState } from "react"

interface Props {
  imageUrl?: string | null
  previewUrl?: string | null
  duration: number
}

export const VideoThumbnailSkeleton = () => {
  return (
    <div className="relative w-full overflow-hidden rounded-xl aspect-video">
      <Skeleton className="size-full" />
    </div>
  )
}

export const VideoThumbnail = ({ imageUrl, previewUrl, duration }: Props) => {
  const [isHovering, setIsHovering] = useState(false)

  return (
    <div className="relative">
      {/* Thumbnail wrapper */}
      <div
        className="relative overflow-hidden rounded-xl aspect-video"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <Image
          unoptimized={!!previewUrl}
          src={isHovering && previewUrl ? previewUrl : imageUrl ?? THUMBNAIL_FALLBACK}
          alt="thumb"
          fill
          className="size-full object-cover"
        />
      </div>

      {/* video duration box */}
      <div className="absolute bottom-2 right-2 px-1 py-0.5 rounded bg-black/80 text-white text-xs font-medium">
        {formatDuration(duration)}
      </div>
    </div>
  )
}
