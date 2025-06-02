import { db } from "@/db"
import {
  playLists,
  playlistVideos,
  users,
  videoReactions,
  videos,
  videoViews,
} from "@/db/schema"
import { createTRPCRouter, protectedProcedure } from "@/trpc/init"
import { TRPCError } from "@trpc/server"
import { and, desc, eq, getTableColumns, lt, or, sql } from "drizzle-orm"
import { z } from "zod"

export const playlistsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { name } = input
      const { id: userId } = ctx.user

      const [createdPlaylist] = await db
        .insert(playLists)
        .values({
          userId,
          name,
        })
        .returning()

      if (!createdPlaylist) {
        throw new TRPCError({ code: "BAD_REQUEST" })
      }

      return createdPlaylist
    }),
  addVideo: protectedProcedure
    .input(
      z.object({
        playlistId: z.string().uuid(),
        videoId: z.string().uuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { playlistId, videoId } = input
      const { id: userId } = ctx.user

      const [existingPlaylist] = await db
        .select()
        .from(playLists)
        .where(and(eq(playLists.id, playlistId), eq(playLists.userId, userId)))

      if (!existingPlaylist) {
        throw new TRPCError({ code: "NOT_FOUND" })
      }

      const [existingvideo] = await db
        .select()
        .from(videos)
        .where(eq(videos.id, videoId))

      if (!existingvideo) {
        throw new TRPCError({ code: "NOT_FOUND" })
      }

      const [existingPlaylistVideo] = await db
        .select()
        .from(playlistVideos)
        .where(
          and(
            eq(playlistVideos.playlistId, playlistId),
            eq(playlistVideos.videoId, videoId)
          )
        )

      if (existingPlaylistVideo) {
        throw new TRPCError({ code: "CONFLICT" })
      }

      const [createPlaylistVideo] = await db
        .insert(playlistVideos)
        .values({
          playlistId,
          videoId,
        })
        .returning()

      return createPlaylistVideo
    }),
  removeVideo: protectedProcedure
    .input(
      z.object({
        playlistId: z.string().uuid(),
        videoId: z.string().uuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { playlistId, videoId } = input
      const { id: userId } = ctx.user

      const [existingPlaylist] = await db
        .select()
        .from(playLists)
        .where(and(eq(playLists.id, playlistId), eq(playLists.userId, userId)))

      if (!existingPlaylist) {
        throw new TRPCError({ code: "NOT_FOUND" })
      }

      const [existingvideo] = await db
        .select()
        .from(videos)
        .where(eq(videos.id, videoId))

      if (!existingvideo) {
        throw new TRPCError({ code: "NOT_FOUND" })
      }

      const [existingPlaylistVideo] = await db
        .select()
        .from(playlistVideos)
        .where(
          and(
            eq(playlistVideos.playlistId, playlistId),
            eq(playlistVideos.videoId, videoId)
          )
        )

      if (!existingPlaylistVideo) {
        throw new TRPCError({ code: "NOT_FOUND" })
      }

      const [deletedPlaylistVideo] = await db
        .delete(playlistVideos)
        .where(
          and(
            eq(playlistVideos.playlistId, playlistId),
            eq(playlistVideos.videoId, videoId)
          )
        )
        .returning()

      return deletedPlaylistVideo
    }),
  getHistory: protectedProcedure
    .input(
      z.object({
        cursor: z
          .object({
            id: z.string().uuid(),
            viewedAt: z.date(),
          })
          .nullish(),
        limit: z.number().min(1).max(100),
      })
    )
    .query(async ({ input, ctx }) => {
      const { id: userId } = ctx.user
      const { limit, cursor } = input

      const viewerVideoViews = db.$with("video_views").as(
        db
          .select({
            videoId: videoViews.videoId,
            viewedAt: videoViews.updatedAt,
          })
          .from(videoViews)
          .where(eq(videoViews.userId, userId))
      )

      const data = await db
        .with(viewerVideoViews)
        .select({
          ...getTableColumns(videos),
          user: users,
          viewedAt: viewerVideoViews.viewedAt,
          viewCount: db.$count(videoViews, eq(videoViews.videoId, videos.id)),
          likesCount: db.$count(
            videoReactions,
            and(
              eq(videoReactions.videoId, videos.id),
              eq(videoReactions.type, "like")
            )
          ),
          dislikesCount: db.$count(
            videoReactions,
            and(
              eq(videoReactions.videoId, videos.id),
              eq(videoReactions.type, "dislike")
            )
          ),
        })
        .from(videos)
        .innerJoin(users, eq(videos.userId, users.id))
        .innerJoin(viewerVideoViews, eq(videos.id, viewerVideoViews.videoId))
        .where(
          and(
            eq(videos.visibility, "public"),
            cursor
              ? or(
                  lt(viewerVideoViews.viewedAt, cursor.viewedAt),
                  and(
                    eq(viewerVideoViews.viewedAt, cursor.viewedAt),
                    lt(videos.id, cursor.id)
                  )
                )
              : undefined
          )
        )
        .orderBy(desc(viewerVideoViews.viewedAt), desc(videos.id))
        // Add 1 to the limit to check if there is more data
        .limit(limit + 1)

      const hasMore = data.length > limit
      // remove the last item if there is more data

      const items = hasMore ? data.slice(0, -1) : data
      // Set the next cursor to the last item if there is more data

      const lastItem = items[items.length - 1]
      const nextCursor = hasMore
        ? {
            id: lastItem.id,
            viewedAt: lastItem.viewedAt,
          }
        : null

      return { items, nextCursor }
    }),
  getMany: protectedProcedure
    .input(
      z.object({
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
      const { id: userId } = ctx.user
      const { limit, cursor } = input

      const data = await db
        .select({
          ...getTableColumns(playLists),
          videoCount: db.$count(
            playlistVideos,
            eq(playLists.id, playlistVideos.playlistId)
          ),
          user: users,
          thumbnailUrl: sql<string | null>`(
          SELECT v.thumbnail_url
          FROM ${playlistVideos} pv
          JOIN ${videos} v ON v.id = pv.video_id
          WHERE pv.playlist_id = ${playLists.id}
          ORDER BY pv.updated_at DESC
          LIMIT 1
          )`,
        })
        .from(playLists)
        .innerJoin(users, eq(playLists.userId, users.id))
        .where(
          and(
            eq(playLists.userId, userId),
            cursor
              ? or(
                  lt(playLists.updatedAt, cursor.updatedAt),
                  and(
                    eq(playLists.updatedAt, cursor.updatedAt),
                    lt(playLists.id, cursor.id)
                  )
                )
              : undefined
          )
        )
        .orderBy(desc(playLists.updatedAt), desc(playLists.id))
        // Add 1 to the limit to check if there is more data
        .limit(limit + 1)

      // Handle empty results
      if (!data || data.length === 0) {
        return {
          items: [],
          nextCursor: null,
        }
      }

      const hasMore = data.length > limit
      const items = hasMore ? data.slice(0, -1) : data
      const lastItem = items[items.length - 1]

      return {
        items,
        nextCursor:
          hasMore && lastItem
            ? {
                id: lastItem.id,
                updatedAt: lastItem.updatedAt,
              }
            : null,
      }
    }),
  getManyForVideo: protectedProcedure
    .input(
      z.object({
        videoId: z.string().uuid(),
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
      const { id: userId } = ctx.user
      const { limit, cursor, videoId } = input

      const data = await db
        .select({
          ...getTableColumns(playLists),
          videoCount: db.$count(
            playlistVideos,
            eq(playLists.id, playlistVideos.playlistId)
          ),
          user: users,
          containsVideo: videoId
            ? sql<boolean>`(
          SELECT EXISTS (
          SELECT 1 FROM ${playlistVideos} pv WHERE pv.playlist_id = ${playLists.id} AND pv.video_id = ${videoId}
          )
          )`
            : sql<boolean>`false`,
        })
        .from(playLists)
        .innerJoin(users, eq(playLists.userId, users.id))
        .where(
          and(
            eq(playLists.userId, userId),
            cursor
              ? or(
                  lt(playLists.updatedAt, cursor.updatedAt),
                  and(
                    eq(playLists.updatedAt, cursor.updatedAt),
                    lt(playLists.id, cursor.id)
                  )
                )
              : undefined
          )
        )
        .orderBy(desc(playLists.updatedAt), desc(playLists.id))
        // Add 1 to the limit to check if there is more data
        .limit(limit + 1)

      const hasMore = data.length > limit
      // remove the last item if there is more data

      const items = hasMore ? data.slice(0, -1) : data
      // Set the next cursor to the last item if there is more data

      const lastItem = items[items.length - 1]
      const nextCursor = hasMore
        ? {
            id: lastItem.id,
            updatedAt: lastItem.updatedAt,
          }
        : null

      return { items, nextCursor }
    }),
  getLiked: protectedProcedure
    .input(
      z.object({
        cursor: z
          .object({
            id: z.string().uuid(),
            likedAt: z.date(),
          })
          .nullish(),
        limit: z.number().min(1).max(100),
      })
    )
    .query(async ({ input, ctx }) => {
      const { id: userId } = ctx.user
      const { limit, cursor } = input

      // const viewerVideoReactions = db.$with("video_reactions").as(
      //   db
      //     .select({
      //       videoId: videoReactions.videoId,
      //       likedAt: videoReactions.updatedAt,
      //     })
      //     .from(videoReactions)
      //     .where(
      //       and(
      //         eq(videoReactions.userId, userId),
      //         eq(videoReactions.type, reactionType.enumValues[0])
      //       )
      //     )
      // )

      const data = await db
        // .with(viewerVideoReactions)
        .select({
          ...getTableColumns(videos),
          user: users,
          likedAt: videoReactions.updatedAt,
          viewCount: db.$count(videoViews, eq(videoViews.videoId, videos.id)),
          likesCount: db.$count(
            videoReactions,
            and(
              eq(videoReactions.videoId, videos.id),
              eq(videoReactions.type, "like")
            )
          ),
          dislikesCount: db.$count(
            videoReactions,
            and(
              eq(videoReactions.videoId, videos.id),
              eq(videoReactions.type, "dislike")
            )
          ),
        })
        .from(videos)
        .innerJoin(users, eq(videos.userId, users.id))
        .innerJoin(
          videoReactions,
          and(
            eq(videos.id, videoReactions.videoId),
            eq(videoReactions.userId, userId),
            eq(videoReactions.type, "like")
          )
        )
        .where(
          and(
            eq(videos.visibility, "public"),
            cursor
              ? or(
                  lt(videoReactions.updatedAt, cursor.likedAt),
                  and(
                    eq(videoReactions.updatedAt, cursor.likedAt),
                    lt(videos.id, cursor.id)
                  )
                )
              : undefined
          )
        )
        .orderBy(desc(videoReactions.updatedAt), desc(videos.id))
        // Add 1 to the limit to check if there is more data
        .limit(limit + 1)

      const hasMore = data.length > limit
      // remove the last item if there is more data

      const items = hasMore ? data.slice(0, -1) : data
      // Set the next cursor to the last item if there is more data

      const lastItem = items[items.length - 1]
      const nextCursor = hasMore
        ? {
            id: lastItem.id,
            likedAt: lastItem.likedAt,
          }
        : null

      return { items, nextCursor }
    }),
})
