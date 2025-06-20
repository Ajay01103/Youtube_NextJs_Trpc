import { useUser } from "@clerk/nextjs"
import {
  SidebarHeader,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { UserAvatar } from "@/components/user-avatar"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"

export const StudioSidebarHeader = () => {
  const { user } = useUser()
  const { state } = useSidebar()

  if (!user) {
    return (
      <SidebarHeader className="flex items-center justify-center pb-4">
        <Skeleton className="size-[112px] rounded-full" />
        <div className="flex flex-col items-center mt-2 gap-y-2">
          <Skeleton className="h-4 w-[80px]" />
          <Skeleton className="h-4 w-[100px]" />
        </div>
      </SidebarHeader>
    )
  }

  if (state === "collapsed") {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          tooltip={"Your profile"}
          asChild
        >
          <Link
            prefetch
            href={"/users/current"}
          >
            <UserAvatar
              avatarUrl={user.imageUrl}
              name={user?.emailAddresses[0]?.emailAddress?.split("@")[0]}
              size={"sm"}
            />
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  }

  return (
    <SidebarHeader className="flex items-center justify-center pb-4">
      <Link
        prefetch
        href="/users/current"
      >
        <UserAvatar
          avatarUrl={user?.imageUrl}
          name={user?.emailAddresses[0]?.emailAddress?.split("@")[0]}
          className="size-[112px] hover:opacity-80 transition-opacity"
        />
      </Link>

      <div className="flex flex-col items-center mt-2 gap-y-1">
        <p className="text-sm font-semibold">Your profile</p>
        <p className="text-xs text-muted-foreground">
          {user?.emailAddresses[0]?.emailAddress?.split("@")[0]}
        </p>
      </div>
    </SidebarHeader>
  )
}
