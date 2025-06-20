import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { ResponsiveModal } from "@/components/responsive-dialog"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"

const formSchema = z.object({
  prompt: z.string().min(10),
})

interface ThumbnailGenerateModalProps {
  videoId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const ThumbnailGenerateModal = ({
  open,
  videoId,
  onOpenChange,
}: ThumbnailGenerateModalProps) => {
  //   const generateThumbnail = trpc.videos.generateThumbnail.useMutation({
  //     onSuccess: () => {
  //       toast.success("Background job started", {
  //         description: "This may take a few minutes",
  //       })
  //     },
  //     onError: () => {
  //       toast.error("Something went wrong")
  //     },
  //   })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // generateThumbnail.mutate({ prompt: values.prompt, id: videoId })
    console.log(values)
  }

  return (
    <ResponsiveModal
      title="Upload a thumbnail"
      open={open}
      onOpenChange={onOpenChange}
    >
      <Form {...form}>
        <form
          className="flex flex-col gap-4"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormField
            control={form.control}
            name="prompt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prompt</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    cols={30}
                    rows={5}
                    className="resize-none"
                    placeholder="A description of the wanted thumbnail"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              //   disabled={generateThumbnail.isPending}
            >
              Generate
            </Button>
          </div>
        </form>
      </Form>
    </ResponsiveModal>
  )
}
