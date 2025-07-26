import React from 'react';
import Link from 'next/link';
import { BlogCard } from '@/components/blog-card';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import { getPaginatedBlogPosts } from '@/lib/blog-data';

// Configure pagination
const BLOGS_PER_PAGE = 9;

export default async function EssaysPage({ searchParams }: { searchParams: { page?: string } }) {
  // Get page from URL params, default to 1
  const currentPage = Number(searchParams.page) || 1;
  
  // Get paginated blog posts
  const { posts: currentBlogs, totalPages } = await getPaginatedBlogPosts(currentPage, BLOGS_PER_PAGE);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0019fd] text-white">
      <Header />
      
      <main className="flex-grow">
        <div className="min-h-screen overflow-x-hidden bg-[#0019fd] text-white">
          <div className="px-4 sm:px-6 pt-8">
            <div className="mx-auto w-full max-w-6xl">
              <div className="pb-8">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-y-6">
                  <div>
                    <ul className="flex flex-wrap items-center gap-2 text-xs font-semibold pb-2">
                      <li className="flex items-center gap-2">
                        <Link href="/" className="opacity-70 hover:opacity-100">Home</Link>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon" height="14px">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5"></path>
                        </svg>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="!opacity-100">Essays</span>
                      </li>
                    </ul>
                    <h1 className="text-3xl font-bold mt-4">Essays</h1>
                    <p className="mt-1 text-lg opacity-80">
                      Explore our thoughts on AI, technology, and more
                    </p>
                  </div>
                </div>
                
                {/* Search bar */}
                <div className="mt-8 w-full max-w-2xl">
                  <form action="/essays/search" method="get">
                    <div className="relative">
                      <div className="relative">
                        <input
                          type="text"
                          name="q"
                          placeholder="Search essays..."
                          className="w-full bg-white text-black px-4 py-2 pl-10 rounded-none"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                          </svg>
                        </div>
                        <button
                          type="submit"
                          className="absolute right-0 top-0 h-full px-4 text-white bg-primary hover:bg-primary/90 transition-colors rounded-none"
                          aria-label="Search"
                          style={{ backgroundColor: "#0019fd" }}
                        >
                          Search
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
                
                {/* Essay Grid */}
                <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {currentBlogs.map((blog, index) => (
                    <BlogCard
                      key={index}
                      title={blog.title}
                      description={blog.description}
                      imageUrl={blog.imageUrl}
                      slug={blog.slug}
                      authorName={blog.authorName}
                      authorImageUrl={blog.authorImageUrl}
                    />
                  ))}
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="col-span-12 mx-auto mt-12 grid grid-cols-4 grid-rows-2 items-center gap-3 px-4 py-4 pb-8 sm:flex sm:justify-center">
                    <div className="wt-button-font order-2 col-span-2 flex justify-end gap-2">
                      <Link 
                        className={`flex items-center gap-2 px-3 py-1 rounded-none border border-white bg-primary text-primary-foreground transition duration-150 ease-in-out hover:border-wt-primary ${currentPage <= 1 ? 'pointer-events-none cursor-not-allowed opacity-40' : ''}`}
                        href="/essays?page=1"
                      >
                        First
                      </Link>
                      <Link 
                        className={`flex items-center gap-2 px-3 py-1 rounded-none border border-white bg-primary text-primary-foreground transition duration-150 ease-in-out hover:border-wt-primary ${currentPage <= 1 ? 'pointer-events-none cursor-not-allowed opacity-40' : ''}`}
                        href={`/essays?page=${Math.max(1, currentPage - 1)}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-4 w-4 rotate-180 transform">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5"></path>
                        </svg>
                        Back
                      </Link>
                    </div>
                    
                    <div className="order-1 col-span-4 flex justify-center gap-3 sm:order-2">
                      {Array.from({ length: Math.min(3, totalPages) }).map((_, i) => {
                        const pageNum = currentPage <= 2 ? i + 1 : currentPage - 1 + i;
                        if (pageNum <= totalPages) {
                          return (
                            <Link
                              key={i}
                              href={`/essays?page=${pageNum}`}
                              className={`flex items-center gap-2 px-3 py-1 rounded-none border border-white ${
                                currentPage === pageNum
                                  ? 'bg-white text-primary'
                                  : 'bg-primary text-primary-foreground'
                              } transition duration-150 ease-in-out hover:border-wt-primary`}
                            >
                              {pageNum}
                            </Link>
                          );
                        }
                        return null;
                      })}
                    </div>
                    
                    <div className="wt-button-font order-2 col-span-2 flex items-center gap-2">
                      <Link
                        className={`flex items-center gap-2 px-3 py-1 rounded-none border border-white bg-primary text-primary-foreground transition duration-150 ease-in-out hover:border-wt-primary ${currentPage >= totalPages ? 'pointer-events-none cursor-not-allowed opacity-40' : ''}`}
                        href={`/essays?page=${Math.min(totalPages, currentPage + 1)}`}
                      >
                        Next 
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" height="16px">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5"></path>
                        </svg>
                      </Link>
                      <Link
                        className={`flex items-center gap-2 px-3 py-1 rounded-none border border-white bg-primary text-primary-foreground transition duration-150 ease-in-out hover:border-wt-primary ${currentPage >= totalPages ? 'pointer-events-none cursor-not-allowed opacity-40' : ''}`}
                        href={`/essays?page=${totalPages}`}
                      >
                        Last
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 