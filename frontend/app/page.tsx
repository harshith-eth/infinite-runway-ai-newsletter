import Image from "next/image"
import { Search, Twitter, Linkedin, Instagram, Rss } from "lucide-react"
import Link from "next/link"
import { NewsletterForm } from "@/components/newsletter-form"
import { Header } from "@/components/ui/header"
import { LogoCarousel } from "@/components/LogoCarousel"
import React from "react"
import { Footer } from "@/components/ui/footer"
import { ImageWithFallback } from "@/components/ui/image-with-fallback"
import { getAllBlogPosts } from "@/lib/blog-data"
import { BlogCard } from "@/components/blog-card"

// Remove the ImageWithFallback component as we've created a proper one
export default async function Home() {
  // Get blog posts for the home page
  const blogPosts = await getAllBlogPosts();
  
  return (
    <div className="min-h-screen overflow-x-hidden bg-wt-background">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <main className="flex-grow">
        <div className="min-h-screen overflow-x-hidden bg-wt-background">
          <div className="relative py-8 sm:py-12 bg-wt-background">
            <div className="relative h-full w-full left-0 top-0">
              <div className="px-4 sm:px-6">
                <div className="mx-auto w-full max-w-6xl">
                  <div className="mx-auto mb-6 sm:mb-10 w-full max-w-2xl p-0 rounded-none border" style={{ borderColor: "transparent", backgroundColor: "#0019fd" }}>
                    <div className="flex flex-col items-center py-4 sm:py-5 flex-start">
                      <div className="mb-4 sm:mb-5 overflow-hidden h-20 w-20 sm:h-24 sm:w-24">
                        <figure className="aspect-square relative h-full overflow-hidden w-full">
                          <img 
                            width="128" 
                            height="128" 
                            src="/images/logo.svg" 
                            alt="Infinite Runway" 
                            className="absolute inset-0 h-full w-full object-cover"
                          />
                        </figure>
                      </div>
                      <div className="space-y-3 sm:space-y-5">
                        <div className="mx-auto w-full max-w-xl">
                          <h1 className="w-full text-center text-3xl sm:text-4xl md:text-5xl font-bold font-spaceGrotesk text-white">
                            {/* Removed Infinite Runway text */}
                          </h1>
                        </div>
                        <div className="w-full text-center text-sm sm:text-md md:text-lg font-regular font-helvetica text-white">
                          <p>Practical wisdom, insights, and stories in motion.</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mx-auto mt-4 sm:mt-6 max-w-[90%] sm:max-w-sm md:max-w-lg pb-4 sm:pb-6">
                      <div className="flex w-full flex-col items-center">
                        <NewsletterForm />
                      </div>
                    </div>
                  </div>

                  {/* Author and Social - This section will be moved */}
                  {/* <div className="flex flex-wrap items-end justify-between gap-4"> ... content ... </div> */}
                </div>
              </div>
            </div>
            
            {/* Logo Carousel Section - Now using the LogoCarousel component */}
            <LogoCarousel />

            {/* New location for Author and Social */}
            <div className="px-4 sm:px-6">
              <div className="mx-auto w-full max-w-6xl">
                {/* Author and Social */}
                <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-end justify-between gap-4 py-4 sm:py-2">
                  <div className="space-y-2">
                    <span className="whitespace-nowrap text-xs font-semibold text-md font-regular wt-body-font text-primary-foreground">
                      Written by
                    </span>
                    <Link href="/authors" className="group flex flex-col items-start space-x-0 space-y-1 sm:flex-row sm:items-center sm:space-x-2 sm:space-y-0">
                      <div className="flex items-center">
                        <span className="group-hover:underline text-xs sm:text-sm font-semibold wt-body-font text-primary-foreground">
                          Ricky Figueroa
                        </span>
                      </div>
                    </Link>
                  </div>
                  <div className="space-y-2 mt-4 sm:mt-0">
                    <p className="whitespace-nowrap text-xs font-semibold text-md font-regular wt-body-font text-primary-foreground">
                      Connect
                    </p>
                    <div className="flex flex-wrap items-start justify-start gap-2">
                      <a href="https://twitter.com/rickyshq" target="_blank" rel="noreferrer" aria-label="Twitter" className="relative p-2">
                        <div className="absolute left-0 top-0 h-full w-full bg-black opacity-10"></div>
                        <div className="bg-primary p-2 text-primary-foreground">
                          <Twitter className="h-3 w-3 sm:h-4 sm:w-4" />
                        </div>
                      </a>
                      <a href="https://www.linkedin.com/in/rickyfigueroa/" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="relative p-2">
                        <div className="absolute left-0 top-0 h-full w-full bg-black opacity-10"></div>
                        <div className="bg-primary p-2 text-primary-foreground">
                          <Linkedin className="h-3 w-3 sm:h-4 sm:w-4" />
                        </div>
                      </a>
                      <a href="https://www.instagram.com/rickyshq/" target="_blank" rel="noreferrer" aria-label="Instagram" className="relative p-2">
                        <div className="absolute left-0 top-0 h-full w-full bg-black opacity-10"></div>
                        <div className="bg-primary p-2 text-primary-foreground">
                          <Instagram className="h-3 w-3 sm:h-4 sm:w-4" />
                        </div>
                      </a>
                      <a href="https://rss.beehiiv.com/feeds/SpRYMnCoGX.xml" target="_blank" rel="noreferrer" aria-label="RSS" className="relative p-2">
                        <div className="absolute left-0 top-0 h-full w-full bg-black opacity-10"></div>
                        <div className="bg-primary p-2 text-primary-foreground">
                          <Rss className="h-3 w-3 sm:h-4 sm:w-4" />
                        </div>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Latest Posts */}
          <div className="px-4 sm:px-6 pt-0">
            <div className="mx-auto w-full max-w-6xl">
              <div className="grid w-full grid-cols-12">
                <div className="order-last col-span-12 pb-4 pt-2 lg:order-first mb-8">
                  <div>
                    <div className="mb-4">
                      <div className="flex flex-col space-y-0">
                        <h4 className="text-3xl sm:text-4xl font-bold wt-header-font text-primary-foreground">
                          Latest
                        </h4>
                      </div>
                    </div>
                    
                    <div className="mb-8">
                      <div className="relative w-full pb-4">
                        <div className="group relative w-full max-w-md transition-all">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 transform">
                            <Search className="h-4 w-4 text-primary" />
                          </div>
                          <form action="/essays/search" method="get">
                            <input
                              type="text"
                              name="q"
                              id="q"
                              className="w-full py-2 px-10 wt-body-font text-sm max-w-none rounded-none transition-all duration-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                              placeholder="Search posts..."
                              defaultValue=""
                              style={{ 
                                color: "#111827", 
                                border: "2px solid #0019fd", 
                                backgroundColor: "white",
                              }}
                            />
                            <button
                              type="submit"
                              className="absolute right-0 top-0 h-full px-4 text-white bg-primary hover:bg-primary/90 transition-colors rounded-none wt-button-font"
                              aria-label="Search"
                              style={{ backgroundColor: "#0019fd" }}
                            >
                              Search
                            </button>
                          </form>
                        </div>
                      </div>
                      <div className="mb-2 flex flex-wrap gap-2"></div>
                    </div>
                    
                    {/* Latest Posts Grid */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {blogPosts.slice(0, 9).map((post, index) => (
                        <BlogCard
                          key={index}
                          title={post.title}
                          description={post.description}
                          imageUrl={post.imageUrl}
                          slug={post.slug}
                          authorName={post.authorName}
                          authorImageUrl={post.authorImageUrl}
                        />
                      ))}
                    </div>
                    
                    {/* Pagination */}
                    <div className="col-span-12 mx-auto mt-12 grid grid-cols-4 grid-rows-2 items-center gap-3 px-4 py-4 pb-8 sm:flex sm:justify-center">
                      <div className="wt-button-font order-2 col-span-2 flex justify-end gap-2">
                        <Link
                          href="/essays?page=1"
                          className="flex items-center gap-2 px-3 py-1 rounded-none border border-white bg-primary text-primary-foreground transition duration-150 ease-in-out hover:border-wt-primary pointer-events-none cursor-not-allowed opacity-40"
                        >
                          First
                        </Link>
                        <Link
                          href="/essays?page=1"
                          className="flex items-center gap-2 px-3 py-1 rounded-none border border-white bg-primary text-primary-foreground transition duration-150 ease-in-out hover:border-wt-primary pointer-events-none cursor-not-allowed opacity-40"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="h-4 w-4 rotate-180 transform"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5"></path>
                          </svg>
                          Back
                        </Link>
                      </div>
                      <div className="order-1 col-span-4 flex justify-center gap-3 sm:order-2">
                        <Link
                          href="/essays"
                          className="flex items-center gap-2 px-3 py-1 rounded-none border border-white bg-white text-primary"
                        >
                          1
                        </Link>
                      </div>
                      <div className="wt-button-font order-2 col-span-2 flex items-center gap-2">
                        <Link
                          href="/essays?page=2"
                          className="flex items-center gap-2 px-3 py-1 rounded-none border border-white bg-primary text-primary-foreground transition duration-150 ease-in-out hover:border-wt-primary opacity-40"
                        >
                          Next 
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" height="16px">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5"></path>
                          </svg>
                        </Link>
                        <Link
                          href="/essays"
                          className="flex items-center gap-2 px-3 py-1 rounded-none border border-white bg-primary text-primary-foreground transition duration-150 ease-in-out hover:border-wt-primary opacity-40"
                        >
                          Last
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}
