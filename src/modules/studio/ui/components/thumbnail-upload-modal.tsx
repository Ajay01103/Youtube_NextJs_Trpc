import { ResponsiveModal } from "@/components/responsive-dialog"
import { UploadDropzone } from "@/lib/uploadthing"
import { trpc } from "@/trpc/client"

interface Props {
  videoId: string
  open: boolean
  onOpenChnage: (open: boolean) => void
}

export const ThumbnailUploadModal = ({ onOpenChnage, open, videoId }: Props) => {
  const utils = trpc.useUtils()

  const onUploadComplete = () => {
    utils.studio.getOne.invalidate({ id: videoId })
    utils.studio.getMany.invalidate()
    onOpenChnage(false)
  }
  return (
    <ResponsiveModal
      title="Upload a thumbnail"
      open={open}
      onOpenChange={onOpenChnage}
    >
      <UploadDropzone
        endpoint="thumbnailUploader"
        input={{ videoId }}
        onClientUploadComplete={onUploadComplete}
      />
    </ResponsiveModal>
  )
}
