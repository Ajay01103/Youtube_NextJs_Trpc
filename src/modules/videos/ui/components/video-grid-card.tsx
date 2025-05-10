import Link from "next/link"
import { VideoGetManyOutput } from "../../types"
import { VideoThumbnail } from "./video-thumbnail"
import { VideoInfo } from "./video-info"

interface VideoGridCardProps {
  data: VideoGetManyOutput["items"][number]
  onRemove?: () => void
}

export const VideoGridCard = ({ data, onRemove }: VideoGridCardProps) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      <Link href={`/videos/${data.id}`}>
        <VideoThumbnail
          previewUrl={data.previewUrl}
          imageUrl={data.thumbnailUrl}
          duration={data.duration ?? 0}
        />
      </Link>

      <VideoInfo
        data={data}
        onRemove={onRemove}
      />
    </div>
  )
}
