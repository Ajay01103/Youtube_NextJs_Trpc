import { VideoView } from "@/modules/videos/ui/views/video-view"
import { HydrateClient, trpc } from "@/trpc/server"
import React from "react"

interface Props {
  params: Promise<{
    videoId: string
  }>
}

const VideoIdPage = async ({ params }: Props) => {
  const { videoId } = await params

  void trpc.videos.getOne.prefetch({ id: videoId })

  return (
    <HydrateClient>
      <VideoView videoId={videoId} />
    </HydrateClient>
  )
}

export default VideoIdPage
