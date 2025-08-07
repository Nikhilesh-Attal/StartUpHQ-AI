// app/register-startup/page.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createStartup } from "@/lib/db" // <-- you'll create this function
import { useUser } from "@/hooks/useUser"  // <-- your custom Appwrite hook

export default function RegisterStartupPage() {
  const { user } = useUser()
  const router = useRouter()

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [founderName, setFounderName] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await createStartup({
        userId: user?.$id!,
        name,
        description,
        founderName,
      })

      router.push("/dashboard") // Redirect to snapshot/dashboard
    } catch (err) {
      console.error("Error creating startup:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-xl font-semibold mb-4">Register Your Startup</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Startup Name</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block mb-1">Founder Name</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            value={founderName}
            onChange={(e) => setFounderName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block mb-1">Description</label>
          <textarea
            className="w-full border rounded px-3 py-2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Registering..." : "Register Startup"}
        </button>
      </form>
    </div>
  )
}
