import { ResponsiveModal } from "@/components/responsive-dialog"
import { UploadDropzone } from "@/lib/uploadthing"
import { trpc } from "@/trpc/client"

interface Props {
  videoId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const ThumbnailUploadModal = ({ onOpenChange, open, videoId }: Props) => {
  const utils = trpc.useUtils()

  const onUploadComplete = () => {
    utils.studio.getMany.invalidate()
    utils.studio.getOne.invalidate({ id: videoId })
    onOpenChange(false)
  }

  return (
    <ResponsiveModal
      title="Upload a thumbnail"
      open={open}
      onOpenChange={onOpenChange}
    >
      <UploadDropzone
        endpoint="thumbnailUploader"
        input={{ videoId }}
        onClientUploadComplete={onUploadComplete}
      />
    </ResponsiveModal>
  )
}
