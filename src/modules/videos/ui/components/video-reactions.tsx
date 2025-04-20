import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { ThumbsDownIcon, ThumbsUpIcon } from "lucide-react"
import { VideoGetOneOutput } from "../../types"
import { useClerk } from "@clerk/nextjs"
import { trpc } from "@/trpc/client"
import { toast } from "sonner"

interface videoReactionProps {
  videoId: string
  likes: number
  dislikes: number
  viewerReaction: VideoGetOneOutput["viewerReactions"]
}

export const VideoReactions = ({
  dislikes,
  likes,
  videoId,
  viewerReaction,
}: videoReactionProps) => {
  const clerk = useClerk()
  const utils = trpc.useUtils()

  const like = trpc.videoReactions.like.useMutation({
    onSuccess: () => {
      utils.videos.getOne.invalidate({ id: videoId })
      // TODO invalidate likes playlist
    },
    onError: (error) => {
      toast.error("Something went wrong", {
        description: error.message,
      })

      if (error.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn()
      }
    },
  })

  const disLike = trpc.videoReactions.disLike.useMutation({
    onSuccess: () => {
      utils.videos.getOne.invalidate({ id: videoId })
      // TODO invalidate likes playlist
    },
    onError: (error) => {
      toast.error("Something went wrong", {
        description: error.message,
      })

      if (error.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn()
      }
    },
  })

  return (
    <div className="flex items-center flex-none">
      <Button
        onClick={() => like.mutate({ videoId })}
        disabled={like.isPending || disLike.isPending}
        className="rounded-l-full rounded-r-none gap-2 pr-4"
        variant={"secondary"}
      >
        <ThumbsUpIcon
          className={cn("size-5", viewerReaction === "like" && "fill-black")}
        />
        {likes}
      </Button>
      <Separator
        className="h-7"
        orientation="vertical"
      />
      <Button
        onClick={() => disLike.mutate({ videoId })}
        disabled={like.isPending || disLike.isPending}
        className="rounded-l-none rounded-r-full pl-3"
        variant={"secondary"}
      >
        <ThumbsDownIcon
          className={cn("size-5", viewerReaction === "dislike" && "fill-black")}
        />
        {dislikes}
      </Button>
    </div>
  )
}
