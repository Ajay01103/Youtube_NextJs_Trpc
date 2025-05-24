import { SearchView } from "@/modules/search/ui/views/search-view"
import { HydrateClient, trpc } from "@/trpc/server"

export const dynamic = "force-dynamic"

interface PageProps {
  searchParams: Promise<{
    query: string | undefined
    categoryId: string | undefined
  }>
}

const SearchPage = async ({ searchParams }: PageProps) => {
  const { categoryId, query } = await searchParams

  // prefetching the categories
  void trpc.categories.getMany.prefetch()

  return (
    <HydrateClient>
      <SearchView
        query={query}
        categoryId={categoryId}
      />
    </HydrateClient>
  )
}

export default SearchPage
