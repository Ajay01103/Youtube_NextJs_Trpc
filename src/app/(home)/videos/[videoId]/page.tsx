import { DEFAULT_LIMIT } from "@/constants"
import { VideoView } from "@/modules/videos/ui/views/video-view"
import { HydrateClient, trpc } from "@/trpc/server"
import React from "react"

export const dynamic = "force-dynamic"

interface Props {
  params: Promise<{
    videoId: string
  }>
}

const VideoIdPage = async ({ params }: Props) => {
  const { videoId } = await params

  void trpc.videos.getOne.prefetch({ id: videoId })
  // prefetching the infinite queries
  void trpc.comments.getMany.prefetchInfinite({ videoId, limit: DEFAULT_LIMIT })
  void trpc.suggestions.getMany.prefetchInfinite({
    videoId,
    limit: DEFAULT_LIMIT,
  })

  return (
    <HydrateClient>
      <VideoView videoId={videoId} />
    </HydrateClient>
  )
}

export default VideoIdPage
