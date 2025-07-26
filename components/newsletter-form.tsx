"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Check } from "lucide-react"

// Loading dots animation component
const LoadingDots = () => {
  const [dots, setDots] = useState(".")
  
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? "." : prev + ".");
    }, 300);
    return () => clearInterval(interval);
  }, []);
  
  return <span>{dots}</span>;
};

export function NewsletterForm() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // This is critical - prevents page refresh
    
    if (!email || !email.includes('@')) {
      setError("Please enter a valid email address");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call - purely frontend animation
      console.log("Submitting email:", email);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setIsSuccess(true);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Reset form
  const handleReset = () => {
    setEmail("");
    setIsSuccess(false);
    setError("");
  }

  return (
    <div className="w-full">
      {isSuccess ? (
        <div className="bg-white text-[#0618F3] p-4 border-2 border-white flex flex-col items-center">
          <p className="font-medium flex items-center">
            <Check className="mr-2 h-5 w-5 text-green-500" />
            Thanks for subscribing!
          </p>
          <p className="text-sm mt-1">You'll receive our next newsletter in your inbox.</p>
          <button 
            onClick={handleReset}
            className="mt-3 text-sm underline cursor-pointer"
          >
            Reset form
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="group w-full rounded-none bg-transparent">
          <div className="flex flex-col">
            <div className="flex w-full flex-col sm:flex-row items-center overflow-hidden rounded-none">
              <input 
                type="email" 
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email" 
                required 
                className="flex-grow border-2 border-white bg-white px-4 py-3 text-lg text-gray-900 placeholder-gray-500 focus:outline-none w-full sm:w-auto" 
                placeholder="Enter your email" 
                disabled={isSubmitting}
              />
              <button 
                type="submit" 
                disabled={isSubmitting}
                className={`cursor-pointer whitespace-nowrap px-5 py-3 font-semibold text-lg rounded-none font-button border-2 border-white sm:border-l-0 mt-2 sm:mt-0 w-full sm:w-auto min-w-[140px] flex items-center justify-center transition-all duration-300 ease-in-out transform ${
                  isSubmitting ? "bg-yellow-500 text-white" : 
                  "bg-primary text-white hover:bg-blue-700"
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    Submitting<LoadingDots />
                  </span>
                ) : (
                  <span>Join Free →</span>
                )}
              </button>
            </div>
          </div>
          {error && <p className="mt-2 text-red-500 text-sm">{error}</p>}
        </form>
      )}
    </div>
  )
}
