import React from "react"
import Link from "next/link"
import { Header } from "@/components/ui/header"
import { Footer } from "@/components/ui/footer"

export const metadata = {
  title: "Sitemap | Infinite Runway",
  description: "Browse all available pages and resources on Infinite Runway.",
}

export default function Sitemap() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-white">
      <Header />
      
      <main className="flex-grow py-12 px-4 sm:px-6 bg-white">
        <div className="mx-auto w-full max-w-4xl">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold wt-header-font text-primary">Sitemap</h1>
            <p className="mt-2 text-sm text-gray-500">A complete guide to all our pages</p>
          </div>
          
          {/* Sitemap Content */}
          <div className="prose prose-lg max-w-none space-y-10 text-gray-800 wt-body-font">
            {/* Main Pages */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold wt-header-font text-primary">Main Pages</h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <li>
                  <Link href="/" className="text-primary hover:underline">Home</Link>
                  <p className="text-sm text-gray-600">Discover our landing page and latest featured content.</p>
                </li>
                <li>
                  <Link href="/essays" className="text-primary hover:underline">Essays</Link>
                  <p className="text-sm text-gray-600">Read our collection of insightful essays and articles.</p>
                </li>
                <li>
                  <Link href="/advertise" className="text-primary hover:underline">Advertise</Link>
                  <p className="text-sm text-gray-600">Learn how you can partner with us and advertise on our platform.</p>
                </li>
                <li>
                  <Link href="/about" className="text-primary hover:underline">About</Link>
                  <p className="text-sm text-gray-600">Learn more about Infinite Runway and our mission.</p>
                </li>
                <li>
                  <Link href="/contact" className="text-primary hover:underline">Contact</Link>
                  <p className="text-sm text-gray-600">Get in touch with our team for inquiries or support.</p>
                </li>
                <li>
                  <Link href="/careers" className="text-primary hover:underline">Careers</Link>
                  <p className="text-sm text-gray-600">Explore opportunities to join our growing team.</p>
                </li>
              </ul>
            </section>
            
            {/* Legal Pages */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold wt-header-font text-primary">Legal Pages</h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <li>
                  <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                  <p className="text-sm text-gray-600">Our policy regarding data collection and privacy protection.</p>
                </li>
                <li>
                  <Link href="/terms" className="text-primary hover:underline">Terms of Use</Link>
                  <p className="text-sm text-gray-600">The terms and conditions for using our platform.</p>
                </li>
                <li>
                  <Link href="/cookies" className="text-primary hover:underline">Cookie Policy</Link>
                  <p className="text-sm text-gray-600">Information about how we use cookies and tracking technologies.</p>
                </li>
              </ul>
            </section>
            
            {/* Resources */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold wt-header-font text-primary">Resources</h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <li>
                  <Link href="/partners" className="text-primary hover:underline">Partners</Link>
                  <p className="text-sm text-gray-600">Discover our partner network and collaboration opportunities.</p>
                </li>
                <li>
                  <Link href="/sitemap" className="text-primary hover:underline">Sitemap</Link>
                  <p className="text-sm text-gray-600">A comprehensive list of all pages on our website.</p>
                </li>
              </ul>
            </section>
            
            {/* XML Sitemap */}
            <section className="space-y-4 border-t pt-8">
              <h2 className="text-2xl font-semibold wt-header-font text-primary">XML Sitemaps</h2>
              <p>For search engines and programmatic access, we provide the following XML sitemaps:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <a href="/sitemap.xml" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                    XML Sitemap
                  </a>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
} 