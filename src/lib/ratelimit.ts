import { Ratelimit } from "@upstash/ratelimit"
import { redis } from "./redis"

export const rateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "10 s"),
  analytics: true,
  prefix: "@upstash/ratelimit",
})
