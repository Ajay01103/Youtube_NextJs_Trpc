import { UserView } from "@/modules/users/views/user-view"
import { HydrateClient, trpc } from "@/trpc/server"

interface Props {
  params: Promise<{
    userId: string
  }>
}

const UsersIdPage = async ({ params }: Props) => {
  const { userId } = await params

  // trpc prefetching
  void trpc.users.getOne.prefetch({ id: userId })

  return (
    <HydrateClient>
      <UserView userId={userId} />
    </HydrateClient>
  )
}

export default UsersIdPage
