"use client"

import { ResponsiveModal } from "@/components/responsive-dialog"
import { Button } from "@/components/ui/button"
import { trpc } from "@/trpc/client"
import { Loader2, PlusIcon } from "lucide-react"
import { toast } from "sonner"
import { StudioUploader } from "./studio-uploader"

export const StudioUploadModal = () => {
  const utils = trpc.useUtils()
  const create = trpc.videos.create.useMutation({
    onSuccess: () => {
      toast.success("Video Created")
      utils.studio.getMany.invalidate()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  return (
    <>
      <ResponsiveModal
        title="Video Uploader"
        open={!!create.data?.url}
        onOpenChange={() => create.reset()}
      >
        {create.data?.url ? (
          <StudioUploader
            endpoint={create.data?.url}
            onSuccess={() => {}}
          />
        ) : (
          <Loader2 className="size-4" />
        )}
      </ResponsiveModal>
      <Button
        variant="secondary"
        onClick={() => create.mutate()}
        disabled={create.isPending}
      >
        {create.isPending ? (
          <Loader2 className="animate-spin size-3" />
        ) : (
          <PlusIcon className="size-4" />
        )}
        {create.isPending ? <span>creating</span> : <span>Create</span>}
      </Button>
    </>
  )
}
