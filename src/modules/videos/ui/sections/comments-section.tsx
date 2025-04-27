"use client"

import { InfiniteScroll } from "@/components/infiniteScroll"
import { DEFAULT_LIMIT } from "@/constants"
import { CommentItem } from "@/modules/comments/ui/components/comment-item"
import { CommentsForm } from "@/modules/comments/ui/components/comments-form"
import { trpc } from "@/trpc/client"
import { Loader2 } from "lucide-react"
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"

interface CommentsProps {
  videoId: string
}

export const CommentsSection = ({ videoId }: CommentsProps) => {
  return (
    <Suspense fallback={<CommentsSkeleton />}>
      <ErrorBoundary fallback={<p>Error</p>}>
        <CommentsSectionSuspense videoId={videoId} />
      </ErrorBoundary>
    </Suspense>
  )
}

export const CommentsSkeleton = () => {
  return (
    <div className="mt-6 flex justify-center items-center">
      <Loader2 className="text-muted-foreground size-7 animate-spin" />
    </div>
  )
}

export const CommentsSectionSuspense = ({ videoId }: CommentsProps) => {
  const [comments, query] = trpc.comments.getMany.useSuspenseInfiniteQuery(
    { videoId, limit: DEFAULT_LIMIT },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  )

  return (
    <div className="mt-6">
      <div className="flex flex-col gap-6">
        <h1 className="text-xl font-bold">{comments.pages[0].totalCount} Comments</h1>
        <CommentsForm videoId={videoId} />
      </div>

      <div className="flex flex-col gap-4 mt-2">
        {comments.pages
          .flatMap((page) => page.items)
          .map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
            />
          ))}

        <InfiniteScroll
          isManual
          hasNextPage={query.hasNextPage}
          isFetchingNextPage={query.isFetchingNextPage}
          fetchNextPage={query.fetchNextPage}
        />
      </div>
    </div>
  )
}
