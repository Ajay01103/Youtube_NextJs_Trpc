import { InfiniteScroll } from "@/components/infiniteScroll"
import { ResponsiveModal } from "@/components/responsive-dialog"
import { Button } from "@/components/ui/button"
import { DEFAULT_LIMIT } from "@/constants"
import { trpc } from "@/trpc/client"
import { Loader2, Square, SquareCheck } from "lucide-react"
import { toast } from "sonner"

interface PlaylistAddModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  videoId: string
}

export const PlaylistAddModal = ({
  open,
  onOpenChange,
  videoId,
}: PlaylistAddModalProps) => {
  const utils = trpc.useUtils()
  const {
    data: playlists,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = trpc.playlists.getManyForVideo.useInfiniteQuery(
    {
      limit: DEFAULT_LIMIT,
      videoId,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      enabled: !!videoId && open,
    }
  )

  const handleOpenChange = (newOpen: boolean) => {
    utils.playlists.getManyForVideo.reset()
    onOpenChange(newOpen)
  }

  const addVideoToPlaylist = trpc.playlists.addVideo.useMutation({
    onSuccess: () => {
      toast.success("Video added to playlist")
      utils.playlists.getMany.invalidate()
      utils.playlists.getManyForVideo.invalidate({ videoId })
    },
    onError: (error) => {
      toast.error("Something went wrong", {
        description: error.message,
      })
    },
  })

  const removeVideoFromPlaylist = trpc.playlists.removeVideo.useMutation({
    onSuccess: () => {
      toast.success("Video removed from playlist")
      utils.playlists.getMany.invalidate()
      utils.playlists.getManyForVideo.invalidate({ videoId })
    },
    onError: (error) => {
      toast.error("Something went wrong", {
        description: error.message,
      })
    },
  })

  return (
    <ResponsiveModal
      title="Add to playlist"
      open={open}
      onOpenChange={handleOpenChange}
    >
      <div className="flex flex-col gap-2">
        {isLoading && (
          <div className="flex justify-center p-4">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        )}
        {!isLoading &&
          playlists?.pages
            .flatMap((page) => page.items)
            .map((playlist) => (
              <Button
                variant="ghost"
                className="w-full justify-start px-2 [&_svg]:size-5"
                size="lg"
                key={playlist.id}
                disabled={
                  addVideoToPlaylist.isPaused ||
                  removeVideoFromPlaylist.isPaused
                }
                onClick={() => {
                  if (playlist.containsVideo) {
                    removeVideoFromPlaylist.mutate({
                      playlistId: playlist.id,
                      videoId,
                    })
                  } else {
                    addVideoToPlaylist.mutate({
                      playlistId: playlist.id,
                      videoId,
                    })
                  }
                }}
              >
                {playlist.containsVideo ? (
                  <SquareCheck className="mr-2" />
                ) : (
                  <Square className="mr-2" />
                )}
                {playlist.name}
              </Button>
            ))}

        {!isLoading && (
          <InfiniteScroll
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            fetchNextPage={fetchNextPage}
            isManual
          />
        )}
      </div>
    </ResponsiveModal>
  )
}
