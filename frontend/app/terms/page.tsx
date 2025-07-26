import React from "react"
import { Header } from "@/components/ui/header"
import { Footer } from "@/components/ui/footer"
import Link from "next/link"

export const metadata = {
  title: "Terms of Use | Infinite Runway",
  description: "Terms of Use for Infinite Runway - Please read our terms and conditions carefully before using our services.",
}

export default function TermsOfUse() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-white">
      <Header />
      
      <main className="flex-grow py-12 px-4 sm:px-6 bg-white">
        <div className="mx-auto w-full max-w-4xl">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold wt-header-font text-primary">Terms of Use</h1>
            <p className="mt-2 text-sm text-gray-500">Last updated: May 15, 2024</p>
          </div>
          
          {/* Terms of Use Content */}
          <div className="prose prose-lg max-w-none space-y-6 text-gray-800 wt-body-font">
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold wt-header-font text-primary">Acceptance of the Terms of Use</h2>
              <p>
                These terms of use are entered into by and between you ("you" or "your") and beehiiv Inc. ( "we," "us" or "our"). The following terms and conditions, together with any documents they expressly incorporate by reference (collectively, "Terms of Use"), govern your access to and use of our products, functionality and services, including without limitation, those provided through https://www.beehiiv.com/ (collectively, "beehiiv"), whether as a guest or a registered user.
              </p>
              <p>
                Please read the Terms of Use carefully before you start to use beehiiv. By using beehiiv, you accept and agree to be bound and abide by these Terms of Use, our Publisher Agreement (if applicable) and our Privacy Policy, found at beehiiv.com/privacy incorporated herein by reference. If you do not want to agree to the foregoing, you must not access or use beehiiv.
              </p>
              <p>
                beehiiv is offered and available to users who are 16 years of age or older. By using beehiiv, you represent and warrant that you are of legal age to form a binding contract with us and meet all of the foregoing eligibility requirements. If you do not meet all of these requirements, you must not access or use beehiiv.
              </p>
            </section>
            
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold wt-header-font text-primary">Changes to the Terms of Use</h2>
              <p>
                We may revise and update these Terms of Use from time to time in our sole discretion. All changes are effective immediately when we post them, and apply to all access to and use of beehiiv thereafter.
              </p>
              <p>
                Your continued use of beehiiv following the posting of revised Terms of Use means that you accept and agree to the changes. You are expected to check this page from time to time so you are aware of any changes, as they are binding on you.
              </p>
            </section>
            
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold wt-header-font text-primary">Accessing beehiiv and Account Security</h2>
              <p>
                We reserve the right to change any service or functionality we provide on beehiiv, in our sole discretion without notice. We will not be liable if for any reason all or any part of beehiiv is unavailable at any time or for any period. From time to time, we may restrict access to some parts of beehiiv to users, including registered users.
              </p>
              <p>You are responsible for both:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Making all arrangements necessary for you to have access to beehiiv.</li>
                <li>Ensuring that all persons who access beehiiv through your internet connection are aware of these Terms of Use and comply with them.</li>
              </ul>
              <p>
                To access beehiiv or some of the resources it offers, you may be asked to provide certain registration details or other information. It is a condition of your use of beehiiv that all the information you provide on beehiiv is correct, current, and complete. You agree that all information you provide to register with beehiiv or otherwise, including, but not limited to, through the use of any interactive features on beehiiv, is governed by our Privacy Policy, and you consent to all actions we take with respect to your information consistent with our Privacy Policy.
              </p>
              <p>
                If you choose, or are provided with, a user name, password, or any other piece of information as part of our security procedures, you must treat such information as confidential, and you must not disclose it to any other person or entity. You also acknowledge that your account is personal to you and agree not to provide any other person with access to beehiiv or portions of it using your user name, password, or other security information. You agree to notify us immediately of any unauthorized access to or use of your user name or password or any other breach of security. You also agree to ensure that you exit from your account at the end of each session. You should use particular caution when accessing your account from a public or shared computer so that others are not able to view or record your password or other personal information.
              </p>
              <p>
                We have the right to disable any user name, password, or other identifier, whether chosen by you or provided by us, at any time in our sole discretion for any or no reason, including if, in our opinion, you have violated any provision of these Terms of Use.
              </p>
            </section>
            
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold wt-header-font text-primary">Intellectual Property Rights</h2>
              <p>
                beehiiv's trademarks, logos, intellectual property, content, features, and functionality (including but not limited to all information, software, text, displays, images, video, and audio, and the design, selection, and arrangement thereof) are owned by beehiiv, its licensors, or other providers of such content and are protected by United States and international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
              </p>
            </section>
            
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold wt-header-font text-primary">Content Standards</h2>
              <p>
                The following content standards (the "Content Standards") apply to any and all content published to beehiiv (including without limitation, content published on a Boosts campaign). Content must in their entirety comply with all applicable federal, state, local, and international laws and regulations. Without limiting the foregoing, content must not:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Contain any material that is defamatory, obscene, indecent, abusive, offensive, harassing, violent, hateful, inflammatory, or otherwise objectionable, or that could reasonably incite violence based on protected classes.</li>
                <li>Promote harmful or illegal activities, including material that advocates, threatens, or shows you causing harm to yourself, other people, or animals.</li>
                <li>Publish any material that was written or created by someone else and claim it as your own.</li>
                <li>Promote sexually explicit or pornographic material.</li>
                <li>Infringe any patent, trademark, trade secret, copyright, or other intellectual property or other rights of any other person.</li>
                <li>Violate the legal rights of others or contain any material that could give rise to any civil or criminal liability.</li>
                <li>Be likely to deceive any person.</li>
                <li>Promote any illegal activity, or advocate, promote, or assist any unlawful act.</li>
                <li>Impersonate any person, brand, organization or entity, or misrepresent your identity or affiliation.</li>
                <li>Give the impression that they emanate from or are endorsed by us or any other person or entity, if this is not the case.</li>
                <li>Publish or post, threaten to publish or post, or incentivize others to publish or post, other people's private information without their express authorization and permission.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold wt-header-font text-primary">Copyright Infringement</h2>
              <p>
                We take claims of copyright infringement seriously. We will respond to notices of alleged copyright infringement that comply with applicable law. If you believe any content accessible on or from beehiiv infringe your copyright, you may request removal of such content (or access to them) from beehiiv by submitting written notification to our copyright agent designated below.
              </p>
              <p>In accordance with the Online Copyright Infringement Liability Limitation Act of the Digital Millennium Copyright Act (17 U.S.C. § 512) ("DMCA"), the written notice (the "DMCA Notice") must include substantially the following:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Your physical or electronic signature.</li>
                <li>Identification of the copyrighted work you believe to have been infringed or, if the claim involves multiple works on beehiiv, a representative list of such works.</li>
                <li>Identification of the content you believe to be infringing in a sufficiently precise manner to allow us to locate that content.</li>
                <li>Adequate information by which we can contact you (including your name, postal address, telephone number, and, if available, email address).</li>
                <li>A statement that you have a good faith belief that use of the copyrighted content is not authorized by the copyright owner, its agent, or the law.</li>
                <li>A statement that the information in the written notice is accurate.</li>
                <li>A statement, under penalty of perjury, that you are authorized to act on behalf of the copyright owner.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold wt-header-font text-primary">Disclaimer of Warranties</h2>
              <p>
                You understand that we cannot and do not guarantee or warrant that files available for downloading from the internet or beehiiv will be free of viruses or other destructive code. You are responsible for implementing sufficient procedures and checkpoints to satisfy your particular requirements for anti-virus protection and accuracy of data input and output, and for maintaining a means external to beehiiv for any reconstruction of any lost data.
              </p>
              <p className="font-semibold">
                TO THE FULLEST EXTENT PROVIDED BY LAW, WE WILL NOT BE LIABLE FOR ANY LOSS OR DAMAGE CAUSED BY A DISTRIBUTED DENIAL-OF-SERVICE ATTACK, VIRUSES, OR OTHER TECHNOLOGICALLY HARMFUL MATERIAL THAT MAY INFECT YOUR COMPUTER EQUIPMENT, COMPUTER PROGRAMS, DATA, OR OTHER PROPRIETARY MATERIAL DUE TO YOUR USE OF BEEHIIV OR ANY SERVICES OR ITEMS OBTAINED THROUGH BEEHIIV OR TO YOUR DOWNLOADING OF ANY CONTENT PUBLISHED ON IT, OR ON ANY WEBSITE LINKED TO IT.
              </p>
              <p className="font-semibold">
                YOUR USE OF BEEHIIV, ITS CONTENT, AND ANY SERVICES OR ITEMS OBTAINED THROUGH BEEHIIV IS AT YOUR OWN RISK. BEEHIIV, ITS CONTENT, AND ANY SERVICES OR ITEMS OBTAINED THROUGH BEEHIIV ARE PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS, WITHOUT ANY WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold wt-header-font text-primary">Limitation on Liability</h2>
              <p className="font-semibold">
                TO THE FULLEST EXTENT PROVIDED BY LAW, IN NO EVENT WILL WE, OUR AFFILIATES, OR OUR OR THEIR LICENSORS, SERVICE PROVIDERS, EMPLOYEES, AGENTS, OFFICERS, OR DIRECTORS BE LIABLE FOR DAMAGES OF ANY KIND, UNDER ANY LEGAL THEORY, ARISING OUT OF OR IN CONNECTION WITH YOUR USE, OR INABILITY TO USE, BEEHIIV, ANY WEBSITES LINKED TO IT, OR ANY CONTENT ON BEEHIIV.
              </p>
              <p>
                The limitation of liability set out above does not apply to liability resulting from our gross negligence or willful misconduct.
              </p>
              <p className="font-semibold">
                THE FOREGOING DOES NOT AFFECT ANY LIABILITY THAT CANNOT BE EXCLUDED OR LIMITED UNDER APPLICABLE LAW.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold wt-header-font text-primary">Contact Information</h2>
              <p>
                beehiiv is operated by:
              </p>
              <div className="mt-6 space-y-2">
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
              <p className="mt-4">
                All other feedback, comments, requests for technical support, and other communications relating to beehiiv should be directed to: privacy@beehiiv.com.
              </p>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
} 