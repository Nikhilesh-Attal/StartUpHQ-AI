// hooks/useUser.ts
"use client"

import { useEffect, useState } from "react"
import { account } from "@/lib/appwrite"
import { Models } from "appwrite"

export function useUser() {
  const [user, setUser] = useState<Models.User<{}> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<any>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await account.get()
        setUser(currentUser)
      } catch (err: any) {
        setUser(null) // Not logged in
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  return { user, loading, error }
}
