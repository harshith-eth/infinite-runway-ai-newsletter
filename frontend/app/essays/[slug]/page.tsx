import React from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import { getBlogPostBySlug, getAllBlogPosts } from '@/lib/blog-data';
import { getNewsletterBySlug, getAllNewsletters, newsletterToBlogPost } from '@/lib/newsletter-loader';

// Simple markdown to HTML converter
function convertMarkdownToHtml(markdown: string): string {
  let html = markdown
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^\> (.*$)/gm, '<blockquote>$1</blockquote>')
    .replace(/^\- (.*$)/gm, '<li>$1</li>')
    .replace(/\n\n/g, '</p><p>')
    .split('\n')
    .map(line => {
      if (line.match(/^<[h123ul]/)) return line;
      if (line.trim() === '') return '';
      return `<p>${line}</p>`;
    })
    .join('\n')
    .replace(/<p><\/p>/g, '');
  
  // Wrap consecutive <li> elements in <ul>
  html = html.replace(/(<li>.*?<\/li>\s*)+/g, (match) => `<ul>${match}</ul>`);
  
  return html;
}

// Import React95 Sans Serif font - using CSS imports
import '@react95/sans-serif';

// Windows 95 font styles
const win95FontStyles = {
  fontFamily: "'R95 Sans Serif 8pt', 'MS Sans Serif', 'Pixelated MS Sans Serif', Arial, sans-serif",
  letterSpacing: "0.5px"
};

// Generate static paths for all blog posts and newsletters
export async function generateStaticParams() {
  const posts = await getAllBlogPosts();
  const newsletters = await getAllNewsletters();
  
  const allSlugs = [
    ...posts.map((post) => ({ slug: post.slug })),
    ...newsletters.map((newsletter) => ({ slug: newsletter.metadata.slug }))
  ];
  
  return allSlugs;
}

// Single blog post page component
export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  // Await params first
  const resolvedParams = await params;
  
  // First try to find a newsletter by slug
  const newsletter = await getNewsletterBySlug(resolvedParams.slug);
  
  if (newsletter) {
    // Render newsletter with MDX
    return (
      <div className="min-h-screen overflow-x-hidden bg-[#0019fd] text-white">
        <Header />
        
        <main className="flex-grow">
          <div className="px-4 sm:px-6 pt-8">
            <div className="mx-auto w-full max-w-2xl">
              {/* Breadcrumb */}
              <ul className="flex flex-wrap items-center gap-2 text-xs font-semibold mb-8">
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
                  <span className="!opacity-100 truncate max-w-[200px]">{newsletter.metadata.title}</span>
                </li>
              </ul>
              
              {/* Newsletter header */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold" style={{ fontSize: "25px", lineHeight: "38px" }}>{newsletter.metadata.title}</h1>
                <div className="mt-4 flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {newsletter.metadata.author.imageUrl ? (
                      <div className="h-10 w-10 rounded-full overflow-hidden">
                        <ImageWithFallback
                          src={newsletter.metadata.author.imageUrl}
                          alt={newsletter.metadata.author.name}
                          width={40}
                          height={40}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-blue-900 flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {newsletter.metadata.author.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <span className="text-base">{newsletter.metadata.author.name}</span>
                  </div>
                  <div className="text-sm opacity-80">
                    <time dateTime={newsletter.metadata.publishDate}>{newsletter.metadata.publishDate}</time>
                  </div>
                </div>
              </div>
              
              {/* Feature image */}
              <div className="mb-8">
                <div className="aspect-video w-full overflow-hidden rounded-none border border-white/30 bg-[#0019fd]/50">
                  <ImageWithFallback
                    src={newsletter.metadata.imageUrl}
                    alt={newsletter.metadata.title}
                    width={1200}
                    height={675}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
              
              {/* Sponsor section */}
              {newsletter.metadata.sponsor && (
                <div className="mb-8">
                  <div className="w-full border border-white/30 rounded-none">
                    <div className="bg-[#0618F3] p-6 flex flex-col items-center justify-center border-b border-white/30">
                      <span className="text-sm font-bold wt-header-font mb-3">In Partnership with</span>
                      <a 
                        href={newsletter.metadata.sponsor.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-12 w-auto"
                      >
                        <Image
                          src={newsletter.metadata.sponsor.logo}
                          alt={newsletter.metadata.sponsor.name}
                          width={180}
                          height={54}
                          className="h-12 w-auto"
                        />
                      </a>
                    </div>
                    <div className="bg-[#0618F3] p-4 text-white">
                      <div className="text-base mb-8 whitespace-pre-line" style={{ fontSize: "16px", lineHeight: "24px" }}>
                        {newsletter.metadata.sponsor.description}
                      </div>
                      <div className="flex justify-center mb-4">
                        <a 
                          href={newsletter.metadata.sponsor.ctaLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="border font-medium focus:outline-none focus:border-transparent inline-flex items-center whitespace-nowrap transition-colors duration-200 focus:ring-1 bg-white text-[#0618F3] border-white shadow-sm hover:bg-white/90 focus:ring-white justify-center rounded-md py-2 px-4 text-sm"
                        >
                          {newsletter.metadata.sponsor.ctaText}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Newsletter content in Windows 95 style */}
              <div className="mb-8 border border-white/30">
                <div className="bg-[#0618F3] p-4 flex items-center border-b border-white/30">
                  <span className="text-lg font-bold" style={{ fontSize: "20px", lineHeight: "30px" }}>{newsletter.metadata.title}</span>
                </div>
                <div className="bg-[#0618F3] p-6 text-white">
                  <div className="prose prose-invert max-w-none prose-p:text-base prose-p:leading-7 prose-p:my-3 prose-h1:text-2xl prose-h1:leading-9 prose-h2:text-xl prose-h2:leading-8 prose-h3:text-lg prose-h3:leading-7 prose-headings:mt-6 prose-headings:mb-3 prose-blockquote:border-l-4 prose-blockquote:border-white/30 prose-blockquote:bg-[#051ae0] prose-blockquote:px-6 prose-blockquote:py-2 prose-blockquote:not-italic">
                    <div 
                      className="newsletter-content prose prose-invert max-w-none" 
                      style={{ 
                        fontFamily: "'Helvetica', Arial, sans-serif",
                        fontSize: "16px",
                        lineHeight: "24px"
                      }} 
                      dangerouslySetInnerHTML={{ __html: convertMarkdownToHtml(newsletter.content) }}
                    />
                  </div>
                </div>
                
                {/* Window footer */}
                <div className="bg-[#0618F3] p-3 flex items-center justify-center border-t border-white/20">
                  <span className="text-sm text-white">© Infinite Runway</span>
                </div>
              </div>
              
              {/* Companies raising section */}
              <div className="mb-8 border border-white/30 rounded-none">
                {/* Window header */}
                <div className="bg-[#0618F3] p-4 flex items-center border-b border-white/30">
                  <span className="text-lg font-bold" style={{ fontSize: "20px", lineHeight: "30px" }}>Companies Raising</span>
                </div>
                
                {/* Window content with blue background */}
                <div className="bg-[#0618F3] py-5 px-6 text-white">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-white/20 pb-3">
                      <div>
                        <p className="text-lg">Acme AI</p>
                        <p className="text-xs opacity-80">AI-powered customer service platform</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">$10M</p>
                        <p className="text-xs opacity-80">Series A</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center border-b border-white/20 pb-3">
                      <div>
                        <p className="text-lg">Neural Systems</p>
                        <p className="text-xs opacity-80">Brain-computer interfaces</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">$5M</p>
                        <p className="text-xs opacity-80">Seed Round</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-lg">Quantum Leap</p>
                        <p className="text-xs opacity-80">Practical quantum computing</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">$25M</p>
                        <p className="text-xs opacity-80">Series B</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Companies hiring section */}
              <div className="mb-8 border border-white/30 rounded-none">
                {/* Window header */}
                <div className="bg-[#0618F3] p-4 flex items-center border-b border-white/30">
                  <span className="text-lg font-bold" style={{ fontSize: "20px", lineHeight: "30px" }}>Companies Hiring</span>
                </div>
                
                {/* Window content with blue background */}
                <div className="bg-[#0618F3] py-5 px-6 text-white">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-white/20 pb-3">
                      <div>
                        <p className="text-lg">TechVision</p>
                        <p className="text-xs opacity-80">Computer vision ML engineers</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">Remote</p>
                        <p className="text-xs opacity-80">$180-220K</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center border-b border-white/20 pb-3">
                      <div>
                        <p className="text-lg">DataStream</p>
                        <p className="text-xs opacity-80">LLM fine-tuning specialists</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">SF / NYC</p>
                        <p className="text-xs opacity-80">$160-210K</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-lg">NeuroCorp</p>
                        <p className="text-xs opacity-80">AI research scientists</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">Hybrid</p>
                        <p className="text-xs opacity-80">$190-250K</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Suggestion Box section */}
              <div className="mb-8 border border-white/30 rounded-none">
                {/* Window header */}
                <div className="bg-[#0618F3] p-4 flex items-center border-b border-white/30">
                  <span className="text-lg font-bold" style={{ fontSize: "20px", lineHeight: "30px" }}>Suggestion Box</span>
                </div>
                
                {/* Window content with blue background */}
                <div className="bg-[#0618F3] py-5 px-6 text-white">
                  <p className="text-base mb-2">What'd you think of this email?</p>
                  <p className="text-sm mb-4 opacity-80">You can add more feedback after choosing an option 👇🏽</p>
                  
                  <div className="flex justify-center gap-4 mb-5">
                    <button className="flex flex-col items-center justify-center">
                      <span className="text-2xl mb-1">👎</span>
                      <span className="text-xs">Not great</span>
                    </button>
                    
                    <button className="flex flex-col items-center justify-center">
                      <span className="text-2xl mb-1">😐</span>
                      <span className="text-xs">Neutral</span>
                    </button>
                    
                    <button className="flex flex-col items-center justify-center">
                      <span className="text-2xl mb-1">👍</span>
                      <span className="text-xs">Good</span>
                    </button>
                    
                    <button className="flex flex-col items-center justify-center">
                      <span className="text-2xl mb-1">😍</span>
                      <span className="text-xs">Loved it</span>
                    </button>
                  </div>
                  
                  <div className="text-center pt-2 border-t border-white/20">
                    <p className="text-sm">Enjoyed this newsletter? <a href="#" className="underline hover:opacity-80">Forward it to a friend</a> and have them <a href="#" className="underline hover:opacity-80">signup here</a>.</p>
                  </div>
                </div>
                <div className="bg-[#0618F3] p-3 flex items-center justify-center border-t border-white/20">
                  <span className="text-sm text-white">© Infinite Runway</span>
                </div>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }
  
  // Fallback to old blog post system
  const post = await getBlogPostBySlug(resolvedParams.slug);
  
  // If neither found, return 404
  if (!post) {
    notFound();
  }

      return (
      <div className="min-h-screen overflow-x-hidden bg-[#0019fd] text-white">
      <Header />
      
      <main className="flex-grow">
        <div className="px-4 sm:px-6 pt-8">
          {/* Blog post content - narrower container for the main content */}
          <div className="mx-auto w-full max-w-2xl">
            {/* Breadcrumb */}
            <ul className="flex flex-wrap items-center gap-2 text-xs font-semibold mb-8">
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
                <span className="!opacity-100 truncate max-w-[200px]">{post.title}</span>
              </li>
            </ul>
            
            {/* Blog post header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold" style={{ fontSize: "25px", lineHeight: "38px" }}>{post.title}</h1>
              <div className="mt-4 flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {post.authorImageUrl ? (
                    <div className="h-10 w-10 rounded-full overflow-hidden">
                      <ImageWithFallback
                        src={post.authorImageUrl}
                        alt={post.authorName}
                        width={40}
                        height={40}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-blue-900 flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {post.authorName.charAt(0)}
                      </span>
                    </div>
                  )}
                  <span className="text-base">{post.authorName}</span>
                </div>
                <div className="text-sm opacity-80">
                  <time dateTime={post.publishDate}>{post.publishDate}</time>
                </div>
              </div>
            </div>
            
            {/* Feature image - thumbnail */}
            <div className="mb-8">
              <div className="aspect-video w-full overflow-hidden rounded-none border border-white/30 bg-[#0019fd]/50">
                <ImageWithFallback
                  src={post.imageUrl}
                  alt={post.title}
                  width={1200}
                  height={675}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
            
            {/* Sponsored section - Windows 95 style */}
            {post.sponsorInfo ? (
              <div className="mb-8">
                <div className="w-full border border-white/30 rounded-none">
                  {/* Window header - extra chunky with larger OpenAI logo */}
                  <div className="bg-[#0618F3] p-6 flex flex-col items-center justify-center border-b border-white/30">
                    <span className="text-sm font-bold wt-header-font mb-3">In Partnership with</span>
                    <a 
                      href={post.sponsorInfo.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-12 w-auto"
                    >
                      <Image
                        src={post.sponsorInfo.logo}
                        alt={post.sponsorInfo.name}
                        width={180}
                        height={54}
                        className="h-12 w-auto"
                      />
                    </a>
                  </div>
                  
                  {/* Content area with blue background */}
                  <div className="bg-[#0618F3] p-4 text-white">
                    
                    {/* Sponsor description and CTA */}
                    <div>
                      <div className="text-base mb-8 whitespace-pre-line" style={{ fontSize: "16px", lineHeight: "24px" }}>
                        {post.sponsorInfo.description || `${post.sponsorInfo.name} is revolutionizing how we interact with AI. Experience the future of intelligent assistance today.`}
                      </div>
                      <div className="flex justify-center mb-4">
                        <a 
                          href={post.sponsorInfo.ctaLink || post.sponsorInfo.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="border font-medium focus:outline-none focus:border-transparent inline-flex items-center whitespace-nowrap transition-colors duration-200 focus:ring-1 bg-white text-[#0618F3] border-white shadow-sm hover:bg-white/90 focus:ring-white justify-center rounded-md py-2 px-4 text-sm"
                        >
                          {post.sponsorInfo.ctaText || "Try it free"}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
            
            {/* Blog content - styled like Windows 95 window */}
            <div className="mb-8 border border-white/30">
              {/* Window header */}
              <div className="bg-[#0618F3] p-4 flex items-center border-b border-white/30">
                <span className="text-lg font-bold" style={{ fontSize: "20px", lineHeight: "30px" }}>{post.title}</span>
              </div>
              
              {/* Window content with blue background */}
              <div className="bg-[#0618F3] p-6 text-white">
                <div className="prose prose-invert max-w-none prose-p:text-base prose-p:leading-7 prose-p:my-3 prose-h1:text-2xl prose-h1:leading-9 prose-h2:text-xl prose-h2:leading-8 prose-h3:text-lg prose-h3:leading-7 prose-headings:mt-6 prose-headings:mb-3 prose-blockquote:border-l-4 prose-blockquote:border-white/30 prose-blockquote:bg-[#051ae0] prose-blockquote:px-6 prose-blockquote:py-2 prose-blockquote:not-italic">
                  <div 
                    className="newsletter-content" 
                    style={{ 
                      fontFamily: "'Helvetica', Arial, sans-serif",
                      fontSize: "16px",
                      lineHeight: "24px"
                    }} 
                    dangerouslySetInnerHTML={{ __html: post.content }} 
                  />
                </div>
              </div>
              
              {/* Window footer */}
              <div className="bg-[#0618F3] p-3 flex items-center justify-center border-t border-white/20">
                <span className="text-sm text-white">© Infinite Runway</span>
              </div>
            </div>
            
            {/* Companies raising section */}
            <div className="mb-8 border border-white/30 rounded-none">
              {/* Window header */}
              <div className="bg-[#0618F3] p-4 flex items-center border-b border-white/30">
                <span className="text-lg font-bold" style={{ fontSize: "20px", lineHeight: "30px" }}>Companies Raising</span>
              </div>
              
              {/* Window content with blue background */}
              <div className="bg-[#0618F3] py-5 px-6 text-white">
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-white/20 pb-3">
                    <div>
                      <p className="text-lg">Acme AI</p>
                      <p className="text-xs opacity-80">AI-powered customer service platform</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">$10M</p>
                      <p className="text-xs opacity-80">Series A</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center border-b border-white/20 pb-3">
                    <div>
                      <p className="text-lg">Neural Systems</p>
                      <p className="text-xs opacity-80">Brain-computer interfaces</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">$5M</p>
                      <p className="text-xs opacity-80">Seed Round</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-lg">Quantum Leap</p>
                      <p className="text-xs opacity-80">Practical quantum computing</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">$25M</p>
                      <p className="text-xs opacity-80">Series B</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Companies hiring section */}
            <div className="mb-8 border border-white/30 rounded-none">
              {/* Window header */}
              <div className="bg-[#0618F3] p-4 flex items-center border-b border-white/30">
                <span className="text-lg font-bold" style={{ fontSize: "20px", lineHeight: "30px" }}>Companies Hiring</span>
              </div>
              
              {/* Window content with blue background */}
              <div className="bg-[#0618F3] py-5 px-6 text-white">
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-white/20 pb-3">
                    <div>
                      <p className="text-lg">TechVision</p>
                      <p className="text-xs opacity-80">Computer vision ML engineers</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">Remote</p>
                      <p className="text-xs opacity-80">$180-220K</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center border-b border-white/20 pb-3">
                    <div>
                      <p className="text-lg">DataStream</p>
                      <p className="text-xs opacity-80">LLM fine-tuning specialists</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">SF / NYC</p>
                      <p className="text-xs opacity-80">$160-210K</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-lg">NeuroCorp</p>
                      <p className="text-xs opacity-80">AI research scientists</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">Hybrid</p>
                      <p className="text-xs opacity-80">$190-250K</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Suggestion Box section */}
            <div className="mb-8 border border-white/30 rounded-none">
              {/* Window header */}
              <div className="bg-[#0618F3] p-4 flex items-center border-b border-white/30">
                <span className="text-lg font-bold" style={{ fontSize: "20px", lineHeight: "30px" }}>Suggestion Box</span>
              </div>
              
              {/* Window content with blue background */}
              <div className="bg-[#0618F3] py-5 px-6 text-white">
                <p className="text-base mb-2">What'd you think of this email?</p>
                <p className="text-sm mb-4 opacity-80">You can add more feedback after choosing an option 👇🏽</p>
                
                <div className="flex justify-center gap-4 mb-5">
                  <button className="flex flex-col items-center justify-center">
                    <span className="text-2xl mb-1">👎</span>
                    <span className="text-xs">Not great</span>
                  </button>
                  
                  <button className="flex flex-col items-center justify-center">
                    <span className="text-2xl mb-1">😐</span>
                    <span className="text-xs">Neutral</span>
                  </button>
                  
                  <button className="flex flex-col items-center justify-center">
                    <span className="text-2xl mb-1">👍</span>
                    <span className="text-xs">Good</span>
                  </button>
                  
                  <button className="flex flex-col items-center justify-center">
                    <span className="text-2xl mb-1">😍</span>
                    <span className="text-xs">Loved it</span>
                  </button>
                </div>
                
                <div className="text-center pt-2 border-t border-white/20">
                  <p className="text-sm">Enjoyed this newsletter? <a href="#" className="underline hover:opacity-80">Forward it to a friend</a> and have them <a href="#" className="underline hover:opacity-80">signup here</a>.</p>
                </div>
              </div>
            </div>
            
            {/* Divider */}
            <div className="mt-12 border-t border-white/30 pt-8">
              {/* Empty space to maintain spacing */}
            </div>
          </div>
          
          {/* Keep Reading section */}
          <div className="mx-auto w-full max-w-6xl mt-16 space-y-8 px-4">
            <div className="mx-auto w-full max-w-2xl pb-8" style={{ paddingLeft: 0, paddingRight: 0 }}>
              <h4 className="pb-6 leading-none sm:pb-2 text-lg font-bold" style={{ fontSize: "20px", lineHeight: "30px" }}>Keep reading</h4>
              <div className="space-y-6">
                <div className="flex flex-col">
                  {(await getAllBlogPosts())
                    .filter(relatedPost => relatedPost.slug !== post.slug)
                    .slice(0, 3)
                    .map((relatedPost, index) => (
                      <Link 
                        key={index} 
                        href={`/essays/${relatedPost.slug}`}
                        className="group relative flex rounded-none grid w-full grid-cols-1 transition-all hover:bg-opacity-25 sm:my-6 sm:grid-cols-2 flex-row mb-6 gap-y-0 sm:mb-0 hover:bg-white/10"
                        data-discover="true"
                      >
                        <div className="z-10 col-span-1 w-full overflow-hidden rounded-none border border-white/30 bg-[#0019fd]/50">
                          <figure className="aspect-video relative h-full overflow-hidden w-full">
                            <ImageWithFallback
                              src={relatedPost.imageUrl}
                              alt={relatedPost.title}
                              width={800}
                              height={421}
                              className="absolute inset-0 h-full w-full object-cover"
                              loading="lazy"
                            />
                          </figure>
                        </div>
                        <div className="z-10 col-span-1 p-4 border border-white/30 border-l-0">
                          <h2 className="line-clamp-2 text-md font-bold" style={{ fontSize: "16px", lineHeight: "24px" }}>{relatedPost.title}</h2>
                          <p className="mb-2 opacity-75 line-clamp-4 text-sm font-normal" style={{ fontSize: "14px", lineHeight: "21px" }}>{relatedPost.description}</p>
                          <p className="mb-4 opacity-75 text-xs sm:text-sm font-normal">
                            <time dateTime={relatedPost.publishDate}>{relatedPost.publishDate}</time>
                          </p>
                        </div>
                      </Link>
                    ))}
                </div>
                <button type="button" className="flex items-center text-sm transition-all hover:font-medium">
                  <span>View more</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon" className="ml-0.5 h-3 w-3 pt-0.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 