import { DEFAULT_LIMIT } from "@/constants"
import { TrendingView } from "@/modules/home/ui/views/trending-view"
import { HydrateClient, trpc } from "@/trpc/server"

// necessary to add dynamic otherwise build error happens
export const dynamic = "force-dynamic"

const Home = async () => {
  // prefetching with trpc
  void trpc.videos.getManyTrending.prefetchInfinite({
    limit: DEFAULT_LIMIT,
  })

  return (
    <HydrateClient>
      <TrendingView />
    </HydrateClient>
  )
}

export default Home
