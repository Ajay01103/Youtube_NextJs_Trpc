import { toast } from "sonner"
import { useClerk } from "@clerk/nextjs"
import { trpc } from "@/trpc/client"

interface UserSubscriptionProps {
  userId: string
  isSubscribed: boolean
  fromVideoId?: string
}

export const useSubscription = ({
  isSubscribed,
  userId,
  fromVideoId,
}: UserSubscriptionProps) => {
  const clerk = useClerk()
  const utils = trpc.useUtils()

  const subscribe = trpc.subscriptions.create.useMutation({
    onSuccess: () => {
      toast.success("Subscribed")
      if (fromVideoId) {
        utils.videos.getOne.invalidate({ id: fromVideoId })
      }
    },
    onError: (error) => {
      toast.error("Something went wrong")

      if (error.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn()
      }
    },
  })

  const unSubscribe = trpc.subscriptions.remove.useMutation({
    onSuccess: () => {
      toast.success("Unsubscribed")
      if (fromVideoId) {
        utils.videos.getOne.invalidate({ id: fromVideoId })
      }
    },
    onError: (error) => {
      toast.error("Something went wrong")

      if (error.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn()
      }
    },
  })

  const isPending = subscribe.isPending || unSubscribe.isPending

  const onClick = () => {
    if (isSubscribed) {
      unSubscribe.mutate({ userId })
    } else {
      subscribe.mutate({ userId })
    }
  }

  return {
    isPending,
    onClick,
  }
}
