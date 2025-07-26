import React from "react"
import { Header } from "@/components/ui/header"
import { Footer } from "@/components/ui/footer"
import Link from "next/link"
import Image from "next/image"
import { Twitter, Linkedin, Mail } from "lucide-react"

export const metadata = {
  title: "About Us | Infinite Runway",
  description: "Learn about the team behind Infinite Runway - Practical wisdom, insights, and stories in motion.",
}

export default function AboutPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-wt-background">
      <Header />
      
      <main className="flex-grow py-12 px-4 sm:px-6" style={{ backgroundColor: "#0019fd" }}>
        <div className="mx-auto w-full max-w-4xl">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold wt-header-font text-white">About Us</h1>
            <p className="mt-2 text-white/80 wt-body-font">Meet the team behind Infinite Runway</p>
          </div>
          
          {/* Our Story Section */}
          <section className="mb-12 space-y-6">
            <h2 className="text-2xl font-semibold wt-header-font text-white">Our Story</h2>
            <div className="prose prose-lg max-w-none space-y-4 text-white/90 wt-body-font">
              <p>
                Infinite Runway was founded with a simple mission: to provide practical wisdom, 
                insights, and stories that help people navigate their personal and professional lives.
              </p>
              <p>
                In a world of information overload, we curate essential content that cuts through 
                the noise. Our team of experienced writers, editors, and curators work tirelessly 
                to bring you actionable insights that make a difference.
              </p>
              <p>
                We believe that knowledge, well applied, creates unlimited potential – 
                an infinite runway for growth and success.
              </p>
            </div>
          </section>
          
          {/* Team Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold wt-header-font text-white mb-8">Our Team</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Harshith Vaddiparthy - Founder */}
              <div className="flex flex-col items-center">
                <div className="w-full aspect-square overflow-hidden rounded-none mb-4">
                  <div className="relative w-full h-full">
                    <Image 
                      src="/images/team/harshith.png" 
                      alt="Harshith Vaddiparthy" 
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
                <h3 className="text-xl font-semibold wt-header-font text-white">Harshith Vaddiparthy</h3>
                <p className="text-white/80 wt-body-font mb-2">Founder</p>
                <div className="flex space-x-2">
                  <a 
                    href="https://twitter.com/harshithv" 
                    target="_blank" 
                    rel="noreferrer" 
                    aria-label="Follow Harshith on Twitter"
                    className="p-2 text-white hover:text-white/80 transition-colors"
                  >
                    <Twitter className="h-4 w-4" />
                  </a>
                  <a 
                    href="https://linkedin.com/in/harshithv" 
                    target="_blank" 
                    rel="noreferrer" 
                    aria-label="Connect with Harshith on LinkedIn"
                    className="p-2 text-white hover:text-white/80 transition-colors"
                  >
                    <Linkedin className="h-4 w-4" />
                  </a>
                  <a 
                    href="mailto:harshith@infiniterunway.com" 
                    aria-label="Email Harshith"
                    className="p-2 text-white hover:text-white/80 transition-colors"
                  >
                    <Mail className="h-4 w-4" />
                  </a>
                </div>
              </div>
              
              {/* Savannah Pierce - Editor in Chief */}
              <div className="flex flex-col items-center">
                <div className="w-full aspect-square overflow-hidden rounded-none mb-4">
                  <div className="relative w-full h-full">
                    <Image 
                      src="/images/team/savannah.png" 
                      alt="Savannah Pierce" 
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
                <h3 className="text-xl font-semibold wt-header-font text-white">Savannah Pierce</h3>
                <p className="text-white/80 wt-body-font mb-2">Editor in Chief</p>
                <div className="flex space-x-2">
                  <a 
                    href="https://twitter.com/savannahpierce" 
                    target="_blank" 
                    rel="noreferrer" 
                    aria-label="Follow Savannah on Twitter"
                    className="p-2 text-white hover:text-white/80 transition-colors"
                  >
                    <Twitter className="h-4 w-4" />
                  </a>
                  <a 
                    href="https://linkedin.com/in/savannahpierce" 
                    target="_blank" 
                    rel="noreferrer" 
                    aria-label="Connect with Savannah on LinkedIn"
                    className="p-2 text-white hover:text-white/80 transition-colors"
                  >
                    <Linkedin className="h-4 w-4" />
                  </a>
                  <a 
                    href="mailto:savannah@infiniterunway.com" 
                    aria-label="Email Savannah"
                    className="p-2 text-white hover:text-white/80 transition-colors"
                  >
                    <Mail className="h-4 w-4" />
                  </a>
                </div>
              </div>
              
              {/* Ava Kensington - Chief Curator */}
              <div className="flex flex-col items-center">
                <div className="w-full aspect-square overflow-hidden rounded-none mb-4">
                  <div className="relative w-full h-full">
                    <Image 
                      src="/images/team/ava.png" 
                      alt="Ava Kensington" 
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
                <h3 className="text-xl font-semibold wt-header-font text-white">Ava Kensington</h3>
                <p className="text-white/80 wt-body-font mb-2">Chief Curator</p>
                <div className="flex space-x-2">
                  <a 
                    href="https://twitter.com/avakensington" 
                    target="_blank" 
                    rel="noreferrer" 
                    aria-label="Follow Ava on Twitter"
                    className="p-2 text-white hover:text-white/80 transition-colors"
                  >
                    <Twitter className="h-4 w-4" />
                  </a>
                  <a 
                    href="https://linkedin.com/in/avakensington" 
                    target="_blank" 
                    rel="noreferrer" 
                    aria-label="Connect with Ava on LinkedIn"
                    className="p-2 text-white hover:text-white/80 transition-colors"
                  >
                    <Linkedin className="h-4 w-4" />
                  </a>
                  <a 
                    href="mailto:ava@infiniterunway.com" 
                    aria-label="Email Ava"
                    className="p-2 text-white hover:text-white/80 transition-colors"
                  >
                    <Mail className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          </section>
          
          {/* Our Values Section */}
          <section className="mb-12 space-y-6">
            <h2 className="text-2xl font-semibold wt-header-font text-white">Our Values</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-6 border-2 border-white">
                <h3 className="text-xl font-semibold wt-header-font text-white mb-2">Quality Over Quantity</h3>
                <p className="text-white/90 wt-body-font">
                  We believe in delivering deeply researched, thoughtfully crafted content that provides 
                  real value rather than chasing trends or creating noise.
                </p>
              </div>
              <div className="p-6 border-2 border-white">
                <h3 className="text-xl font-semibold wt-header-font text-white mb-2">Practical Wisdom</h3>
                <p className="text-white/90 wt-body-font">
                  Our content is designed to be immediately applicable, providing insights 
                  that can be put into action in your personal and professional life.
                </p>
              </div>
              <div className="p-6 border-2 border-white">
                <h3 className="text-xl font-semibold wt-header-font text-white mb-2">Authenticity</h3>
                <p className="text-white/90 wt-body-font">
                  We share real stories, genuine experiences, and honest perspectives, 
                  even when they challenge conventional thinking.
                </p>
              </div>
              <div className="p-6 border-2 border-white">
                <h3 className="text-xl font-semibold wt-header-font text-white mb-2">Continuous Growth</h3>
                <p className="text-white/90 wt-body-font">
                  We're committed to constant learning and improvement, 
                  both in our content and as an organization.
                </p>
              </div>
            </div>
          </section>
          
          {/* Contact Section */}
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold wt-header-font text-white">Get In Touch</h2>
            <div className="prose prose-lg max-w-none space-y-4 text-white/90 wt-body-font">
              <p>
                Have questions, feedback, or want to collaborate? We'd love to hear from you.
              </p>
              <div className="flex flex-col space-y-2">
                <p className="flex items-center">
                  <Mail className="h-5 w-5 mr-2 text-white" />
                  <a href="mailto:hello@infiniterunway.com" className="text-white hover:underline">
                    hello@infiniterunway.com
                  </a>
                </p>
              </div>
              <div className="mt-6">
                <Link 
                  href="/subscribe" 
                  className="inline-block bg-white text-primary py-3 px-6 font-medium wt-button-font hover:bg-white/90 transition-colors"
                >
                  Subscribe to Our Newsletter
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  )
} 