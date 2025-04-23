import Link from "next/link"
import { useAuth } from "@clerk/nextjs"

import { Button } from "@/components/ui/button"
import { UserAvatar } from "@/components/user-avatar"
import { VideoGetOneOutput } from "../../types"
import { SubscriptionButton } from "@/modules/subscriptions/ui/components/subscription-button"
import { UserInfo } from "@/modules/users/ui/components/user-info"
import { useSubscription } from "@/modules/subscriptions/hooks/use-subscriptions"

interface VideoOwnerProps {
  user: VideoGetOneOutput["user"]
  videoId: string
}

export const VideoOwner = ({ user, videoId }: VideoOwnerProps) => {
  const { userId, isLoaded } = useAuth()
  const { isPending, onClick } = useSubscription({
    userId: user.id,
    isSubscribed: user.viewerSubscribed,
    fromVideoId: videoId,
  })

  const isOwner = userId === user.clerkId

  return (
    <div className="flex items-center sm:items-start justify-between sm:justify-start gap-3 min-w-0">
      <Link href={`/users/${user.id}`}>
        <div className="flex items-center gap-3 min-w-0">
          <UserAvatar
            size="lg"
            avatarUrl={user.imageUrl}
            name={user.name}
          />

          <div className="flex flex-col min-w-0">
            <UserInfo
              name={user.name}
              size="lg"
            />
            <span className="text-sm text-muted-foreground line-clamp-1">
              {user.subscriberCount} subscribers
            </span>
          </div>
        </div>
      </Link>

      {isOwner ? (
        <Button
          variant={"secondary"}
          className="rounded-full"
          asChild
        >
          <Link href={`/studio/videos/${videoId}`}>Edit video</Link>
        </Button>
      ) : (
        <SubscriptionButton
          onClick={onClick}
          disabled={isPending || isLoaded}
          isSubscribed={user.viewerSubscribed}
          className="flex-none"
        />
      )}
    </div>
  )
}
