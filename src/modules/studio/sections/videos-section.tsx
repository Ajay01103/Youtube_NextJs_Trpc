"use client"

import { InfiniteScroll } from "@/components/infiniteScroll"
import { DEFAULT_LIMIT } from "@/constants"
import { trpc } from "@/trpc/client"
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Link from "next/link"

export const VideosSection = () => {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <ErrorBoundary fallback={<p>Error!!</p>}>
        <VideosSectionSuspence />
      </ErrorBoundary>
    </Suspense>
  )
}

export const VideosSectionSuspence = () => {
  const [videos, query] = trpc.studio.getMany.useSuspenseInfiniteQuery(
    {
      limit: DEFAULT_LIMIT,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  )

  return (
    <div>
      <div className="border-y">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6 w-[510px]">Video</TableHead>
              <TableHead className="text-start">Visibility</TableHead>
              <TableHead className="text-start">Status</TableHead>
              <TableHead className="text-start">Date</TableHead>
              <TableHead className="text-start">Views</TableHead>
              <TableHead className="text-start">Comments</TableHead>
              <TableHead className="text-start pr-6">Likes</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {videos.pages
              .flatMap((page) => page.items)
              .map((video) => (
                <Link
                  href={`/studio/videos/${video.id}`}
                  key={video.id}
                  legacyBehavior
                >
                  <TableRow className="cursor-pointer">
                    <TableCell>{video.title}</TableCell>
                    <TableCell>Visibility</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Views</TableCell>
                    <TableCell>Comments</TableCell>
                    <TableCell>Likes</TableCell>
                  </TableRow>
                </Link>
              ))}
          </TableBody>
        </Table>
      </div>
      <InfiniteScroll
        isManual
        hasNextPage={query.hasNextPage}
        isFetchingNextPage={query.isFetchingNextPage}
        fetchNextPage={query.fetchNextPage}
      />
    </div>
  )
}
