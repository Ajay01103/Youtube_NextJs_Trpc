import { CategoriesSection } from "@/modules/search/ui/sections/categories-section"
import { ResultsSection } from "../sections/result-section"

interface PageProps {
  query: string | undefined
  categoryId: string | undefined
}

export const SearchView = ({ categoryId, query }: PageProps) => {
  return (
    <div className="max-w-[1300px] mx-auto mb-10 flex flex-col gap-y-6 px-4 pt-2.5">
      <CategoriesSection categoryId={categoryId} />
      <ResultsSection
        query={query}
        categoryId={categoryId}
      />
    </div>
  )
}
