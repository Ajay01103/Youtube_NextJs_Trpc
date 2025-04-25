"use client"

import { THUMBNAIL_FALLBACK } from "@/modules/constants"
import MuxPlayer from "@mux/mux-player-react"

interface Props {
  playbackId?: string | null | undefined
  thumbnailUrl?: string | null | undefined
  autoPlay?: boolean
  onPlay?: () => void
}

export const VideoPlayerSkeleton = () => {
  return <div className="aspect-video rounded-xl bg-black" />
}

export const VideoPlayer = ({ autoPlay, onPlay, playbackId, thumbnailUrl }: Props) => {
  return (
    <MuxPlayer
      playbackId={playbackId || ""}
      poster={thumbnailUrl || THUMBNAIL_FALLBACK}
      playerInitTime={0}
      autoPlay={autoPlay}
      thumbnailTime={0}
      className="w-full h-full object-cover"
      accentColor="#FF2056"
      onPlay={onPlay}
    />
  )
}
