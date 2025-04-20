import { db } from "@/db"
import { videoReactions } from "@/db/schema"
import { createTRPCRouter, protectedProcedure } from "@/trpc/init"
import { and, eq } from "drizzle-orm"
import { z } from "zod"

export const videoReactionsRouter = createTRPCRouter({
  like: protectedProcedure
    .input(z.object({ videoId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const { id: userId } = ctx.user
      const { videoId } = input

      const [existingVideoReactionLike] = await db
        .select()
        .from(videoReactions)
        .where(
          and(
            eq(videoReactions.videoId, videoId),
            eq(videoReactions.userId, userId),
            eq(videoReactions.type, "like")
          )
        )

      if (existingVideoReactionLike) {
        const [deletedVideoReaction] = await db
          .delete(videoReactions)
          .where(
            and(eq(videoReactions.userId, userId), eq(videoReactions.videoId, videoId))
          )
          .returning()

        return deletedVideoReaction
      }

      const [createdVideoReaction] = await db
        .insert(videoReactions)
        .values({
          userId,
          videoId,
          type: "like",
        })
        .onConflictDoUpdate({
          target: [videoReactions.userId, videoReactions.videoId],
          set: {
            type: "like",
          },
        })
        .returning()

      return createdVideoReaction
    }),
  disLike: protectedProcedure
    .input(z.object({ videoId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const { id: userId } = ctx.user
      const { videoId } = input

      const [existingVideoReactionDisLike] = await db
        .select()
        .from(videoReactions)
        .where(
          and(
            eq(videoReactions.videoId, videoId),
            eq(videoReactions.userId, userId),
            eq(videoReactions.type, "dislike")
          )
        )

      if (existingVideoReactionDisLike) {
        const [deletedVideoReaction] = await db
          .delete(videoReactions)
          .where(
            and(eq(videoReactions.userId, userId), eq(videoReactions.videoId, videoId))
          )
          .returning()

        return deletedVideoReaction
      }

      const [createdVideoReaction] = await db
        .insert(videoReactions)
        .values({
          userId,
          videoId,
          type: "dislike",
        })
        .onConflictDoUpdate({
          target: [videoReactions.userId, videoReactions.videoId],
          set: {
            type: "dislike",
          },
        })
        .returning()

      return createdVideoReaction
    }),
})
