import { db } from "@/db"
import { commentReactions, comments, users } from "@/db/schema"
import { baseProcedure, createTRPCRouter, protectedProcedure } from "@/trpc/init"
import { TRPCError } from "@trpc/server"
import {
  and,
  count,
  desc,
  eq,
  getTableColumns,
  inArray,
  isNotNull,
  isNull,
  lt,
  or,
} from "drizzle-orm"
import { z } from "zod"

export const commentsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        videoId: z.string().uuid(),
        parentId: z.string().uuid().nullish(),
        value: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id: userId } = ctx.user
      const { videoId, parentId, value } = input

      const [existingComment] = await db
        .select()
        .from(comments)
        .where(inArray(comments.id, parentId ? [parentId] : []))

      if (!existingComment && parentId) {
        throw new TRPCError({ code: "NOT_FOUND" })
      }

      if (existingComment?.parentId && parentId) {
        throw new TRPCError({ code: "BAD_REQUEST" })
      }

      const [createdComment] = await db
        .insert(comments)
        .values({
          userId,
          videoId,
          parentId,
          value,
        })
        .returning()

      return createdComment
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const { id: userId } = ctx.user
      const { id } = input

      const [deletedComment] = await db
        .delete(comments)
        .where(and(eq(comments.userId, userId), eq(comments.id, id)))
        .returning()

      if (!deletedComment) {
        throw new TRPCError({ code: "NOT_FOUND" })
      }

      return deletedComment
    }),
  getMany: baseProcedure
    .input(
      z.object({
        videoId: z.string().uuid(),
        parentId: z.string().uuid().nullish(),
        cursor: z
          .object({
            id: z.string().uuid(),
            updatedAt: z.date(),
          })
          .nullish(),
        limit: z.number().min(1).max(100),
      })
    )
    .query(async ({ input, ctx }) => {
      const { videoId, cursor, limit, parentId } = input
      const { clerkUserId } = ctx

      let userId

      const [user] = await db
        .select()
        .from(users)
        .where(inArray(users.clerkId, clerkUserId ? [clerkUserId] : []))

      if (user) {
        userId = user.id
      }

      // Get total count of comments for this video
      const [totalData] = await db
        .select({
          count: count(),
        })
        .from(comments)
        .where(
          and(
            eq(comments.videoId, videoId)
            // isNull(comments.parentId)
          )
        )

      // Get comments with user info and reaction counts
      const commentsData = await db
        .select({
          ...getTableColumns(comments),
          user: users,
          likeCount: db.$count(
            commentReactions,
            and(
              eq(commentReactions.type, "like"),
              eq(commentReactions.commentId, comments.id)
            )
          ),
          dislikeCount: db.$count(
            commentReactions,
            and(
              eq(commentReactions.type, "dislike"),
              eq(commentReactions.commentId, comments.id)
            )
          ),
        })
        .from(comments)
        .where(
          and(
            eq(comments.videoId, videoId),
            parentId ? eq(comments.parentId, parentId) : isNull(comments.parentId),
            cursor
              ? or(
                  lt(comments.updatedAt, cursor.updatedAt),
                  and(
                    eq(comments.updatedAt, cursor.updatedAt),
                    lt(comments.id, cursor.id)
                  )
                )
              : undefined
          )
        )
        .innerJoin(users, eq(comments.userId, users.id))
        .orderBy(desc(comments.updatedAt), desc(comments.id))
        .limit(limit + 1)

      // Get viewer reactions if user is logged in
      let viewerReactionsMap = new Map()
      if (userId) {
        const viewerReactions = await db
          .select({
            commentId: commentReactions.commentId,
            type: commentReactions.type,
          })
          .from(commentReactions)
          .where(
            and(
              eq(commentReactions.userId, userId),
              inArray(
                commentReactions.commentId,
                commentsData.map((comment) => comment.id)
              )
            )
          )

        // Create a map of comment ID to reaction type
        for (const reaction of viewerReactions) {
          viewerReactionsMap.set(reaction.commentId, reaction.type)
        }
      }

      // Get reply counts for each comment
      const replyCountsMap = new Map()

      if (commentsData.length > 0) {
        const commentIds = commentsData.map((comment) => comment.id)

        const replyCounts = await db
          .select({
            parentId: comments.parentId,
            count: count(comments.id).as("count"),
          })
          .from(comments)
          .where(
            and(isNotNull(comments.parentId), inArray(comments.parentId, commentIds))
          )
          .groupBy(comments.parentId)

        // Create a map of parent comment ID to reply count
        for (const reply of replyCounts) {
          replyCountsMap.set(reply.parentId, reply.count)
        }
      }

      // Combine the data
      const data = commentsData.map((comment) => ({
        ...comment,
        viewerReaction: viewerReactionsMap.get(comment.id) || null,
        replyCount: replyCountsMap.get(comment.id) || 0,
      }))

      const hasMore = data.length > limit

      // remove the last item if there is more data
      const items = hasMore ? data.slice(0, -1) : data

      // set the next cursor to the last item if there is more data
      const lastItem = items[items.length - 1]
      const nextCursor = hasMore
        ? {
            id: lastItem.id,
            updatedAt: lastItem.updatedAt,
          }
        : null

      return {
        totalCount: totalData.count,
        items,
        nextCursor,
      }
    }),
})
