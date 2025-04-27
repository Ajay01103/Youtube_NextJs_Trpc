import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { UserAvatar } from "@/components/user-avatar"
import { trpc } from "@/trpc/client"
import { formatDistanceToNow } from "date-fns"
import { MessageSquare, MoreVertical, Trash } from "lucide-react"
import Link from "next/link"
import { CommentsGetManyOutput } from "../../types"
import { useAuth, useClerk } from "@clerk/nextjs"
import { toast } from "sonner"

interface CommentItemProps {
  comment: CommentsGetManyOutput["items"][number]
}

export const CommentItem = ({ comment }: CommentItemProps) => {
  const { userId } = useAuth()
  const clerk = useClerk()

  const utils = trpc.useUtils()
  const deleteComment = trpc.comments.delete.useMutation({
    onSuccess: () => {
      toast.success("comment deleted")
      utils.comments.getMany.invalidate({ videoId: comment.videoId })
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
    <div className="">
      <div className="flex gap-4">
        <Link href={`/users/${comment.userId}`}>
          <UserAvatar
            size="lg"
            avatarUrl={comment.user.imageUrl}
            name={comment.user.name}
          />
        </Link>

        <div className="flex-1 min-w-0">
          <Link href={`/users/${comment.userId}`}>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-medium text-sm pb-0.5">{comment.user.name}</span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(comment.createdAt, {
                  addSuffix: true,
                })}
              </span>
            </div>
          </Link>
          <p className="text-sm">{comment.value}</p>
          {/* TOD: Add reactions to the comments */}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
            >
              <MoreVertical />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => {}}>
              <MessageSquare className="size-4" />
              Reply
            </DropdownMenuItem>
            {comment.user.clerkId === userId && (
              <DropdownMenuItem onClick={() => deleteComment.mutate({ id: comment.id })}>
                <Trash className="size-4 text-destructive" />
                Delete comment
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
