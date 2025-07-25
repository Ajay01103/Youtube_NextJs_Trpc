"use client"

import { InfiniteScroll } from "@/components/infiniteScroll"
import { DEFAULT_LIMIT } from "@/constants"
import { trpc } from "@/trpc/client"
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"

import { format } from "date-fns"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Link from "next/link"
import { VideoThumbnail } from "@/modules/videos/ui/components/video-thumbnail"
import { snakeCaseToTitle } from "@/lib/utils"
import { Globe2, LockIcon } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export const VideosSection = () => {
  return (
    <Suspense fallback={<VideoSectionSkeleton />}>
      <ErrorBoundary fallback={<p>Error!!</p>}>
        <VideosSectionSuspence />
      </ErrorBoundary>
    </Suspense>
  )
}

const VideoSectionSkeleton = () => {
  return (
    <>
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
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell className="pl-6">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-20 w-36" />

                    <div className="flex flex-col gap-2">
                      <Skeleton className="h-4 w-[100px]" />
                      <Skeleton className="h-3 w-[100px]" />
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell className="text-start">
                  <Skeleton className="h-4 w-12 ml-auto" />
                </TableCell>
                <TableCell className="text-start">
                  <Skeleton className="h-4 w-12 ml-auto" />
                </TableCell>
                <TableCell className="text-start">
                  <Skeleton className="h-4 w-12 ml-auto" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
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
                  prefetch
                  href={`/studio/videos/${video.id}`}
                  key={video.id}
                  legacyBehavior
                >
                  <TableRow className="cursor-pointer">
                    <TableCell className="flex items-center gap-4 pl-6">
                      <div className="relative aspect-video w-36 shrink-0">
                        <VideoThumbnail
                          imageUrl={video.thumbnailUrl}
                          previewUrl={video.previewUrl}
                          duration={video.duration || 0}
                        />
                      </div>

                      <div className="flex flex-col overflow-hidden gap-y-1">
                        <span className="text-sm line-clamp-1">{video.title}</span>
                        <span className="text-xs text-muted-foreground line-clamp-1">
                          {video.description || "No description"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {video.visibility === "private" ? (
                          <LockIcon className="size-4 mr-2" />
                        ) : (
                          <Globe2 className="size-4 mr-2" />
                        )}
                        {snakeCaseToTitle(video.visibility)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <span className="">
                          {snakeCaseToTitle(video.muxStatus || "error")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(video.createdAt), "d MMM yyyy")}
                    </TableCell>
                    <TableCell>{video.viewCount}</TableCell>
                    <TableCell>{video.commentCount}</TableCell>
                    <TableCell>{video.likeCount}</TableCell>
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
