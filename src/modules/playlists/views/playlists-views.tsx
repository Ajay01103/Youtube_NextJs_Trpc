"use client"

import { Button } from "@/components/ui/button"
import { LikedVideosSection } from "../sections/liked-videos-section"
import { PlaylistCreateModal } from "../ui/components/playlist-create-modal"
import { useState } from "react"
import { Plus } from "lucide-react"
import { PlaylistsSection } from "../sections/playlist-videos-section"

export const PlaylistsView = () => {
  const [createModalOpen, setCreateModalOpen] = useState(false)
  return (
    <div className="max-w-[2400px] mx-auto mb-10 px-4 pt-2.5 flex flex-col gap-y-6">
      <PlaylistCreateModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
      />
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Playlists</h1>
          <p className="text-xs text-muted-foreground">
            Playlists you hae created
          </p>
        </div>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full"
          onClick={() => setCreateModalOpen(true)}
        >
          <Plus />
        </Button>
      </div>
      <PlaylistsSection />
    </div>
  )
}
