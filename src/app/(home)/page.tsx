import { DEFAULT_LIMIT } from "@/constants"
import { HomeView } from "@/modules/home/ui/views/home-view"
import { HydrateClient, trpc } from "@/trpc/server"

// necessary to add dynamic otherwise build error happens
export const dynamic = "force-dynamic"

interface PageProps {
  searchParams: Promise<{ categoryId?: string }>
}

const Home = async ({ searchParams }: PageProps) => {
  const { categoryId } = await searchParams

  // prefetching with trpc
  void trpc.categories.getMany.prefetch()
  void trpc.videos.getMany.prefetchInfinite({
    categoryId,
    limit: DEFAULT_LIMIT,
  })

  return (
    <HydrateClient>
      <HomeView categoryId={categoryId} />
    </HydrateClient>
  )
}

export default Home
