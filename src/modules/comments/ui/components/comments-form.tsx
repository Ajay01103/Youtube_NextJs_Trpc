import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { UserAvatar } from "@/components/user-avatar"
import { useUser, useClerk } from "@clerk/nextjs"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { trpc } from "@/trpc/client"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { z } from "zod"
import { toast } from "sonner"

interface CommentsFormProps {
  videoId: string
  parentId?: string
  onSuccess?: () => void
  onCancel?: () => void
  variant?: "comment" | "reply"
}

const formSchema = z.object({
  videoId: z.string().nonempty(),
  parentId: z.string().nullish(),
  value: z.string().nonempty(),
})

export const CommentsForm = ({
  videoId,
  onSuccess,
  parentId,
  onCancel,
  variant = "comment",
}: CommentsFormProps) => {
  const { user } = useUser()
  const utils = trpc.useUtils()
  const clerk = useClerk()

  const createComment = trpc.comments.create.useMutation({
    onSuccess: () => {
      utils.comments.getMany.invalidate({ videoId })
      utils.comments.getMany.invalidate({ videoId, parentId })
      form.reset()
      toast.success("Comment created")
      onSuccess?.()
    },
    onError: (error) => {
      toast.error("Something went wrong", {
        description: error.message,
      })

      if (error.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn()
      }
    },
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      videoId,
      parentId,
      value: "",
    },
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // console.log(values)
    createComment.mutate(values)
  }

  const handleCancel = () => {
    form.reset()
    onCancel?.()
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex gap-4 group"
      >
        <UserAvatar
          size="lg"
          avatarUrl={user?.imageUrl ?? "/user-placeholder.svg"}
          name={user?.username || "user"}
        />

        <div className="flex-1">
          <FormField
            name="value"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder={
                      variant === "reply" ? "Reply to this comment" : "Add a comment"
                    }
                    className="resize-none bg-transparent overflow-hidden min-h-0"
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <div className="justify-end gap-2 mt-2 flex">
            {onCancel && (
              <Button
                variant="ghost"
                type="button"
                onClick={handleCancel}
              >
                Cancel
              </Button>
            )}
            <Button
              disabled={createComment.isPending}
              type="submit"
              size="sm"
            >
              {variant === "reply" ? "Reply" : "Comment"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}
