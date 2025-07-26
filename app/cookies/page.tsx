import React from "react"
import { Header } from "@/components/ui/header"
import { Footer } from "@/components/ui/footer"
import Link from "next/link"

export const metadata = {
  title: "Cookie Policy | Infinite Runway",
  description: "Cookie Policy for Infinite Runway - Learn how we use cookies and similar technologies on our website.",
}

export default function CookiePolicy() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-white">
      <Header />
      
      <main className="flex-grow py-12 px-4 sm:px-6 bg-white">
        <div className="mx-auto w-full max-w-4xl">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold wt-header-font text-primary">Cookie Policy</h1>
            <p className="mt-2 text-sm text-gray-500">Last updated: May 30, 2024</p>
          </div>
          
          {/* Cookie Policy Content */}
          <div className="prose prose-lg max-w-none space-y-6 text-gray-800 wt-body-font">
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold wt-header-font text-primary">1. Introduction</h2>
              <p>
                Infinite Runway ("we," "our," or "us") uses cookies and similar technologies on our website at https://infiniterunway.io/ (our "Website"). This Cookie Policy explains how we use cookies and similar technologies to recognize you when you visit our Website. It explains what these technologies are and why we use them, as well as your rights to control our use of them.
              </p>
              <p>
                This Cookie Policy should be read together with our Privacy Policy and Terms of Use. By continuing to browse or use our Website, you agree to our use of cookies and similar technologies as described in this Cookie Policy.
              </p>
            </section>
            
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold wt-header-font text-primary">2. What are Cookies?</h2>
              <p>
                Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners to make their websites work, or to work more efficiently, as well as to provide reporting information.
              </p>
              <p>
                Cookies set by the website owner (in this case, Infinite Runway) are called "first-party cookies." Cookies set by parties other than the website owner are called "third-party cookies." Third-party cookies enable third-party features or functionality to be provided on or through the website (e.g., advertising, interactive content, and analytics). The parties that set these third-party cookies can recognize your computer both when it visits the website in question and also when it visits certain other websites.
              </p>
            </section>
            
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold wt-header-font text-primary">3. Why Do We Use Cookies?</h2>
              <p>
                We use first-party and third-party cookies for several reasons. Some cookies are required for technical reasons in order for our Website to operate, and we refer to these as "essential" or "strictly necessary" cookies. Other cookies also enable us to track and target the interests of our users to enhance the experience on our Website. Third parties serve cookies through our Website for analytics, personalization, and advertising purposes.
              </p>
              <p>The specific types of cookies served through our Website and the purposes they perform are described below:</p>
              
              <h3 className="text-xl font-semibold wt-header-font text-gray-800">Essential Cookies</h3>
              <p>
                These cookies are strictly necessary to provide you with services available through our Website and to use some of its features, such as access to secure areas. Because these cookies are strictly necessary to deliver the Website, you cannot refuse them without impacting how our Website functions.
              </p>
              
              <h3 className="text-xl font-semibold wt-header-font text-gray-800">Performance and Functionality Cookies</h3>
              <p>
                These cookies are used to enhance the performance and functionality of our Website but are non-essential to its use. However, without these cookies, certain functionality may become unavailable.
              </p>
              
              <h3 className="text-xl font-semibold wt-header-font text-gray-800">Analytics and Customization Cookies</h3>
              <p>
                These cookies collect information that is used either in aggregate form to help us understand how our Website is being used or how effective our marketing campaigns are, or to help us customize our Website for you.
              </p>
              
              <h3 className="text-xl font-semibold wt-header-font text-gray-800">Advertising Cookies</h3>
              <p>
                These cookies are used to make advertising messages more relevant to you. They perform functions like preventing the same ad from continuously reappearing, ensuring that ads are properly displayed for advertisers, and in some cases selecting advertisements that are based on your interests.
              </p>
              
              <h3 className="text-xl font-semibold wt-header-font text-gray-800">Social Media Cookies</h3>
              <p>
                These cookies are used to enable you to share pages and content that you find interesting on our Website through third-party social networking and other websites. These cookies may also be used for advertising purposes.
              </p>
            </section>
            
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold wt-header-font text-primary">4. Cookies We Use</h2>
              <p>Below is a detailed list of the cookies we use on our Website:</p>
              
              <table className="min-w-full divide-y divide-gray-200 my-6">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cookie name</th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purpose</th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">__cf_bm</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">Cloudflare</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">Used to distinguish between humans and bots</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">30 minutes</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">cf_clearance</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">Cloudflare</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">Used to verify if a visitor has passed the challenge</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">30 days</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">_ga</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">Google Analytics</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">Registers a unique ID used to generate statistical data on how you use the website</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">2 years</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">_ga_[ID]</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">Google Analytics</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">Used by Google Analytics to persist session state</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">2 years</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">_gid</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">Google Analytics</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">Registers a unique ID used to generate statistical data on how you use the website</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">24 hours</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">newsletter_signup</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">Infinite Runway</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">Remembers if you have signed up for our newsletter</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">30 days</td>
                  </tr>
                </tbody>
              </table>
            </section>
            
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold wt-header-font text-primary">5. How Can You Control Cookies?</h2>
              <p>
                You have the right to decide whether to accept or reject cookies. You can exercise your cookie rights by setting your preferences in the Cookie Consent Manager that we make available when you first visit our Website.
              </p>
              <p>
                You can also set or amend your web browser controls to accept or refuse cookies. If you choose to reject cookies, you may still use our Website though your access to some functionality and areas of our Website may be restricted. As the means by which you can refuse cookies through your web browser controls vary from browser to browser, you should visit your browser's help menu for more information.
              </p>
              <p>
                In addition, most advertising networks offer you a way to opt out of targeted advertising. If you would like to find out more information, please visit <a href="http://www.aboutads.info/choices/" className="text-primary hover:underline">http://www.aboutads.info/choices/</a> or <a href="http://www.youronlinechoices.com" className="text-primary hover:underline">http://www.youronlinechoices.com</a>.
              </p>
            </section>
            
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold wt-header-font text-primary">6. Do Not Track</h2>
              <p>
                Some browsers have a "Do Not Track" feature that lets you tell websites that you do not want to have your online activities tracked. At this time, we do not respond to browser "Do Not Track" signals, but we do provide you the option to opt out of interest-based advertising. To learn more about browser tracking signals and Do Not Track please visit <a href="http://www.allaboutdnt.org" className="text-primary hover:underline">http://www.allaboutdnt.org</a>.
              </p>
            </section>
            
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold wt-header-font text-primary">7. Updates to This Cookie Policy</h2>
              <p>
                We may update this Cookie Policy from time to time in order to reflect, for example, changes to the cookies we use or for other operational, legal, or regulatory reasons. Please therefore revisit this Cookie Policy regularly to stay informed about our use of cookies and related technologies.
              </p>
              <p>
                The date at the top of this Cookie Policy indicates when it was last updated.
              </p>
            </section>
            
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold wt-header-font text-primary">8. Contact Information</h2>
              <p>
                If you have any questions about our use of cookies or other technologies, please contact us at:
              </p>
              
              <div className="mt-6 space-y-2">
                <p className="font-semibold">How to Contact Us:</p>
                <p>Email:</p>
                <p className="pl-4">
                  <a href="mailto:privacy@infiniterunway.io" className="text-primary hover:underline">privacy@infiniterunway.io</a>
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
} 