import { DEFAULT_LIMIT } from "@/constants"
import { SubscriptionsView } from "@/modules/home/ui/views/subscriptions-view"
import { HydrateClient, trpc } from "@/trpc/server"

// necessary to add dynamic otherwise build error happens
export const dynamic = "force-dynamic"

const Home = async () => {
  // prefetching with trpc
  void trpc.videos.getManySubscribed.prefetchInfinite({
    limit: DEFAULT_LIMIT,
  })

  return (
    <HydrateClient>
      <SubscriptionsView />
    </HydrateClient>
  )
}

export default Home
