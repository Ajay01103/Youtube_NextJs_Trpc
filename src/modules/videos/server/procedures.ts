import { db } from "@/db"
import { videos, videoUpdateSchema } from "@/db/schema"
import { mux } from "@/lib/mux"
import { createTRPCRouter, protectedProcedure } from "@/trpc/init"
import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { and, eq } from "drizzle-orm"
import { UTApi } from "uploadthing/server"
import { workflow } from "@/lib/qstash"

export const videosRouter = createTRPCRouter({
  generateThumbnail: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user

      const { workflowRunId } = await workflow.trigger({
        url: `${process.env.UPSTASH_WORKFLOW_URL}/api/videos/workflows/title`,
        body: { userId, videoId: input.id },
      })

      return workflowRunId
    }),
  restoreThumbnail: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user

      const [existingVideo] = await db
        .select()
        .from(videos)
        .where(and(eq(videos.id, input.id), eq(videos.userId, userId)))

      if (!existingVideo) {
        throw new TRPCError({ code: "NOT_FOUND" })
      }

      if (existingVideo.thumbnailKey) {
        const utApi = new UTApi()

        await utApi.deleteFiles(existingVideo.thumbnailKey)
        await db
          .update(videos)
          .set({
            thumbnailKey: null,
            thumbnailUrl: null,
          })
          .where(and(eq(videos.id, input.id), eq(videos.userId, userId)))
      }

      if (!existingVideo.muxPlaybackId) {
        throw new TRPCError({ code: "BAD_REQUEST" })
      }

      const utApi = new UTApi()

      const tempThumbnailUrl = `https://image.mux.com/${existingVideo.muxPlaybackId}/thumbnail.jpg`
      const uploadedThumbnail = await utApi.uploadFilesFromUrl(tempThumbnailUrl)

      if (!uploadedThumbnail.data) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" })
      }

      const { key: thumbnailKey, ufsUrl: thumbnailUrl } = uploadedThumbnail.data

      const [updatedVideo] = await db
        .update(videos)
        .set({ thumbnailUrl, thumbnailKey })
        .where(and(eq(videos.id, input.id), eq(videos.userId, userId)))
        .returning()

      return updatedVideo
    }),
  remove: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user

      const [removedVideo] = await db
        .delete(videos)
        .where(and(eq(videos.id, input.id), eq(videos.userId, userId)))
        .returning()

      if (!removedVideo) {
        throw new TRPCError({ code: "NOT_FOUND" })
      }

      return removedVideo
    }),
  update: protectedProcedure.input(videoUpdateSchema).mutation(async ({ ctx, input }) => {
    const { id: userId } = ctx.user
    const { title, description, categoryId, visibility, id } = input

    if (!id) {
      throw new TRPCError({ code: "BAD_REQUEST" })
    }

    const [updateVideo] = await db
      .update(videos)
      .set({
        title,
        description,
        categoryId,
        visibility,
        updatedAt: new Date(),
      })
      .where(and(eq(videos.id, id), eq(videos.userId, userId)))
      .returning()

    if (!updateVideo) {
      throw new TRPCError({ code: "NOT_FOUND" })
    }

    return updateVideo
  }),
  create: protectedProcedure.mutation(async ({ ctx }) => {
    const { id: userId } = ctx.user

    const upload = await mux.video.uploads.create({
      new_asset_settings: {
        passthrough: userId,
        video_quality: "basic",
        playback_policy: ["public"],
        input: [
          {
            generated_subtitles: [
              {
                language_code: "en",
                name: "English",
              },
            ],
          },
        ],
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
