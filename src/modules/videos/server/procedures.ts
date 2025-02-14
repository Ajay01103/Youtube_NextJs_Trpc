import { db } from "@/db"
import { videos } from "@/db/schema"
import { mux } from "@/lib/mux"
import { createTRPCRouter, protectedProcedure } from "@/trpc/init"

export const videosRouter = createTRPCRouter({
  create: protectedProcedure.mutation(async ({ ctx }) => {
    const { id: userId } = ctx.user

    const upload = await mux.video.uploads.create({
      new_asset_settings: {
        passthrough: userId,
        video_quality: "basic",
        playback_policy: ["public"],
      },
      cors_origin: "*", // TODO: in production change it
    })

    const [video] = await db
      .insert(videos)
      .values({
        userId,
        title: "Untitled",
        muxStatus: "Waiting",
        muxUploadId: upload.id,
      })
      .returning()

    return {
      video,
      url: upload.url,
    }
  }),
})
