"use client"

import { Button } from "@/components/ui/button"
import { trpc } from "@/trpc/client"
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"

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
  const [video] = trpc.studio.getOne.useSuspenseQuery({ id: videoId })

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold">Video Details</h1>
        <p className="text-sm text-muted-foreground">Manage your video Details</p>
      </div>

      <div className="flex items-center gap-x-2">
        <Button
          type="submit"
          disabled={false}
        >
          Save
        </Button>
      </div>
    </div>
  )
}
