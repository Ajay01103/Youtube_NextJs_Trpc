import { DEFAULT_LIMIT } from "@/constants"
import { SubscriptionsView } from "@/modules/subscriptions/ui/views/subscriptions-view"
import { HydrateClient, trpc } from "@/trpc/server"

export const dynamic = "force-dynamic"

const SubscriptionsPage = async () => {
  // trpc prefetching
  void trpc.subscriptions.getMany.prefetchInfinite({
    limit: DEFAULT_LIMIT,
  })

  return (
    <HydrateClient>
      <SubscriptionsView />
    </HydrateClient>
  )
}

export default SubscriptionsPage
