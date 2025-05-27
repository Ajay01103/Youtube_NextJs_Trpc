import { DEFAULT_LIMIT } from "@/constants"
import { HistoryView } from "@/modules/playlists/views/history-view"
import { HydrateClient, trpc } from "@/trpc/server"

const HistoryPage = async () => {
  // prefetching with trpc
  void trpc.playlists.getHistory.prefetchInfinite({ limit: DEFAULT_LIMIT })
  return (
    <HydrateClient>
      <HistoryView />
    </HydrateClient>
  )
}

export default HistoryPage
