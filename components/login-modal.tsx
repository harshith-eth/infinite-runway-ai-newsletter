"use client"

import * as React from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogTrigger,
  DialogTitle
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface LoginModalProps {
  className?: string
}

export function LoginModal({ className }: LoginModalProps) {
  const [email, setEmail] = React.useState("")

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle login logic here
    console.log("Logging in with:", email)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className={`px-4 py-2 bg-white text-[#0618F3] hover:bg-gray-100 ${className}`}>
          Login
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md border-0 bg-[#0618F3] p-0 text-white">
        <DialogTitle className="sr-only">Login to Infinite Runway</DialogTitle>
        <div className="flex items-center justify-center pt-6 pb-2">
          <div className="text-[#0618F3] h-14 w-14 flex items-center justify-center bg-white">
            <Image 
              src="/images/logo.png" 
              alt="Infinite Runway" 
              width={50} 
              height={50} 
              className="object-contain w-full h-full"
            />
          </div>
        </div>
        <h2 className="text-xl font-medium text-center pb-4 text-white">
          Login to Infinite Runway
        </h2>
        <form onSubmit={handleLogin} className="p-6 pt-0 space-y-4">
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border-0 h-12 rounded-none text-black"
          />
          <Button 
            type="submit" 
            className="w-full bg-white text-[#0618F3] h-12 rounded-none hover:bg-gray-100"
          >
            Login
          </Button>
          <div className="text-center text-sm text-white mt-4">
            Don't have an account?{" "}
            <a href="#" className="text-white font-medium hover:underline">
              Join Free →
            </a>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 