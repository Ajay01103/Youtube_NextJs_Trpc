import { VideoView } from "@/modules/studio/ui/view/video-view"
import { HydrateClient, trpc } from "@/trpc/server"

export const dynamic = "force-dynamic"

interface Props {
  params: Promise<{ videoId: string }>
}

const Page = async ({ params }: Props) => {
  const { videoId } = await params
  void trpc.studio.getOne.prefetch({ id: videoId })

  return (
    <HydrateClient>
      <VideoView videoId={videoId} />
    </HydrateClient>
  )
}

export default Page
