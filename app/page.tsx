"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useBusinessContext } from "@/lib/business-context"
import { useAuth } from "@/contexts/AuthContext"
import { BusinessSelector } from "@/components/business-selector"

export default function Home() {
  const { selectedBusiness } = useBusinessContext()
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/login")
      } else if (selectedBusiness) {
        router.push("/dashboard")
      }
    }
  }, [selectedBusiness, isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  // Show business selector only if authenticated but no business selected
  return <BusinessSelector />
}
