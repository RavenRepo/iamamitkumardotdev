/**
 * Mixpanel Analytics for iamamitkumar.dev
 * 
 * Usage:
 * import { trackPageView, trackCTA, trackExternal } from "@/lib/analytics"
 * 
 * // Auto-capture page views
 * trackPageView()
 * 
 * // Track mailto clicks
 * trackCTA("mailto", { subject: "MVP Sprint", cta_type: "mvp-sprint" })
 * 
 * // Track external product clicks  
 * trackExternal({ product: "vidotask", url: "https://vidotask.com" })
 */

import mixpanel from "mixpanel-browser"

// Initialize Mixpanel
const MP_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN

let mp: typeof mixpanel | null = null

if (typeof window !== "undefined" && MP_TOKEN) {
  mixpanel.init(MP_TOKEN, {
    track_pageview: false, // We handle this manually
    debug: process.env.NODE_ENV === "development",
  })
  mp = mixpanel
}

// Extract UTM params from URL
function getUTMParams(): Record<string, string> {
  if (typeof window === "undefined") return {}
  
  const params = new URLSearchParams(window.location.search)
  return {
    utm_source: params.get("utm_source") || "direct",
    utm_medium: params.get("utm_medium") || "",
    utm_campaign: params.get("utm_campaign") || "",
    utm_content: params.get("utm_content") || "",
  }
}

// Track a page view with UTM attribution
export function trackPageView(pageName?: string) {
  if (!mp) return
  
  const properties = {
    ...getUTMParams(),
    page: pageName || window.location.pathname,
    url: window.location.href,
    referrer: document.referrer,
  }
  
  mp.track("Page View", properties)
}

// Track CTA clicks (mailto links)
export function trackCTA(
  ctaType: string, 
  properties: Record<string, unknown>
) {
  if (!mp) return
  
  mp.track("CTA Click", {
    cta_type: ctaType,
    ...getUTMParams(),
    ...properties,
    url: window.location.href,
  })
}

// Track external product clicks
export function trackExternal(
  product: string,
  url: string
) {
  if (!mp) return
  
  mp.track("External Click", {
    product,
    destination: url,
    ...getUTMParams(),
    url: window.location.href,
  })
}

// Track newsletter signups
export function trackNewsletterSignup(source?: string) {
  if (!mp) return
  
  mp.track("Newsletter Signup", {
    source: source || getUTMParams().utm_source,
    ...getUTMParams(),
  })
}

// Identify users (for email capture later)
export function identifyUser(email: string, properties?: Record<string, unknown>) {
  if (!mp) return
  
  mp.identify(email)
  if (properties) {
    mp.people.set(properties)
  }
}

// Get current UTM params for use in components
export function useUTMParams() {
  return getUTMParams()
}