import { DEFAULT_LIMIT } from "@/constants"
import { VideosView } from "@/modules/playlists/views/videos-view"
import { HydrateClient, trpc } from "@/trpc/server"

export const dynamic = "force-dynamic"

interface Props {
  params: Promise<{ playlistId: string }>
}

const PlaylistIdPage = async ({ params }: Props) => {
  const { playlistId } = await params

  // prefetching with trpc
  void trpc.playlists.getOne.prefetch({ id: playlistId })
  void trpc.playlists.getVideos.prefetchInfinite({
    limit: DEFAULT_LIMIT,
    playlistId,
  })

  return (
    <HydrateClient>
      <VideosView playlistId={playlistId} />
    </HydrateClient>
  )
}

export default PlaylistIdPage
