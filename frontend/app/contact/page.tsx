"use client"

import React, { useState } from "react"
import { Header } from "@/components/ui/header"
import { Footer } from "@/components/ui/footer"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Send } from "lucide-react"

export default function ContactPage() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formState.name || !formState.email || !formState.message) {
      setError("Please fill out all fields")
      return
    }
    
    setIsSubmitting(true)
    setError("")
    
    try {
      // This would be replaced with your Resend implementation
      console.log("Form data:", formState)
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))
      
      setIsSuccess(true)
      setFormState({
        name: "",
        email: "",
        message: ""
      })
    } catch (err) {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormState(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-wt-background">
      <Header />
      
      <main className="flex-grow py-12 px-4 sm:px-6" style={{ backgroundColor: "#0019fd" }}>
        <div className="mx-auto w-full max-w-4xl">
          {/* Page Title */}
          <div className="mb-12 text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">Contact Us</h1>
            <p className="mt-2 text-white/80">We'd love to hear from you</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
            {/* Contact Info */}
            <div className="md:col-span-5">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold text-white mb-4">Get In Touch</h2>
                  <p className="text-white/90">
                    Have questions, feedback, or want to collaborate? Drop us a message using the form 
                    or reach out via email.
                  </p>
                </div>
                
                <div className="flex items-start space-x-3 mt-8">
                  <Mail className="h-5 w-5 text-white mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-white">Email Us</h3>
                    <a 
                      href="mailto:hello@infiniterunway.com" 
                      className="text-white/90 hover:text-white transition-colors"
                    >
                      hello@infiniterunway.com
                    </a>
                  </div>
                </div>
                
                <div className="border-2 border-white p-6 mt-8">
                  <h3 className="text-lg font-semibold text-white mb-2">Office Hours</h3>
                  <p className="text-white/90">
                    Monday – Friday<br />
                    9:00 AM – 5:00 PM PST
                  </p>
                </div>
              </div>
            </div>
            
            {/* Contact Form */}
            <div className="md:col-span-7">
              {isSuccess ? (
                <div className="bg-white text-blue-700 p-8 border-2 border-white">
                  <h3 className="text-xl font-semibold mb-4">Message Sent!</h3>
                  <p className="mb-4">Thank you for reaching out. We'll get back to you as soon as possible.</p>
                  <button 
                    onClick={() => setIsSuccess(false)}
                    className="bg-blue-700 text-white px-6 py-3 font-medium hover:bg-blue-800 transition-colors"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <div className="border-2 border-white p-6 sm:p-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block text-white font-medium mb-2">
                        Name
                      </label>
                      <Input
                        id="name"
                        name="name"
                        value={formState.name}
                        onChange={handleChange}
                        className="bg-white text-black border-2 border-white rounded-none text-base focus-visible:ring-white focus-visible:ring-offset-blue-700 w-full"
                        placeholder="Your full name"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-white font-medium mb-2">
                        Email
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formState.email}
                        onChange={handleChange}
                        className="bg-white text-black border-2 border-white rounded-none text-base focus-visible:ring-white focus-visible:ring-offset-blue-700 w-full"
                        placeholder="Your email address"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="message" className="block text-white font-medium mb-2">
                        Message
                      </label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formState.message}
                        onChange={handleChange}
                        className="bg-white text-black border-2 border-white rounded-none min-h-[150px] text-base focus-visible:ring-white focus-visible:ring-offset-blue-700 w-full"
                        placeholder="Your message"
                      />
                    </div>
                    
                    {error && (
                      <div className="text-red-300 text-sm">{error}</div>
                    )}
                    
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center justify-center bg-white text-blue-700 px-6 py-3 font-medium hover:bg-white/90 transition-colors border-2 border-white w-full"
                      >
                        {isSubmitting ? (
                          "Sending..."
                        ) : (
                          <>
                            Send Message <Send className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
} 