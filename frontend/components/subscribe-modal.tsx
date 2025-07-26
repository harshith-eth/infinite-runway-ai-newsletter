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

interface SubscribeModalProps {
  className?: string
}

export function SubscribeModal({ className }: SubscribeModalProps) {
  const [email, setEmail] = React.useState("")

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle subscription logic here
    console.log("Subscribing with:", email)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className={`px-4 py-2 bg-[#0618F3] text-white hover:bg-[#0513d0] ${className}`}>
          Join Free
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md border-0 bg-white p-0 text-[#0618F3]">
        <DialogTitle className="sr-only">Join Infinite Runway</DialogTitle>
        <div className="flex items-center justify-center pt-6 pb-2">
          <div className="h-14 w-14 flex items-center justify-center">
            <Image 
              src="/images/logo-blue.png" 
              alt="Infinite Runway" 
              width={50} 
              height={50} 
              className="object-contain w-full h-full"
            />
          </div>
        </div>
        <h2 className="text-xl font-medium text-center pb-4 text-[#0618F3]">
          Join Infinite Runway
        </h2>
        <form onSubmit={handleSubscribe} className="p-6 pt-0 space-y-4">
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border border-[#0618F3] h-12 rounded-none text-black"
          />
          <Button 
            type="submit" 
            className="w-full bg-[#0618F3] text-white h-12 rounded-none hover:bg-[#0513d0]"
          >
            Subscribe
          </Button>
          <div className="text-center text-sm text-[#0618F3] mt-4">
            Already have an account?{" "}
            <a href="#" className="text-[#0618F3] font-medium hover:underline">
              Login →
            </a>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 