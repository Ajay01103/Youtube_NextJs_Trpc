import { db } from "@/db"
import { users, videos } from "@/db/schema"
import { auth } from "@clerk/nextjs/server"
import { eq, and } from "drizzle-orm"
import { createUploadthing, type FileRouter } from "uploadthing/next"
import { UploadThingError, UTApi } from "uploadthing/server"
import { z } from "zod"

const f = createUploadthing()

export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  thumbnailUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .input(z.object({ videoId: z.string().uuid() }))
    .middleware(async ({ input }) => {
      const { userId: clerkUserId } = await auth()

      // If you throw, the user will not be able to upload
      if (!clerkUserId) throw new UploadThingError("Unauthorized")

      const [user] = await db.select().from(users).where(eq(users.clerkId, clerkUserId))

      if (!user) throw new UploadThingError("Unauthorized")

      const [existingVideo] = await db
        .select({
          thumbnailKey: videos.thumbnailKey,
        })
        .from(videos)
        .where(and(eq(videos.id, input.videoId), eq(videos.userId, user.id)))

      if (!existingVideo) {
        throw new UploadThingError("Not Found")
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
          .where(and(eq(videos.id, input.videoId), eq(videos.userId, user.id)))
      }

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { user, ...input }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      await db
        .update(videos)
        .set({
          thumbnailUrl: file.ufsUrl,
          thumbnailKey: file.key,
        })
        .where(and(eq(videos.id, metadata.videoId), eq(videos.userId, metadata.user.id)))

      //   console.log("file url", file.ufsUrl)

      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { uploadedBy: metadata.user.id }
    }),
  bannerUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(async () => {
      const { userId: clerkUserId } = await auth()

      // If you throw, the user will not be able to upload
      if (!clerkUserId) throw new UploadThingError("Unauthorized")

      const [existingUser] = await db.select().from(users).where(eq(users.clerkId, clerkUserId))

      if (!existingUser) throw new UploadThingError("Unauthorized")

      

      if (existingUser.bannerKey) {
        const utApi = new UTApi()

        await utApi.deleteFiles(existingUser.bannerKey)
        await db
          .update(users)
          .set({
            bannerKey: null,
            bannerUrl: null,
          })
          .where(and(eq(users.id, existingUser.id)))
      }

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: existingUser.id }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      await db
        .update(users)
        .set({
          bannerUrl: file.ufsUrl,
          bannerKey: file.key,
        })
        .where(and(eq(users.id, metadata.userId)))

      //   console.log("file url", file.ufsUrl)

      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { uploadedBy: metadata.userId }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
