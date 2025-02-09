import { Button } from "@/components/ui/button"
import { UserCircle } from "lucide-react"

export const AuthButton = () => {
  return (
    <Button variant="ytsecondary">
      <UserCircle />
      Sign in
    </Button>
  )
}
