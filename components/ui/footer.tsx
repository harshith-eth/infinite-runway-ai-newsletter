"use client"

import Link from "next/link"
import { Twitter, Linkedin, Instagram, Rss } from "lucide-react"

export function Footer() {
  return (
    <footer className="py-12 px-4 sm:px-6 bg-black text-white">
      <div className="mx-auto w-full max-w-6xl">
        <div className="flex flex-col gap-y-8">
          {/* Top section with logo, tagline, navigation and subscription */}
          <div className="grid grid-cols-1 gap-y-8 sm:grid-cols-12 sm:gap-x-8">
            {/* Logo and tagline */}
            <div className="sm:col-span-3">
              <div className="flex w-full flex-col items-center sm:items-start">
                <Link href="/" className="flex items-center gap-x-2 py-4 hover:opacity-90 transition-opacity">
                  <img
                    src="/images/logo.svg"
                    alt="Infinite Runway"
                    width="40"
                    height="40"
                    className="overflow-hidden"
                  />
                  <p className="text-md font-semibold font-ariel font-button text-white">Infinite Runway</p>
                </Link>
                <div className="text-center sm:text-left">
                  <p className="text-sm font-regular font-ariel font-body text-white/90">
                    Practical wisdom, insights, and stories in motion.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Navigation links */}
            <div className="sm:col-span-5 grid grid-cols-2 gap-8">
              <div className="flex flex-col gap-y-3">
                <p className="text-sm font-semibold font-ariel font-body text-white">Quick Links</p>
                <div className="flex flex-col gap-y-2">
                  <Link href="/posts" className="text-sm font-regular font-ariel font-body text-white/90 hover:text-white transition-colors">
                    Essays
                  </Link>
                  <Link href="/advertise" className="text-sm font-regular font-ariel font-body text-white/90 hover:text-white transition-colors">
                    Advertise
                  </Link>
                  <Link href="/about" className="text-sm font-regular font-ariel font-body text-white/90 hover:text-white transition-colors">
                    About
                  </Link>
                </div>
              </div>
              
              <div className="flex flex-col gap-y-3">
                <p className="text-sm font-semibold font-ariel font-body text-white">Company</p>
                <div className="flex flex-col gap-y-2">
                  <Link href="/about" className="text-sm font-regular font-ariel font-body text-white/90 hover:text-white transition-colors">
                    About Us
                  </Link>
                  <Link href="/contact" className="text-sm font-regular font-ariel font-body text-white/90 hover:text-white transition-colors">
                    Contact
                  </Link>
                  <Link href="/careers" className="text-sm font-regular font-ariel font-body text-white/90 hover:text-white transition-colors">
                    Careers
                  </Link>
                  <Link href="/partners" className="text-sm font-regular font-ariel font-body text-white/90 hover:text-white transition-colors">
                    Partners
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Subscribe section */}
            <div className="sm:col-span-4">
              <div className="flex flex-col items-center gap-y-4 sm:items-start">
                <p className="text-sm font-semibold font-ariel font-body text-white">Subscribe to our newsletter</p>
                <div className="flex w-full flex-col items-center sm:items-start">
                  <form className="group w-full max-w-md rounded-none bg-transparent" aria-label="Newsletter subscription form">
                    <div className="flex flex-col w-full">
                      <label htmlFor="footer-email" className="sr-only">Email address</label>
                      <div className="flex flex-row items-center w-full overflow-hidden rounded-none">
                        <input
                          type="email"
                          id="footer-email"
                          name="email"
                          autoComplete="email"
                          required
                          className="w-full flex-1 border-2 border-white bg-white px-4 py-3 text-base sm:text-lg text-gray-900 placeholder-gray-500 focus:outline-none"
                          placeholder="Enter Your Email"
                        />
                        <button
                          type="submit"
                          className="min-w-[100px] whitespace-nowrap px-3 sm:px-5 py-3 font-semibold text-base sm:text-lg rounded-none font-button bg-primary text-white border-2 border-white border-l-0 hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
                          aria-label="Subscribe to newsletter"
                        >
                          Subscribe
                        </button>
                      </div>
                    </div>
                  </form>
                  <p className="mt-2 text-xs text-white/70">
                    By subscribing, you agree to our Privacy Policy and Terms of Service.
                  </p>
                </div>
                
                {/* Social links */}
                <div className="mt-4">
                  <p className="text-sm font-semibold font-ariel font-body text-white mb-3">Connect with us</p>
                  <div className="flex flex-wrap items-center gap-3">
                    <a 
                      href="https://twitter.com/rickyshq" 
                      target="_blank" 
                      rel="noreferrer" 
                      aria-label="Follow us on Twitter"
                      className="relative p-2 hover:opacity-90 transition-opacity"
                    >
                      <div className="absolute left-0 top-0 h-full w-full bg-black opacity-10"></div>
                      <div className="bg-white p-2 text-primary">
                        <Twitter className="h-4 w-4" />
                      </div>
                    </a>
                    <a 
                      href="https://www.linkedin.com/in/rickyfigueroa/" 
                      target="_blank" 
                      rel="noreferrer" 
                      aria-label="Connect on LinkedIn"
                      className="relative p-2 hover:opacity-90 transition-opacity"
                    >
                      <div className="absolute left-0 top-0 h-full w-full bg-black opacity-10"></div>
                      <div className="bg-white p-2 text-primary">
                        <Linkedin className="h-4 w-4" />
                      </div>
                    </a>
                    <a 
                      href="https://youtube.com/" 
                      target="_blank" 
                      rel="noreferrer" 
                      aria-label="Watch our YouTube channel"
                      className="relative p-2 hover:opacity-90 transition-opacity"
                    >
                      <div className="absolute left-0 top-0 h-full w-full bg-black opacity-10"></div>
                      <div className="bg-white p-2 text-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                          <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"></path>
                        </svg>
                      </div>
                    </a>
                    <a 
                      href="/rss.xml" 
                      target="_blank"
                      rel="alternate"
                      type="application/rss+xml"
                      title="Subscribe to RSS feed - Get all our content updates"
                      aria-label="Subscribe to our RSS feed for regular content updates"
                      className="relative p-2 hover:opacity-90 transition-opacity"
                      data-geo="global"
                      data-content-type="blog"
                    >
                      <div className="absolute left-0 top-0 h-full w-full bg-black opacity-10"></div>
                      <div className="bg-white p-2 text-primary">
                        <Rss className="h-4 w-4" />
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Divider */}
          <div className="w-full border-t border-white/20 my-2"></div>
          
          {/* Bottom section with copyright and legal links */}
          <div className="flex w-full flex-col items-center gap-y-4 sm:flex-row sm:justify-between">
            <div className="w-full text-center sm:w-1/2 sm:text-left">
              <p className="text-xs font-light font-ariel text-white/80">© {new Date().getFullYear()} Infinite Runway. All rights reserved.</p>
            </div>
            <div className="flex w-full flex-col items-center gap-y-4 sm:w-1/2 sm:flex-row sm:justify-end sm:gap-x-6">
              <div className="flex gap-x-4 sm:gap-x-6">
                <Link 
                  href="/privacy" 
                  className="whitespace-nowrap hover:opacity-80 text-white/80 hover:text-white transition-colors text-xs font-light"
                >
                  Privacy Policy
                </Link>
                <Link 
                  href="/terms" 
                  className="whitespace-nowrap hover:opacity-80 text-white/80 hover:text-white transition-colors text-xs font-light"
                >
                  Terms of Use
                </Link>
                <Link 
                  href="/cookies" 
                  className="whitespace-nowrap hover:opacity-80 text-white/80 hover:text-white transition-colors text-xs font-light"
                >
                  Cookie Policy
                </Link>
                <Link 
                  href="/sitemap" 
                  aria-label="Comprehensive site index for humans and AI assistants"
                  className="whitespace-nowrap hover:opacity-80 text-white/80 hover:text-white transition-colors text-xs font-light"
                >
                  Sitemap
                </Link>
                <Link 
                  href="/rss.xml"
                  rel="alternate"
                  type="application/rss+xml" 
                  className="whitespace-nowrap hover:opacity-80 text-white/80 hover:text-white transition-colors text-xs font-light flex items-center gap-1"
                  title="Subscribe to RSS feed"
                  aria-label="Subscribe to our content via RSS"
                >
                  <Rss size={12} className="inline-block" /> RSS Feed
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
} 