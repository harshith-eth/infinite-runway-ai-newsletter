"use client"

import { LoginModal } from "@/components/login-modal"
import { Button } from "@/components/ui/button"

export default function LoginExample() {
  return (
    <div className="container mx-auto py-20 flex flex-col items-center justify-center gap-8">
      <h1 className="text-3xl font-bold font-header">Login Modal Example</h1>
      <div className="space-y-4 w-full max-w-md">
        <p className="text-center text-muted-foreground font-body">
          Click the button below to open the login modal
        </p>
        <div className="flex justify-center">
          <LoginModal 
            trigger={
              <Button size="lg" className="font-button">
                Open Login Modal
              </Button>
            } 
          />
        </div>
      </div>
    </div>
  )
} 