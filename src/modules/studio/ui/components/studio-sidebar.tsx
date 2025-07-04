"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

import Link from "next/link"
import { LogOut, Video } from "lucide-react"
import { usePathname } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import { StudioSidebarHeader } from "./studio-sidebar-header"

export const StudioSidebar = () => {
  const pathname = usePathname()

  return (
    <Sidebar
      className="pt-16 z-40 border-none"
      collapsible="icon"
    >
      <SidebarContent className="bg-background">
        <SidebarGroup>
          <SidebarMenu>
            <StudioSidebarHeader />

            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={pathname === "/studio"}
                tooltip="Exit studio"
                asChild
              >
                <Link
                  prefetch
                  href="/studio"
                >
                  <Video className="size-5" />
                  <span>Content</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <Separator />

            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Exit studio"
                asChild
              >
                <Link
                  prefetch
                  href="/"
                >
                  <LogOut className="size-5" />
                  <span>Exit Studio</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
