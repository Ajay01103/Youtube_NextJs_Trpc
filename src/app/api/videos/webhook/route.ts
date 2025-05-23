import { db } from "@/db"
import { videos } from "@/db/schema"
import { mux } from "@/lib/mux"
import {
  VideoAssetCreatedWebhookEvent,
  VideoAssetDeletedWebhookEvent,
  VideoAssetErroredWebhookEvent,
  VideoAssetReadyWebhookEvent,
  VideoAssetTrackReadyWebhookEvent,
} from "@mux/mux-node/resources/webhooks"
import { eq } from "drizzle-orm"
import { headers } from "next/headers"
import { UTApi } from "uploadthing/server"

const SIGNING_SECRET = process.env.MUX_WEBHOOK_SECRET

type WebhookEvent =
  | VideoAssetCreatedWebhookEvent
  | VideoAssetErroredWebhookEvent
  | VideoAssetReadyWebhookEvent
  | VideoAssetTrackReadyWebhookEvent
  | VideoAssetDeletedWebhookEvent

export const POST = async (request: Request) => {
  if (!SIGNING_SECRET) {
    throw new Error("MUX_WEBHOOK_SIGNING_SECRET_NOT_FOUND")
  }

  const headersPayload = await headers()
  const muxSignature = headersPayload.get("mux-signature")

  if (!muxSignature) {
    throw new Response("No Signature found", { status: 401 })
  }

  const payload = await request.json()
  const body = JSON.stringify(payload)

  mux.webhooks.verifySignature(
    body,
    {
      "mux-signature": muxSignature,
    },
    SIGNING_SECRET
  )

  switch (payload.type as WebhookEvent["type"]) {
    case "video.asset.created": {
      const data = payload.data as VideoAssetCreatedWebhookEvent["data"]

      if (!data.upload_id) {
        return new Response("No Upload ID found", { status: 400 })
      }

      await db
        .update(videos)
        .set({
          muxAssetId: data.id,
          muxStatus: data.status,
        })
        .where(eq(videos.muxUploadId, data.upload_id))
      break
    }
    case "video.asset.ready": {
      const data = payload.data as VideoAssetCreatedWebhookEvent["data"]
      const playbackId = data.playback_ids?.[0].id

      if (!data.upload_id) {
        return new Response("Missing Upload Id", { status: 400 })
      }

      if (!playbackId) {
        return new Response("Missing Playback Id", { status: 400 })
      }

      const tempThumbnailUrl = `https://image.mux.com/${playbackId}/thumbnail.jpg`
      const tempPreviewUrl = `https://image.mux.com/${playbackId}/animated.gif`
      const duration = data.duration ? Math.round(data.duration * 1000) : 0

      const utApi = new UTApi()
      const [uploadThumbnail, uploadPreview] = await utApi.uploadFilesFromUrl([
        tempThumbnailUrl,
        tempPreviewUrl,
      ])

      if (!uploadThumbnail.data || !uploadPreview.data) {
        return new Response("Failed to upload thumbnail or preview", { status: 500 })
      }

      const { key: thumbnailKey, ufsUrl: thumbnailUrl } = uploadThumbnail.data
      const { key: previewKey, ufsUrl: previewUrl } = uploadPreview.data

      await db
        .update(videos)
        .set({
          muxStatus: data.status,
          muxPlaybackId: playbackId,
          muxAssetId: data.id,
          thumbnailUrl,
          thumbnailKey,
          previewUrl,
          previewKey,
          duration,
        })
        .where(eq(videos.muxUploadId, data.upload_id))
      break
    }
    case "video.asset.errored": {
      const data = payload.data as VideoAssetErroredWebhookEvent["data"]

      if (!data.upload_id) {
        return new Response("Missing upload Id", { status: 400 })
      }

      await db
        .update(videos)
        .set({
          muxStatus: data.status,
        })
        .where(eq(videos.muxUploadId, data.upload_id))
      break
    }

    case "video.asset.deleted": {
      const data = payload.data as VideoAssetDeletedWebhookEvent["data"]

      if (!data.upload_id) {
        return new Response("Missing upload Id", { status: 400 })
      }

      await db.delete(videos).where(eq(videos.muxUploadId, data.upload_id))
      break
    }

    case "video.asset.track.ready": {
      const data = payload.data as VideoAssetReadyWebhookEvent["data"] & {
        asset_id: string
      }

      // data.asset_id exists but typescript falsely says it does not exist

      const assetId = data.asset_id
      const trackId = data.id
      const status = data.status

      if (!assetId) {
        return new Response("Missing asset Id", { status: 400 })
      }

      await db
        .update(videos)
        .set({
          muxTrackId: trackId,
          muxTrackStatus: status,
        })
        .where(eq(videos.muxAssetId, assetId))
      break
    }
  }

  return new Response("Webhook Received", { status: 200 })
}
