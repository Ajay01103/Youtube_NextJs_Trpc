"use client"

import { Button } from "@/components/ui/button"
import { UserCircle } from "lucide-react"

import { UserButton, SignInButton, SignIn, SignedOut, SignedIn } from "@clerk/nextjs"

export const AuthButton = () => {
  return (
    <>
      <SignedIn>
        <UserButton />
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
