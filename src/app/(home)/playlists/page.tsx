import { DEFAULT_LIMIT } from "@/constants"
import { PlaylistsView } from "@/modules/playlists/views/playlists-views"
import { HydrateClient, trpc } from "@/trpc/server"

const PlaylistsPage = async () => {
  // prefetching with trpc
  void trpc.playlists.getMany.prefetchInfinite({ limit: DEFAULT_LIMIT })

  return (
    <HydrateClient>
      <PlaylistsView />
    </HydrateClient>
  )
}

export default PlaylistsPage
