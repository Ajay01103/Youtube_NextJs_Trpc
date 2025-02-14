import { StudioLayout } from "@/modules/studio/ui/layouts/studio-layout"

interface Props {
  children: React.ReactNode
}

const Layout = ({ children }: Props) => {
  return (
    <div>
      <StudioLayout>{children}</StudioLayout>
    </div>
  )
}

export default Layout
