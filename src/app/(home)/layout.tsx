import { HomeLayout } from "@/modules/home/ui/layouts/home-layout"

export const dynamic = "force-dynamic"

interface Props {
  children: React.ReactNode
}

const Layout = ({ children }: Props) => {
  return (
    <div>
      <HomeLayout>{children}</HomeLayout>
    </div>
  )
}

export default Layout
