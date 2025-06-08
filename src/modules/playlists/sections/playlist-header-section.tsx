"use client"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { trpc } from "@/trpc/client"
import { Trash2Icon } from "lucide-react"
import { useRouter } from "next/navigation"
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"
import { toast } from "sonner"

interface Props {
  playlistId: string
}

export const PlaylistHeaderSection = ({ playlistId }: Props) => {
  return (
    <Suspense fallback={<PlaylistHeaderSectionSkeleton />}>
      <ErrorBoundary fallback={<p>Error!</p>}>
        <PlaylistHeaderSectionSuspense playlistId={playlistId} />
      </ErrorBoundary>
    </Suspense>
  )
}

export const PlaylistHeaderSectionSuspense = ({ playlistId }: Props) => {
  const router = useRouter()
  const utils = trpc.useUtils()
  const [playlists] = trpc.playlists.getOne.useSuspenseQuery({ id: playlistId })

  const remove = trpc.playlists.remove.useMutation({
    onSuccess: () => {
      toast.success("Playlist deleted")
      utils.playlists.getMany.invalidate()
      router.push("/playlists")
    },
    onError: (error) => {
      toast.error("Something went wrong", {
        description: error.message,
      })
    },
  })

  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold">Playlist Videos</h1>
        <p className="text-xs text-muted-foreground">
          Videos from the playlist
        </p>
      </div>

      <Button
        variant="outline"
        size="icon"
        className="rounded-full"
        onClick={() => remove.mutate({ id: playlistId })}
        disabled={remove.isPending}
      >
        <Trash2Icon />
      </Button>
    </div>
  )
}

export const PlaylistHeaderSectionSkeleton = () => {
  return (
    <div className="flex flex-col gap-y-2">
      <Skeleton className="h-6 w-24" />
      <Skeleton className="h-6 w-32" />
    </div>
  )
}
