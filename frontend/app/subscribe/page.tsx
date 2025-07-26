import Image from "next/image";
import { NewsletterForm } from "@/components/newsletter-form";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Subscribe | Infinite Runway",
  description: "Subscribe to Infinite Runway for insights from the tech and venture capital ecosystem",
};

export default function SubscribePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-44 bg-white px-4 relative">
      <div className="w-full max-w-md mx-auto flex flex-col items-center">
        {/* Logo */}
        <div className="mb-1 flex justify-center">
          <Image
            src="/images/logo.svg"
            alt="Infinite Runway Logo"
            width={220}
            height={220}
            className="h-44 w-44 sm:h-52 sm:w-52 object-contain"
            priority
          />
        </div>
        {/* One-liner */}
        <h1 className="text-center text-xl sm:text-2xl md:text-3xl font-bold wt-header-font text-black mb-8 whitespace-nowrap">
          Get the best in tech & venture, straight to your inbox.
        </h1>
        {/* Newsletter Input - with specific styling to ensure visibility against background */}
        <div className="w-full mb-4" style={{ filter: "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.05))" }}>
          <div className="bg-white border-2 border-[#0019fd] rounded-none">
            <NewsletterForm />
          </div>
        </div>
        {/* 75k+ Readership Statement */}
        <div className="text-center text-xs sm:text-[0.91rem] font-medium text-gray-700 wt-body-font mt-1">
          Trusted by 75,000+ operators, and investors at top startups & funds.
        </div>
      </div>
      
      {/* Copyright Footer */}
      <div className="absolute bottom-4 right-4 text-xs text-gray-500">
        © 2025 Infinite Runway. <Link href="/privacy" className="hover:underline">Privacy Policy</Link>. <Link href="/terms" className="hover:underline">Terms of Use</Link>
      </div>
    </div>
  );
} 