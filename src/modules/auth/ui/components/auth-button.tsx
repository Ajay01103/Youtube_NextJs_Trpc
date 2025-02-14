"use client"

import { Button, buttonVariants } from "@/components/ui/button"
import { Clapperboard, UserCircle } from "lucide-react"

import { UserButton, SignInButton, SignIn, SignedOut, SignedIn } from "@clerk/nextjs"
import Link from "next/link"
import { usePathname } from "next/navigation"

export const AuthButton = () => {
  const pathname = usePathname()
  return (
    <>
      <SignedIn>
        {pathname !== "/studio" && (
          <Link
            href="/studio"
            className={buttonVariants({
              variant: "secondary",
              className: "md:flex hidden",
            })}
          >
            <Clapperboard className="size-4" />
            <span className="ml-2">Studio</span>
          </Link>
        )}

        {/* can do the studio menu icon inside clerks menu list by this way  */}
        <UserButton>
          <UserButton.MenuItems>
            <UserButton.Link
              label="Studio"
              href="/studio"
              labelIcon={<Clapperboard className="size-4" />}
            />
          </UserButton.MenuItems>
        </UserButton>
        {/* Menu items for studio and User related actions */}
      </SignedIn>
      <SignedOut>
        <SignInButton mode="modal">
          <Button variant="ytsecondary">
            <UserCircle />
            Sign in
          </Button>
        </SignInButton>
      </SignedOut>
    </>
  )
}
