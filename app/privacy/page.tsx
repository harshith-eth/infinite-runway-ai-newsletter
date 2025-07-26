import React from "react"
import { Header } from "@/components/ui/header"
import { Footer } from "@/components/ui/footer"
import Link from "next/link"

export const metadata = {
  title: "Privacy Policy | Infinite Runway",
  description: "Privacy Policy for Infinite Runway - Learn how we handle and protect your personal information.",
}

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-white">
      <Header />
      
      <main className="flex-grow py-12 px-4 sm:px-6 bg-white">
        <div className="mx-auto w-full max-w-4xl">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold wt-header-font text-primary">Privacy Policy</h1>
            <p className="mt-2 text-sm text-gray-500">Last modified: February 27, 2023</p>
          </div>
          
          {/* Privacy Policy Content */}
          <div className="prose prose-lg max-w-none space-y-6 text-gray-800 wt-body-font">
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold wt-header-font text-primary">1. Introduction</h2>
              <p>
                beehiiv Inc. ("Company," or "we," "our," or "us") respects your privacy, and we are committed to protecting it through our compliance with this policy.
              </p>
              <p>
                This Privacy Policy (our "Privacy Policy") describes the types of information we may collect from you or that you may provide when you visit or use our website located at https://www.beehiiv.com/ (our "Website") and our practices for collecting, using, maintaining, protecting, and disclosing that information. For purposes of this Privacy Policy, our Website and all related services and functionality that we provide through them are referred to as our "Digital Services".
              </p>
              <p>This policy applies to information we collect:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>on our Digital Services;</li>
                <li>in email, text, and other electronic messages between you and our Digital Services;</li>
                <li>when you interact with our advertising and applications on third party websites and services, if those applications or advertising include links to this policy.</li>
              </ul>
              <p>It does not apply to information collected by:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>us offline or through any other means, including on any other website operated by Company or any third party;</li>
                <li>any third party, including through any application or content (including advertising) that may link to or be accessible from or on the Digital Services.</li>
              </ul>
              <p>
                Please read this policy carefully to understand our policies and practices regarding your information and how we will treat it. If you do not agree with our policies and practices, your choice is not to use our Digital Services. By accessing or using our Digital Services, you agree to this Privacy Policy. This Privacy Policy may change from time to time (see, Changes to Our Privacy Policy). Your continued use of our Digital Services after we make changes is deemed to be acceptance of those changes, so please check this Privacy Policy periodically for updates.
              </p>
            </section>
            
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold wt-header-font text-primary">2. Children Under the Age of 16</h2>
              <p>
                Our Digital Services are not intended for children under 16 years of age. No one under age 16 may provide any information to or through the Digital Services. We do not knowingly collect Personal Data from children under 16. If you are under 16, do not use or provide any information on or in our Digital Services or on or through any of their features, including your name, address, telephone number, email address, or any screen name or user name you may use. If we learn we have collected or received Personal Data from a child under 16 without verification of parental consent, we will delete that information. If you believe we might have any information from a child under 16, please contact us at privacy@beehiiv.com.
              </p>
            </section>
            
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold wt-header-font text-primary">3. Information We Collect About You and How We Collect It</h2>
              
              <h3 className="text-xl font-semibold wt-header-font text-gray-800">Generally</h3>
              <p>We collect several types of information from and about users of our Digital Services, specifically information:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>by which you may be personally identified, such as name, postal address, billing address, shipping address, e-mail address, credit or debit card number (for payment purposes only) ("Personal Data");</li>
                <li>that is about you but individually does not identify you, such as traffic data, logs, referring/exit pages, date and time of your visit to or use of our Digital Services, error information, clickstream data, and other communication data and the resources that you access and use on or through our Digital Services; or</li>
                <li>about your Internet connection, the equipment you use to access or use our Digital Services and usage details.</li>
              </ul>
              
              <p>We collect this information:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>directly from you when you provide it to us;</li>
                <li>automatically as you navigate through or use our Digital Services (which may include estimated or precise geo-location, usage details, IP addresses, and information collected through cookies and other tracking technologies); and</li>
                <li>from third parties (e.g., our business partners).</li>
              </ul>
              
              <h3 className="text-xl font-semibold wt-header-font text-gray-800">Information You Provide to Us</h3>
              <p>The information we collect on or through our Digital Services is:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Personal Data such as the data identified above;</li>
                <li>information that you provide by filling in forms on our Digital Services (including information provided (i) at the time of registering to use our Digital Services, (ii) when using our services or other services available through the Digital Services, purchasing products, or requesting further services, or (iii) when you report a problem with our Digital Services);</li>
                <li>records and copies of your correspondence (including email addresses), if you contact us; and</li>
                <li>details of transactions you carry out through our Digital Services and of the fulfillment of your orders (including financial information you are required to provide before placing an order through our Digital Services).</li>
              </ul>
              
              <p>
                You also may provide information to be published or displayed (hereinafter, "posted") on public areas of the Digital Services or transmitted to other users of the Digital Services or third parties (collectively, "User Contributions"). Your User Contributions are posted on and transmitted to others at your own risk. Although we limit access to certain pages, please be aware that no security measures are perfect or impenetrable. Additionally, we cannot control the actions of other users of the Digital Services with whom you may choose to share your User Contributions. Therefore, we cannot and do not guarantee that your User Contributions will not be viewed by unauthorized persons.
              </p>
              
              <h3 className="text-xl font-semibold wt-header-font text-gray-800">Information We Collect Through Automatic Data Collection Technologies</h3>
              <p>
                As you navigate through and interact with our Digital Services, we may use automatic data collection technologies to collect certain information about your equipment, browsing actions, and patterns, specifically:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>details of your visits to our Digital Services, such as traffic data, location, logs, referring/exit pages, date and time of your visit to or use of our Digital Services, error information, clickstream data, and other communication data and the resources that you access and use on or in the Digital Services; and</li>
                <li>information about your computer, mobile device, and Internet connection, specifically your IP address, operating system and browser type.</li>
              </ul>
              
              <p>
                The information we collect automatically may include Personal Data or we may maintain it or associate it with Personal Data we collect in other ways or receive from third parties. It helps us to improve our Digital Services and to deliver a better and more personalized service by enabling us to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>estimate our audience size and usage patterns;</li>
                <li>store information about your preferences, allowing us to customize our Digital Services according to your individual interests; and</li>
                <li>recognize you when you return to our Digital Services.</li>
              </ul>
              
              <p>The technologies we use for this automatic data collection may include:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Cookies.</strong> We and our service providers may use cookies, web beacons, and other technologies to receive and store certain types of information whenever you interact with our Digital Services through your computer or mobile device. A cookie is a small file or piece of data sent from a website and stored on the hard drive of your computer or mobile device. On your computer, you may refuse to accept browser cookies by activating the appropriate setting on your browser, and you may have similar capabilities on your mobile device in the preferences for your operating system or browser. However, if you select this setting you may be unable to access or use certain parts of our Digital Services. Unless you have adjusted your browser or operating system setting so that it will refuse cookies, our system will issue cookies when you direct your browser to our Website.</li>
              </ul>
              
              <table className="min-w-full divide-y divide-gray-200 my-6">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cookie name</th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subprocessor</th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Essential for site functionality</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">__cf_bm</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">Cloudflare</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">Helps manage incoming traffic that matches criteria associated with bots</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">yes</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">cf_clearance</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">Cloudflare</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">Used to provide a CAPTCHA, preventing automated signups.</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">yes</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">language</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">First party</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">Stores the language setting of the visitor</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">yes</td>
                  </tr>
                  {/* More cookie rows would go here */}
                </tbody>
              </table>
              
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Google Analytics.</strong> We use Google Analytics, a web analytics service provided by Google, Inc. ("Google") to collect certain information relating to your use of our Website. Google Analytics uses "cookies", which are text files placed on your computer, to help our Website analyze how users use the site. You can find out more about how Google uses data when you visit our Website by visiting "How Google uses data when you use our partners' sites or apps", (located at www.google.com/policies/privacy/partners/). We may also use Google Analytics Advertising Features or other advertising networks to provide you with interest-based advertising based on your online activity. For more information regarding Google Analytics please visit Google's website, and pages that describe Google Analytics, such as www.google.com/analytics/learn/privacy.html.
                </li>
              </ul>
              
              <h3 className="text-xl font-semibold wt-header-font text-gray-800">Information we collect about you as a subscriber to a newsletter on beehiiv</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Your email address, in order to deliver the newsletter to you</li>
                <li>Metadata about your browser and ip address, including approximate geolocation, in order to prevent fraudulent signups and provide analytics to our publishers about where their readers are.</li>
                <li>Any information you input into a survey form created by the publisher, or a poll you answer.</li>
                <li>What links you click in emails you receive from us</li>
                <li>If you comment on a post on a publication's website, we'll ask for your name to identify you in the discussion.</li>
                <li>If you sign up for a premium (paid) newsletter, we will collect and store your payment information with our payment provider, Stripe. We do not store the raw credit card numbers within our systems.</li>
                <li>If you would like to be deleted from our service, you can submit a request to privacy@beehiiv.com. This will remove you from all newsletters you are subscribed to using the beehiiv platform.</li>
              </ul>
            </section>

            {/* More sections would continue here... */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold wt-header-font text-primary">4. How We Use Your Information</h2>
              <p>We use information that we collect about you or that you provide to us, including any Personal Data:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>to provide our Website and its functionality, contents and services to;</li>
                <li>to provide our products and services to you;</li>
                <li>to provide you with information, products, or services that you request from us or that may be of interest to you;</li>
                <li>to process, fulfill, support, and administer transactions and orders for products and services ordered by you;</li>
                <li>to provide you with notices about your Company account;</li>
                <li>to contact you in response to a request;</li>
                <li>to fulfill any other purpose for which you provide it;</li>
                <li>to carry out our obligations and enforce our rights arising from any contracts entered into between you and us, including for billing and collection;</li>
                <li>to notify you about changes to our Digital Services or any products or services we offer or provide though them;</li>
                <li>in any other way we may describe when you provide the information; and</li>
                <li>for any other purpose with your consent.</li>
              </ul>
              
              <p>
                We may also use your information to contact you about goods and services that may be of interest to you, including through newsletters. If you wish to opt-out of receiving such communications, you may do so at any time by clicking unsubscribe at the bottom of these communications or by visiting your Notification Settings page. For more information, see, Choices About How We Use and Disclose Your Information.
              </p>
            </section>
            
            {/* Additional sections would continue here... */}
            
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold wt-header-font text-primary">13. Contact Information</h2>
              <p>
                If you have any questions, concerns, complaints or suggestions regarding our Privacy Policy or otherwise need to contact us, you may contact us at the contact information below or through the Support page on or in our Digital Services.
              </p>
              
              <div className="mt-6 space-y-2">
                <p className="font-semibold">How to Contact Us:</p>
                <p>Address:</p>
                <p className="pl-4">
                  beehiiv Inc.<br />
                  228 Park Avenue # 2329976<br />
                  New York, New York 10003
                </p>
                
                <p className="mt-4">Email:</p>
                <p className="pl-4">
                  <a href="mailto:privacy@beehiiv.com" className="text-primary hover:underline">privacy@beehiiv.com</a>
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