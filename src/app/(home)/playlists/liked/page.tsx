import { DEFAULT_LIMIT } from "@/constants"
import { LikedView } from "@/modules/playlists/views/liked-view"
import { HydrateClient, trpc } from "@/trpc/server"

export const dynamic = "force-dynamic"

const HistoryPage = async () => {
  // prefetching with trpc
  void trpc.playlists.getLiked.prefetchInfinite({ limit: DEFAULT_LIMIT })

  return (
    <HydrateClient>
      <LikedView />
    </HydrateClient>
  )
}

export default HistoryPage
