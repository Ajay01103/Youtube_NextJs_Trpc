import { categoriesRouter } from "@/modules/categories/server/procedures"
import { studioRouter } from "@/modules/studio/server/procedures"
import { createTRPCRouter } from "../init"
import { videosRouter } from "@/modules/videos/server/procedures"
import { videoviewsRouter } from "@/modules/video-views/server/procedure"
import { videoReactionsRouter } from "@/modules/video-reactions/server/procedure"
import { subscriptionsRouter } from "@/modules/subscriptions/server/procedures"

export const appRouter = createTRPCRouter({
  categories: categoriesRouter,
  studio: studioRouter,
  videos: videosRouter,
  videoViews: videoviewsRouter,
  videoReactions: videoReactionsRouter,
  subscriptions: subscriptionsRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter
