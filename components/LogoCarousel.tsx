import Image from "next/image"
import React from "react"

const vcLogos = [
  { name: "Andreessen Horowitz", imgPath: "/images/logos/ventures/a16z.svg" },
  { name: "Accel", imgPath: "/images/logos/ventures/Accel.svg" },
  { name: "Founders Fund", imgPath: "/images/logos/ventures/FoundersFund.svg" },
  { name: "Greylock", imgPath: "/images/logos/ventures/Greylock.svg" },
  { name: "GV", imgPath: "/images/logos/ventures/gv.svg" },
  { name: "NFX", imgPath: "/images/logos/ventures/NFX.svg" },
  { name: "Lightspeed Venture Partners", imgPath: "/images/logos/ventures/Lightspeed Venture Partners.svg" },
  { name: "NEA", imgPath: "/images/logos/ventures/NEA.svg" },
  { name: "Y Combinator", imgPath: "/images/logos/ventures/ycombinator.svg" },
];

const startupLogos = [
  { name: "Anthropic", imgPath: "/images/logos/startups/anthropic.svg" },
  { name: "AWS", imgPath: "/images/logos/startups/aws.svg" },
  { name: "Beehiiv", imgPath: "/images/logos/startups/beehiiv.svg" },
  { name: "Cursor", imgPath: "/images/logos/startups/cursor.svg" },
  { name: "Deel", imgPath: "/images/logos/startups/deel.svg" },
  { name: "Lovable", imgPath: "/images/logos/startups/lovable.svg" },
  { name: "Mercury", imgPath: "/images/logos/startups/mercury.svg" },
  { name: "OpenAI", imgPath: "/images/logos/startups/OpenAI.svg" },
  { name: "Perplexity", imgPath: "/images/logos/startups/perplexity.svg" },
  { name: "PostHog", imgPath: "/images/logos/startups/posthog-logo.svg" },
  { name: "Resend", imgPath: "/images/logos/startups/resend-wordmark-black.svg" },
  { name: "Vercel", imgPath: "/images/logos/startups/vercel.svg" },
  { name: "Windsurf", imgPath: "/images/logos/startups/windsurf.svg" },
];

export function LogoCarousel() {
  return (
    <div className="w-full bg-black py-6 sm:py-10 mb-6 sm:mb-10 overflow-hidden">
      <div className="text-center mb-4 sm:mb-6 px-4">
        <h3 className="text-white text-sm sm:text-md md:text-lg font-normal font-helvetica">Read by the founders, employees, and investors at the top startups and funds.</h3>
      </div>
      <div className="logo-carousel-container relative w-full overflow-hidden">
        {/* VC Logos */}
        <div className="flex">
          <div className="logo-carousel flex animate-marquee whitespace-nowrap" style={{ willChange: 'transform' }}>
            {vcLogos.map((logo, index) => (
              <div key={`vc-primary-${index}`} className="logo-item flex-shrink-0 flex items-center justify-center mx-[20.7px]">
                <Image 
                  src={logo.imgPath}
                  alt={logo.name}
                  width={logo.name === "NEA" ? 61 : 
                        logo.name === "Y Combinator" ? 105 : 72}
                  height={logo.name === "NEA" ? 26 : 
                         logo.name === "Y Combinator" ? 44 : 30}
                  className={`${
                    logo.name === "NEA" ? "h-[20px]" : 
                    logo.name === "Y Combinator" ? "h-[35px]" : "h-6"
                  } w-auto object-contain`}
                />
              </div>
            ))}
            {/* Duplicate the logos to create a seamless loop */}
            {vcLogos.map((logo, index) => (
              <div key={`vc-secondary-${index}`} className="logo-item flex-shrink-0 flex items-center justify-center mx-[20.7px]">
                <Image 
                  src={logo.imgPath}
                  alt={logo.name}
                  width={logo.name === "NEA" ? 61 : 
                        logo.name === "Y Combinator" ? 105 : 72}
                  height={logo.name === "NEA" ? 26 : 
                         logo.name === "Y Combinator" ? 44 : 30}
                  className={`${
                    logo.name === "NEA" ? "h-[20px]" : 
                    logo.name === "Y Combinator" ? "h-[35px]" : "h-6"
                  } w-auto object-contain`}
                />
              </div>
            ))}
          </div>
        </div>
        
        {/* Startup Logos */}
        <div className="flex">
          <div className="logo-carousel flex animate-marquee-reverse mt-4 whitespace-nowrap" style={{ willChange: 'transform' }}>
            {startupLogos.map((logo, index) => (
              <div key={`startup-primary-${index}`} className="logo-item flex-shrink-0 flex items-center justify-center mx-[20.7px]">
                <Image 
                  src={logo.imgPath}
                  alt={logo.name}
                  width={120}
                  height={40}
                  className={`${
                    logo.name === "Cursor" || logo.name === "Deel" ? "h-[22px]" :
                    logo.name === "Lovable" ? "h-[24px]" : 
                    logo.name === "Beehiiv" ? "h-[30px]" : 
                    logo.name === "PostHog" ? "h-[25px]" : 
                    logo.name === "OpenAI" ? "h-[27px]" : 
                    logo.name === "Vercel" ? "h-[23px]" : 
                    logo.name === "Perplexity" ? "h-[36px]" : 
                    logo.name === "Windsurf" ? "h-[51px]" : 
                    "h-8"
                  } w-auto object-contain`}
                />
              </div>
            ))}
            {/* Duplicate the logos to create a seamless loop */}
            {startupLogos.map((logo, index) => (
              <div key={`startup-secondary-${index}`} className="logo-item flex-shrink-0 flex items-center justify-center mx-[20.7px]">
                <Image 
                  src={logo.imgPath}
                  alt={logo.name}
                  width={120}
                  height={40}
                  className={`${
                    logo.name === "Cursor" || logo.name === "Deel" ? "h-[22px]" :
                    logo.name === "Lovable" ? "h-[24px]" : 
                    logo.name === "Beehiiv" ? "h-[30px]" : 
                    logo.name === "PostHog" ? "h-[25px]" : 
                    logo.name === "OpenAI" ? "h-[27px]" : 
                    logo.name === "Vercel" ? "h-[23px]" : 
                    logo.name === "Perplexity" ? "h-[36px]" : 
                    logo.name === "Windsurf" ? "h-[51px]" : 
                    "h-8"
                  } w-auto object-contain`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 