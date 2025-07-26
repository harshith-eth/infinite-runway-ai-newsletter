import React from 'react';
import Link from 'next/link';
import { BlogCard } from '@/components/blog-card';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import { searchBlogPosts, BlogPost } from '@/lib/blog-data';

export default async function SearchPage({ 
  searchParams 
}: { 
  searchParams: { q?: string } 
}) {
  // Get query from URL
  const query = searchParams.q || '';
  
  // Search for posts matching the query
  const searchResults = await searchBlogPosts(query);
  
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0019fd] text-white">
      <Header />
      
      <main className="flex-grow">
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
                      <Link href="/essays" className="opacity-70 hover:opacity-100">Essays</Link>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon" height="14px">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5"></path>
                      </svg>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="!opacity-100">Search</span>
                    </li>
                  </ul>
                  <h1 className="text-3xl font-bold mt-4">
                    {query 
                      ? `Search results for "${query}"`
                      : 'Search Essays'
                    }
                  </h1>
                  <p className="mt-1 text-lg opacity-80">
                    {searchResults.length === 0 
                      ? 'No essays found matching your search criteria' 
                      : `Found ${searchResults.length} essay${searchResults.length === 1 ? '' : 's'} matching your search`
                    }
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
                        defaultValue={query}
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
              
              {/* Search Results */}
              {searchResults.length > 0 ? (
                <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {searchResults.map((blog: BlogPost, index: number) => (
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
              ) : query ? (
                <div className="mt-12 text-center">
                  <p className="text-xl">No essays found matching "{query}"</p>
                  <Link href="/essays" className="inline-block mt-4 px-6 py-2 border border-white hover:bg-white hover:text-[#0019fd] transition-colors">
                    View all essays
                  </Link>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 