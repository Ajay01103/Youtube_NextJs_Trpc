import { ResponsiveModal } from "@/components/responsive-dialog"
import { UploadDropzone } from "@/lib/uploadthing"
import { trpc } from "@/trpc/client"

interface Props {
  userId: string
  open: boolean
  onOpenChnage: (open: boolean) => void
}

export const BannerUploadModal = ({ onOpenChnage, open, userId }: Props) => {
  const utils = trpc.useUtils()

  const onUploadComplete = () => {
    utils.users.getOne.invalidate({id: userId})
    onOpenChnage(false)
  }

  return (
    <ResponsiveModal
      title="Upload a banner"
      open={open}
      onOpenChange={onOpenChnage}
    >
      <UploadDropzone
        endpoint="bannerUploader"
        onClientUploadComplete={onUploadComplete}
      />
    </ResponsiveModal>
  )
}
