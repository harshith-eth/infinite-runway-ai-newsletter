"use client"

import Image from "next/image"
import { Search, Twitter, Linkedin, Instagram, Rss, ChevronDown, ChevronUp } from "lucide-react"
import Link from "next/link"
import { NewsletterForm } from "@/components/newsletter-form"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useState } from "react"
import { Header } from "@/components/ui/header"
import { Footer } from "@/components/ui/footer"

export default function Advertise() {
  // State to track accordion open state
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0618F3]">
      {/* Header */}
      <Header />

      {/* Advertise Content - Styled like beehiiv */}
      <main className="pb-20 pt-28 w-full max-w-2xl mx-auto space-y-10 relative z-10 px-4">
        {/* Newsletter Info */}
        <div className="space-y-3">
          <img
            src="/images/logo.svg"
            alt="Infinite Runway logo"
            className="h-[80px] w-auto rounded-md mx-auto"
          />
          <div className="text-center text-2xl text-white font-semibold">
            Infinite Runway
          </div>
          <div className="text-center text-base text-white font-normal">
            Practical wisdom, insights, and stories in motion sent to your inbox weekly
          </div>
          <div className="flex justify-center gap-2">
            <span className="shadow-xs inline-flex items-center text-xs font-medium relative rounded-none bg-white text-[#0618F3] border-white border px-2 py-1 gap-x-1">
              <span className="w-full block overflow-hidden whitespace-nowrap text-ellipsis">startups</span>
            </span>
            <span className="shadow-xs inline-flex items-center text-xs font-medium relative rounded-none bg-white text-[#0618F3] border-white border px-2 py-1 gap-x-1">
              <span className="w-full block overflow-hidden whitespace-nowrap text-ellipsis">business</span>
            </span>
            <span className="shadow-xs inline-flex items-center text-xs font-medium relative rounded-none bg-white text-[#0618F3] border-white border px-2 py-1 gap-x-1">
              <span className="w-full block overflow-hidden whitespace-nowrap text-ellipsis">technology</span>
            </span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Subscribers Card */}
          <div className="border group/ui-card relative rounded-md border-white bg-[#0618F3] flex flex-col w-full">
            <div className="h-full flex flex-col justify-between p-4 space-y-4">
              <div className="space-y-2 py-2">
                <div className="flex items-center space-x-2">
                  <span className="flex items-center gap-x-1 break-word text-base text-white font-medium">
                    Subscribers
                  </span>
                </div>
                <div>
                  <span className="text-3xl text-white font-semibold">
                    <p className="truncate">18.5K</p>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Open Rate Card */}
          <div className="border group/ui-card relative rounded-md border-white bg-[#0618F3] flex flex-col w-full">
            <div className="h-full flex flex-col justify-between p-4 space-y-4">
              <div className="space-y-2 py-2">
                <div className="flex items-center space-x-2">
                  <span className="flex items-center gap-x-1 break-word text-base text-white font-medium">
                    Open Rate
                  </span>
                </div>
                <div>
                  <span className="text-3xl text-white font-semibold">
                    <p className="truncate">42.3%</p>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Click Through Rate Card */}
          <div className="border group/ui-card relative rounded-md border-white bg-[#0618F3] flex flex-col w-full">
            <div className="h-full flex flex-col justify-between p-4 space-y-4">
              <div className="space-y-2 py-2">
                <div className="flex items-center space-x-2">
                  <span className="flex items-center gap-x-1 break-word text-base text-white font-medium">
                    Click Through Rate
                  </span>
                </div>
                <div>
                  <span className="text-3xl text-white font-semibold">
                    <p className="truncate">3.7%</p>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sponsorship Packages */}
        <div className="flex flex-col gap-4">
          {/* Monthly Package - Now with Accordion */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="monthly-package" className="border-0">
              <div className="border group/ui-card relative rounded-md border-white bg-[#0618F3] p-6">
                <AccordionTrigger className="hover:no-underline w-full !py-0 [&>svg]:hidden">
                  <div className="justify-between gap-3 pb-2 flex text-left items-center space-x-1 w-full">
                    <span className="grow text-xl text-white font-medium">Monthly Package</span>
                    <div className="flex items-center">
                      <span className="text-xl text-white font-medium mr-2">$12,000.00</span>
                      <ChevronDown className="h-4 w-4 shrink-0 text-white transition-transform duration-200 group-data-[state=open]:rotate-180" />
                    </div>
                  </div>
                </AccordionTrigger>
                <div className="text-base text-white font-normal">
                  Get a 10% discount by purchasing a monthly bundle and own the inventory exclusively.
                </div>
                <div className="flex flex-wrap md:max-w-[80%] gap-2 pt-2">
                  <span className="shadow-xs inline-flex items-center text-xs font-medium relative rounded bg-[#0618F3] text-white border-white border px-2 py-1 gap-x-1">
                    <span className="w-full block overflow-hidden whitespace-nowrap text-ellipsis">4x Primary Sponsorship</span>
                  </span>
                </div>
                <AccordionContent>
                  <div className="mt-4 border border-white/60 rounded-md p-4 bg-[#051399]">
                    <h3 className="text-white text-lg font-medium mb-2">Sponsorship Placement Examples</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-white text-base font-medium mb-2">Primary Placement</h4>
                        <div className="bg-white/10 p-2 rounded-md">
                          <img 
                            src="/images/logo.svg" 
                            alt="Primary sponsorship placement example" 
                            className="w-full h-auto rounded-md border border-white/40"
                          />
                          <p className="text-white/90 text-sm mt-2">
                            Your brand featured prominently at the top of the newsletter with a custom message
                          </p>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-white text-base font-medium mb-2">Secondary Placement</h4>
                        <div className="bg-white/10 p-2 rounded-md">
                          <img 
                            src="/images/logo.svg" 
                            alt="Secondary sponsorship placement example" 
                            className="w-full h-auto rounded-md border border-white/40"
                          />
                          <p className="text-white/90 text-sm mt-2">
                            Additional placements throughout the newsletter for maximum visibility
                          </p>
                        </div>
                      </div>
                    </div>
                    <p className="text-white/80 mt-4 text-sm">
                      Monthly package includes exclusive branding and priority placement in all weekly newsletters for the month.
                    </p>
                  </div>
                </AccordionContent>
                <div className="flex justify-end pt-3">
                  <button className="border font-medium focus:outline-none focus:border-transparent inline-flex items-center whitespace-nowrap transition-colors duration-200 focus:ring-1 bg-white text-[#0618F3] border-white shadow-sm hover:bg-white/90 focus:ring-white justify-center rounded-md py-2 px-3 text-sm">
                    Book
                  </button>
                </div>
              </div>
            </AccordionItem>
          </Accordion>

          {/* Primary Sponsorship */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="primary-sponsorship" className="border-0">
              <div className="border group/ui-card relative rounded-md border-white bg-[#0618F3] p-6">
                <AccordionTrigger className="hover:no-underline w-full !py-0 [&>svg]:hidden">
                  <div className="justify-between gap-3 pb-2 flex text-left items-center space-x-1 w-full">
                    <span className="grow text-xl text-white font-medium">Primary Sponsorship</span>
                    <div className="flex items-center">
                      <span className="text-xl text-white font-medium mr-2">$3,500.00</span>
                      <ChevronDown className="h-4 w-4 shrink-0 text-white transition-transform duration-200 group-data-[state=open]:rotate-180" />
                    </div>
                  </div>
                </AccordionTrigger>
                <div className="text-base text-white font-normal">
                  Includes your logo and 150 words of custom copy at the top of the newsletter. 100% share of voice, reaching over 18K startup founders and employees.
                </div>
                <AccordionContent>
                  <div className="mt-4 border border-white/60 rounded-md p-4 bg-[#051399]">
                    <h3 className="text-white text-lg font-medium mb-2">Primary Sponsorship Example</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-white text-base font-medium mb-2">Newsletter Header Placement</h4>
                        <div className="bg-white/10 p-2 rounded-md">
                          <img 
                            src="/images/logo.svg" 
                            alt="Primary sponsorship header example" 
                            className="w-full h-auto rounded-md border border-white/40"
                          />
                          <p className="text-white/90 text-sm mt-2">
                            Your brand featured prominently at the top of the newsletter with premium placement
                          </p>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-white text-base font-medium mb-2">Features</h4>
                        <ul className="list-disc pl-5 text-white/90 text-sm space-y-1">
                          <li>Premium placement at the top of the newsletter</li>
                          <li>150 words of custom messaging</li>
                          <li>Logo and brand visibility to 18K+ subscribers</li>
                          <li>Direct link to your landing page or promotion</li>
                          <li>Performance metrics report after campaign</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
                <div className="flex justify-end pt-3">
                  <button className="border font-medium focus:outline-none focus:border-transparent inline-flex items-center whitespace-nowrap transition-colors duration-200 focus:ring-1 bg-white text-[#0618F3] border-white shadow-sm hover:bg-white/90 focus:ring-white justify-center rounded-md py-2 px-3 text-sm">
                    Book
                  </button>
                </div>
              </div>
            </AccordionItem>
          </Accordion>

          {/* Secondary Sponsorship */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="secondary-sponsorship" className="border-0">
              <div className="border group/ui-card relative rounded-md border-white bg-[#0618F3] p-6">
                <AccordionTrigger className="hover:no-underline w-full !py-0 [&>svg]:hidden">
                  <div className="justify-between gap-3 pb-2 flex text-left items-center space-x-1 w-full">
                    <span className="grow text-xl text-white font-medium">Secondary Sponsorship</span>
                    <div className="flex items-center">
                      <span className="text-xl text-white font-medium mr-2">$1,500.00</span>
                      <ChevronDown className="h-4 w-4 shrink-0 text-white transition-transform duration-200 group-data-[state=open]:rotate-180" />
                    </div>
                  </div>
                </AccordionTrigger>
                <div className="text-base text-white font-normal">
                  Includes your logo and 75 words of custom copy placed in the middle section of the newsletter.
                </div>
                <AccordionContent>
                  <div className="mt-4 border border-white/60 rounded-md p-4 bg-[#051399]">
                    <h3 className="text-white text-lg font-medium mb-2">Secondary Sponsorship Example</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-white text-base font-medium mb-2">In-Content Placement</h4>
                        <div className="bg-white/10 p-2 rounded-md">
                          <img 
                            src="/images/logo.svg" 
                            alt="Secondary sponsorship example" 
                            className="w-full h-auto rounded-md border border-white/40"
                          />
                          <p className="text-white/90 text-sm mt-2">
                            Your brand strategically placed within the content of the newsletter
                          </p>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-white text-base font-medium mb-2">Features</h4>
                        <ul className="list-disc pl-5 text-white/90 text-sm space-y-1">
                          <li>Prominent mid-newsletter placement</li>
                          <li>75 words of custom messaging</li>
                          <li>Logo and brand visibility</li>
                          <li>Direct link to your landing page</li>
                          <li>Performance metrics included</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
                <div className="flex justify-end pt-3">
                  <button className="border font-medium focus:outline-none focus:border-transparent inline-flex items-center whitespace-nowrap transition-colors duration-200 focus:ring-1 bg-white text-[#0618F3] border-white shadow-sm hover:bg-white/90 focus:ring-white justify-center rounded-md py-2 px-3 text-sm">
                    Book
                  </button>
                </div>
              </div>
            </AccordionItem>
          </Accordion>

          {/* Custom Collaboration */}
          <div className="border group/ui-card relative rounded-md border-white bg-[#0618F3] p-6">
            <div className="justify-between gap-3 flex text-left items-center space-x-1">
              <span className="grow text-base text-white font-medium">Looking for a custom collaboration?</span>
              <a href="mailto:contact@infiniterunway.com?subject=Sponsorship%20Inquiry">
                <button type="button" className="border font-medium focus:outline-none focus:border-transparent inline-flex items-center whitespace-nowrap transition-colors duration-200 focus:ring-1 bg-white text-[#0618F3] border-white shadow-sm hover:bg-white/90 focus:ring-white justify-center rounded-md py-2 px-3 text-sm">
                  Get in touch
                </button>
              </a>
            </div>
          </div>
        </div>


      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
} 