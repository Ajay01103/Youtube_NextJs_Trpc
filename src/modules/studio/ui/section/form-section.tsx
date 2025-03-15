"use client"

import { Button } from "@/components/ui/button"
import { trpc } from "@/trpc/client"
import { Suspense, useState } from "react"
import { ErrorBoundary } from "react-error-boundary"

import { z } from "zod"

import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { videoUpdateSchema } from "@/db/schema"
import { VideoPlayer } from "@/modules/videos/ui/components/video-player"
import {
  CheckCircle2,
  Copy,
  Globe2,
  ImagePlus,
  Lock,
  MoreVertical,
  RotateCcw,
  Router,
  Sparkles,
  TrashIcon,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { snakeCaseToTitle } from "@/lib/utils"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { THUMBNAIL_FALLBACK } from "@/modules/constants"
import { ThumbnailUploadModal } from "../components/thumbnail-upload-modal"

interface Props {
  videoId: string
}

export const FormSection = ({ videoId }: Props) => {
  return (
    <Suspense fallback={<FormSectionSkeleton />}>
      <ErrorBoundary fallback={<p>Error!!!</p>}>
        <FormSectionSuspense videoId={videoId} />
      </ErrorBoundary>
    </Suspense>
  )
}

const FormSectionSkeleton = () => {
  return <p>Loading...</p>
}

export const FormSectionSuspense = ({ videoId }: Props) => {
  const router = useRouter()
  const [isCopied, setIsCopied] = useState(false)
  const [thumbnailModalOpen, setThumbnailModalopen] = useState(false)

  const utils = trpc.useUtils()
  const [video] = trpc.studio.getOne.useSuspenseQuery({ id: videoId })
  const [categories] = trpc.categories.getMany.useSuspenseQuery()

  const update = trpc.videos.update.useMutation({
    onSuccess: () => {
      toast.success("Video updated")
      utils.studio.getMany.invalidate()
      utils.studio.getOne.invalidate({ id: videoId })
    },
    onError: (error) => {
      toast.error("Something went wrong", {
        description: error.message,
      })
    },
  })

  const onRemove = trpc.videos.remove.useMutation({
    onSuccess: () => {
      toast.success("Video removed")
      utils.studio.getMany.invalidate()
      router.push("/studio")
    },
    onError: () => {
      toast.error("Something went wrong")
    },
  })

  const restoreThumbnail = trpc.videos.restoreThumbnail.useMutation({
    onSuccess: () => {
      utils.studio.getMany.invalidate()
      utils.studio.getOne.invalidate({ id: videoId })
      toast.success("Thumbnail Restored")
    },
    onError: () => {
      toast.error("Something went wrong")
    },
  })

  const generateThumbnail = trpc.videos.generateThumbnail.useMutation({
    onSuccess: () => {
      toast.success("Background job started", {
        description: "It may take some time",
      })
    },
    onError: () => {
      toast.error("Something went wrong")
    },
  })

  const form = useForm<z.infer<typeof videoUpdateSchema>>({
    resolver: zodResolver(videoUpdateSchema),
    defaultValues: video,
  })

  const onSubmit = (data: z.infer<typeof videoUpdateSchema>) => {
    update.mutate(data)
  }

  // if deploying outside vercel wtachout this
  const fullUrl = `${process.env.VERCEL_URL || "http://localhost:3000"}/videos/${videoId}`

  const onCopy = async () => {
    await navigator.clipboard.writeText(fullUrl)
    setIsCopied(true)

    setTimeout(() => {
      setIsCopied(false)
    }, 2000)
  }

  return (
    <>
      <ThumbnailUploadModal
        open={thumbnailModalOpen}
        onOpenChnage={setThumbnailModalopen}
        videoId={videoId}
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Video Details</h1>
              <p className="text-sm text-muted-foreground">Manage your video Details</p>
            </div>

            <div className="flex items-center gap-x-2">
              <Button
                type="submit"
                disabled={update.isPending}
              >
                Save
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                  >
                    <MoreVertical />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => onRemove.mutate({ id: videoId })}>
                    <TrashIcon className="size-4 mr-2 text-destructive" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="space-y-8 lg:col-span-3">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    {/* Add Ai Generated Title */}
                    <FormLabel>Title</FormLabel>

                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Add title for video"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* TODO: Add a thumbnail field */}
              <FormField
                name="thumbnailUrl"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thumbnail</FormLabel>
                    <div className="p-0.5 border border-dashed border-neutral-400 relative h-[86px] w-[153px] group">
                      <Image
                        src={video.thumbnailUrl ?? THUMBNAIL_FALLBACK}
                        fill
                        className="object-cover"
                        alt="thumbnail"
                      />

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            size="icon"
                            className="bg-black/50 hover:bg-black/50 absolute top-1 right-1 rounded-full opacity-100 md:opacity-0 group-hover:opacity-100 duration-300 size-7"
                          >
                            <MoreVertical className="text-white" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent
                          align="start"
                          side="right"
                        >
                          <DropdownMenuItem onClick={() => setThumbnailModalopen(true)}>
                            <ImagePlus className="size-4 mr-1" />
                            <span>Change</span>
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => generateThumbnail.mutate({ id: videoId })}
                          >
                            <Sparkles className="size-4 mr-1" />
                            <span>AI Generated</span>
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => restoreThumbnail.mutate({ id: videoId })}
                          >
                            <RotateCcw className="size-4 mr-1" />
                            <span>Restore</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    {/* Add Ai Generated Title */}
                    <FormLabel>Description</FormLabel>

                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value ?? ""}
                        className="resize-none pr-10"
                        placeholder="Add description for video"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    {/* Add Ai Generated Title */}
                    <FormLabel>Category</FormLabel>

                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value ?? undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent
                        position="item-aligned"
                        sideOffset={4}
                        align="start"
                      >
                        {categories.map((category) => (
                          <SelectItem
                            key={category.id}
                            value={category.id}
                          >
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-col gap-y-8 lg:col-span-2">
              <div className="flex flex-col gap-4 bg-[#F9F9F9] rounded-xl overflow-hidden h-fit">
                <div className="aspect-video overflow-hidden relative">
                  <VideoPlayer
                    playbackId={video.muxPlaybackId}
                    thumbnailUrl={video.thumbnailUrl}
                  />
                </div>

                <div className="p-4 flex flex-col gap-y-6">
                  <div className="flex justify-between items-center gap-x-2">
                    <div className="flex flex-col gap-y-1">
                      <p className="text-muted-foreground text-xs">Video Link</p>

                      <div className="flex items-center gap-x-2">
                        <Link href={`/videos/${video.id}`}>
                          <p className="line-clamp-1 text-sm text-blue-500">{fullUrl}</p>
                        </Link>

                        <Button
                          variant="ghost"
                          type="button"
                          size="icon"
                          className="shrink-0"
                          onClick={onCopy}
                          disabled={isCopied}
                        >
                          {isCopied ? (
                            <CheckCircle2 className="size-5 text-emerald-600 font-bold" />
                          ) : (
                            <Copy />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex flex-col gap-y-1">
                      <p className="text-muted-foreground text-xs">Video status</p>

                      <p className="text-sm">
                        {snakeCaseToTitle(video.muxStatus || "Preparing")}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex flex-col gap-y-1">
                      <p className="text-muted-foreground text-xs">Subtitles status</p>

                      <p className="text-sm">
                        {snakeCaseToTitle(video.muxTrackStatus || "no_subtitles")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <FormField
                control={form.control}
                name="visibility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visibility</FormLabel>

                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value ?? undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent>
                        <SelectItem value="public">
                          <div className="flex items-center">
                            <Globe2 className="size-4 mr-2" />
                            Public
                          </div>
                        </SelectItem>

                        <SelectItem value="private">
                          <div className="flex items-center">
                            <Lock className="size-4 mr-2" />
                            Private
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>
          </div>
        </form>
      </Form>
    </>
  )
}
