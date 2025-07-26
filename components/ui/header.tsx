"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X, ChevronDown } from "lucide-react"
import { LoginModal } from "@/components/login-modal"
import { SubscribeModal } from "@/components/subscribe-modal"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  return (
    <nav className="w-full py-2 px-4 sm:px-6 bg-black">
      <div className="mx-auto max-w-6xl w-full">
        <div className="flex items-center justify-between mx-auto">
          <div className="flex items-center">
            <Link href="/" className="px-2 py-1 hover:bg-black/5 rounded-none transition:all">
              <div className="flex items-center space-x-2">
                <div className="h-10 w-20 overflow-hidden">
                  <figure className="relative h-full overflow-hidden w-full">
                    <img
                      className="absolute inset-0 h-full w-full object-contain"
                      width="200"
                      height="100"
                      src="/images/white-logo.svg"
                      alt="Infinite Runway logo"
                    />
                  </figure>
                </div>
              </div>
            </Link>
            
            {/* Navigation Links - Desktop */}
            <div className="hidden md:flex items-center space-x-6 ml-6">
              <DropdownMenu>
                <DropdownMenuTrigger className="text-white hover:text-gray-300 text-sm font-medium flex items-center focus:outline-none">
                  Resources <ChevronDown className="ml-1 h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="bg-black border-gray-800 text-white min-w-[180px]">
                  <DropdownMenuItem className="hover:bg-gray-800 focus:bg-gray-800 focus:text-white cursor-pointer">
                    <Link href="/resources/yc-playbook" className="w-full text-white hover:text-gray-300">
                      YC Playbook
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-gray-800 focus:bg-gray-800 focus:text-white cursor-pointer">
                    <Link href="/resources/ebook" className="w-full text-white hover:text-gray-300">
                      E book
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-gray-800 focus:bg-gray-800 focus:text-white cursor-pointer">
                    <Link href="/resources/newsletter-monetization" className="w-full text-white hover:text-gray-300">
                      Newsletter Monetization
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Link href="/essays" className="text-white hover:text-gray-300 text-sm font-medium">
                Essays
              </Link>
              <Link href="/about" className="text-white hover:text-gray-300 text-sm font-medium">
                About
              </Link>
              <Link href="/advertise" className="text-white hover:text-gray-300 text-sm font-medium">
                Advertise
              </Link>
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white focus:outline-none"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <LoginModal className="rounded-none text-sm font-medium" />
              <SubscribeModal className="rounded-none text-sm font-medium" />
            </div>
          </div>
        </div>
        
        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-2 py-3 border-t border-gray-700">
            <div className="flex flex-col space-y-3">
              <div className="flex flex-col space-y-2">
                <div className="text-white text-sm font-medium px-2">Resources</div>
                <Link 
                  href="/resources/yc-playbook" 
                  className="text-white hover:text-gray-300 text-sm font-medium px-6"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  YC Playbook
                </Link>
                <Link 
                  href="/resources/ebook" 
                  className="text-white hover:text-gray-300 text-sm font-medium px-6"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  E book
                </Link>
                <Link 
                  href="/resources/newsletter-monetization" 
                  className="text-white hover:text-gray-300 text-sm font-medium px-6"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Newsletter Monetization
                </Link>
              </div>
              <Link 
                href="/essays" 
                className="text-white hover:text-gray-300 text-sm font-medium px-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Essays
              </Link>
              <Link 
                href="/about" 
                className="text-white hover:text-gray-300 text-sm font-medium px-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                href="/advertise" 
                className="text-white hover:text-gray-300 text-sm font-medium px-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Advertise
              </Link>
              <div className="flex flex-col space-y-2 pt-2">
                <LoginModal className="w-full rounded-none text-sm font-medium" />
                <SubscribeModal className="w-full rounded-none text-sm font-medium" />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
} 