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
import {
  ChevronDown,
  ChevronUp,
  MessageSquare,
  MoreVertical,
  ThumbsDown,
  ThumbsUp,
  Trash,
} from "lucide-react"
import Link from "next/link"
import { CommentsGetManyOutput } from "../../types"
import { useAuth, useClerk } from "@clerk/nextjs"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { CommentsForm } from "./comments-form"
import { CommentReplies } from "./comment-replies"

interface CommentItemProps {
  comment: CommentsGetManyOutput["items"][number]
  variant?: "reply" | "comment"
}

export const CommentItem = ({ comment, variant = "comment" }: CommentItemProps) => {
  const { userId } = useAuth()
  const clerk = useClerk()

  const [isReplyOpen, setIsReplyOpen] = useState(false)
  const [isRepliesOpen, setIsRepliesOpen] = useState(false)

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

  const likeComment = trpc.commentsReaction.like.useMutation({
    onSuccess: () => {
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

  const dislikeComment = trpc.commentsReaction.disLike.useMutation({
    onSuccess: () => {
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
            size={variant === "comment" ? "lg" : "sm"}
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

          {/* Comment reaction */}
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center">
              <Button
                className="size-8"
                size="icon"
                variant="ghost"
                onClick={() => likeComment.mutate({ commentId: comment.id })}
              >
                <ThumbsUp
                  className={cn(comment.viewerReaction === "like" && "fill-black")}
                />
              </Button>
              <span className="text-xs text-muted-foreground">{comment.likeCount}</span>

              <Button
                className="size-8"
                size="icon"
                variant="ghost"
                onClick={() => dislikeComment.mutate({ commentId: comment.id })}
              >
                <ThumbsDown
                  className={cn(comment.viewerReaction === "dislike" && "fill-black")}
                />
              </Button>
              <span className="text-xs text-muted-foreground">
                {comment.dislikeCount}
              </span>
            </div>
            {variant === "comment" && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8"
                onClick={() => setIsReplyOpen(true)}
              >
                Reply
              </Button>
            )}
          </div>
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
            {variant === "comment" && (
              <DropdownMenuItem onClick={() => setIsReplyOpen(true)}>
                <MessageSquare className="size-4" />
                Reply
              </DropdownMenuItem>
            )}
            {comment.user.clerkId === userId && (
              <DropdownMenuItem onClick={() => deleteComment.mutate({ id: comment.id })}>
                <Trash className="size-4 text-destructive" />
                Delete comment
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {isReplyOpen && variant === "comment" && (
        <div className="mt-4 pl-14">
          <CommentsForm
            variant="reply"
            parentId={comment.id}
            videoId={comment.videoId}
            onCancel={() => setIsReplyOpen(false)}
            onSuccess={() => {
              setIsReplyOpen(false)
              setIsRepliesOpen(true)
            }}
          />
        </div>
      )}

      {comment.replyCount > 0 && variant === "comment" && (
        <div className="pl-14">
          <Button
            size="sm"
            variant="tertiary"
            onClick={() => setIsRepliesOpen((current) => !current)}
          >
            {isRepliesOpen ? <ChevronUp /> : <ChevronDown />}
            {comment.replyCount} replies
          </Button>
        </div>
      )}

      {comment.replyCount > 0 && variant === "comment" && isRepliesOpen && (
        <CommentReplies
          parentId={comment.id}
          videoId={comment.videoId}
        />
      )}
    </div>
  )
}
