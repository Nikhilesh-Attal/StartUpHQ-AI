"use client"

import { useEffect, useState } from "react"
import { databases } from "@/lib/appwrite"
import { Query } from "appwrite"
import { useUser } from "@/hooks/useUser"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

// Types for better TypeScript support
interface StartupSnapshot {
  $id: string
  name: string
  description: string
  team: string[]
  owner_name: string
  userId: string
  startupId: string
  $createdAt: string
}

interface PitchDeckDocument {
  $id: string
  $createdAt: string
  slides: Record<string, string>
}

interface LeanCanvasData {
  problem?: string
  customerSegments?: string
  uniqueValueProposition?: string
  solution?: string
  channels?: string
  revenueStreams?: string
  costStructure?: string
  keyMetrics?: string
  unfairAdvantage?: string
  aiSuggestions?: any
}

export default function Dashboard() {
  // Use the same environment variables as in db.ts
  const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID
  const SNAPSHOT_COLLECTION = process.env.NEXT_PUBLIC_APPWRITE_STARTUP_SNAPSHOT_COLLECTION_ID
  const PITCH_DECK_COLLECTION = process.env.NEXT_PUBLIC_APPWRITE_PITCH_COLLECTION_ID

  const { user } = useUser()
  const [startup, setStartup] = useState<StartupSnapshot | null>(null)
  const [pitchDecks, setPitchDecks] = useState<PitchDeckDocument[]>([])
  const [leanCanvas, setLeanCanvas] = useState<LeanCanvasData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    if (!user?.$id) {
      //console.log("🔍 Dashboard: No user ID available");
      setLoading(false)
      return
    }

    //console.log("🔍 Dashboard: Starting fetch with user:", user.$id);
    setLoading(true)
    setError(null)

    try {
      // First, get the user's startup snapshot
      //console.log("🔍 Dashboard: Fetching startup snapshot...");
      const startupRes = await databases.listDocuments(DB_ID!, SNAPSHOT_COLLECTION!, [
        Query.equal("userId", user.$id),
        Query.limit(100),
      ])

      // console.log("🔍 Dashboard: Startup response:", {
      //   total: startupRes.total,
      //   documents: startupRes.documents
      // });

      if (startupRes.total > 0) {
        const startupData = startupRes.documents[0] as StartupSnapshot
        // console.log("🔍 Dashboard: Found startup data:", {
        //   name: startupData.name,
        //   startupId: startupData.startupId,
        //   userId: startupData.userId
        // });
        setStartup(startupData)

        // Now fetch pitch deck and lean canvas using the startup ID from the snapshot
        try {
          // console.log("🔍 Dashboard: Fetching pitch deck with params:", {
          //   DB_ID: DB_ID,
          //   PITCH_DECK_COLLECTION: PITCH_DECK_COLLECTION,
          //   startupId: startupData.startupId,
          //   userId: user.$id
          // });

          const pitchDeckRes = await databases.listDocuments(DB_ID!, PITCH_DECK_COLLECTION!, [
            Query.equal("startupId", startupData.startupId),
            Query.equal("userId", user.$id),
            Query.orderDesc("$createdAt"),
            Query.limit(100),
          ]);

          // console.log("🔍 Dashboard: Pitch deck response:", {
          //   total: pitchDeckRes.total,
          //   documents: pitchDeckRes.documents
          // });

          // Process pitch deck
          if (pitchDeckRes.total > 0) {
            const parsedPitchDecks = [];

            for (const doc of pitchDeckRes.documents) {
              try {
                const slides = JSON.parse(doc.slides_json || "{}");
                parsedPitchDecks.push({
                  $id: doc.$id,
                  $createdAt: doc.$createdAt,
                  slides: slides,
                });
              } catch (err) {
                console.error(`❌ Error parsing slides_json for doc ${doc.$id}:`, err);
              }
            }

            //console.log("✅ Dashboard: All parsed pitch decks:", parsedPitchDecks);
            setPitchDecks(parsedPitchDecks);
          } else {
            console.log("🔍 Dashboard: No pitch deck documents found");
            setPitchDecks([]);
          }

          // Also fetch lean canvas
          const leanCanvasRes = await databases.listDocuments(DB_ID!, process.env.NEXT_PUBLIC_APPWRITE_CANVAS_COLLECTION_ID!, [
            Query.equal("startupId", startupData.startupId),
            Query.equal("userId", user.$id),
            Query.orderDesc("$createdAt"),
            Query.limit(100),
          ])

          // console.log("🔍 Dashboard: Lean canvas response:", {
          //   total: leanCanvasRes.total,
          //   documents: leanCanvasRes.documents
          // });

          // Process lean canvas
          if (leanCanvasRes.total > 0) {
            try {
              const canvasData = JSON.parse(leanCanvasRes.documents[0].canvas_json || "{}")
              setLeanCanvas(canvasData)
            } catch (err) {
              console.error("Error parsing lean canvas JSON:", err)
              setLeanCanvas(null)
            }
          }
        } catch (fetchErr) {
          console.error("🔍 Dashboard: Error fetching additional data:", fetchErr)
          // Don't set error for additional data failure, just continue without it
        }
      } else {
        console.log("🔍 Dashboard: No startup snapshot found");
        setStartup(null)
      }
    } catch (err: any) {
      console.error("🔍 Dashboard: Error fetching startup data:", err)
      setError("Failed to fetch startup data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Fetch data on component mount
  useEffect(() => {
    fetchData()
    
    // Refresh data when window gains focus
    const handleFocus = () => fetchData()
    window.addEventListener("focus", handleFocus)
    
    return () => {
      window.removeEventListener("focus", handleFocus)
    }
  }, [user?.$id])

  // Render pitch deck content as informational cards
  const renderPitchDeckContent = () => {
    //console.log("Dashboard pitch deck data:", pitchDecks);
    
    // Check if pitchDecks array is empty
    if (!pitchDecks || pitchDecks.length === 0) {
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h4 className="font-medium text-yellow-800 mb-2">No Pitch Deck Created Yet</h4>
          <p className="text-yellow-600 mb-4">Start building your pitch deck to showcase your startup story and business model.</p>
          <Link 
            href="/pitch-deck" 
            className="inline-block px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
          >
            Create Your Pitch Deck
          </Link>
        </div>
      )
    }

    const slideOrder = [
      'problem',
      'solution', 
      'market',
      'product',
      'traction',
      'business_model',
      'competition',
      'team',
      'financials',
      'funding'
    ]

    const getSlideTitle = (key: string) => {
      const titles: Record<string, string> = {
        problem: '🎯 Problem',
        solution: '💡 Solution', 
        market: '📈 Market',
        product: '🚀 Product',
        traction: '📊 Traction',
        business_model: '💰 Business Model',
        competition: '⚔️ Competition',
        team: '👥 Team',
        financials: '💹 Financials',
        funding: '💵 Funding'
      }
      return titles[key] || `📄 ${key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}`
    }

    return (
      <div className="space-y-6">
        {/* Header showing total versions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 font-medium">
            📚 {pitchDecks.length} Pitch Deck Version{pitchDecks.length > 1 ? 's' : ''} Found
          </p>
          <p className="text-blue-600 text-sm mt-1">
            All your pitch deck iterations are shown below, ordered by most recent first.
          </p>
        </div>

        {/* Show all pitch deck versions */}
        {pitchDecks.map((deckVersion, versionIndex) => {
          const slides = deckVersion.slides;
          
          // Skip if no slides content
          if (!slides || Object.keys(slides).length === 0) {
            return (
              <div key={deckVersion.$id} className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-600">
                    Version {versionIndex + 1} (Empty)
                  </h3>
                  <span className="text-sm text-gray-500">
                    {new Date(deckVersion.$createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-500 italic">This version contains no slide content.</p>
              </div>
            )
          }

          // Sort slides by predefined order, then add any extra slides
          const sortedSlides = slideOrder
            .filter(key => slides[key])
            .map(key => [key, slides[key]])
            .concat(
              Object.entries(slides).filter(([key]) => !slideOrder.includes(key))
            )

          return (
            <div key={deckVersion.$id} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Version Header */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    📊 Version {versionIndex + 1}
                    {versionIndex === 0 && (
                      <span className="ml-2 bg-green-500 text-xs px-2 py-1 rounded-full">Latest</span>
                    )}
                  </h3>
                  <div className="text-right">
                    <p className="text-sm opacity-90">
                      Created: {new Date(deckVersion.$createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs opacity-75">
                      ID: {deckVersion.$id.slice(-8)}...
                    </p>
                  </div>
                </div>
                <p className="text-sm opacity-90 mt-2">
                  {sortedSlides.length} slides completed
                </p>
              </div>

              {/* Slides Grid */}
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sortedSlides.map(([section, content], slideIndex) => (
                    <div key={`${deckVersion.$id}-${section}`} className="bg-white border rounded-lg p-4 hover:shadow-md transition">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900">
                          {getSlideTitle(section)}
                        </h4>
                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                          Slide {slideIndex + 1}
                        </span>
                      </div>
                      <div className="text-gray-700 text-sm leading-relaxed">
                        {content.length > 150 ? (
                          <>
                            {content.substring(0, 150)}...
                            <button className="text-blue-600 hover:text-blue-700 ml-1 text-xs">
                              read more
                            </button>
                          </>
                        ) : (
                          content
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
        
        {/* Action Button */}
        <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div>
            <p className="font-medium text-blue-900">
              Total: {pitchDecks.length} version{pitchDecks.length > 1 ? 's' : ''} of your pitch deck
            </p>
            <p className="text-blue-600 text-sm">
              Ready to present to investors or create a new version
            </p>
          </div>
          <Link 
            href="/pitch-deck" 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Create New Version
          </Link>
        </div>
      </div>
    )
  }

  // Render lean canvas content as structured business model
  const renderLeanCanvasContent = () => {
    if (!leanCanvas) {
      return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h4 className="font-medium text-blue-800 mb-2">No Lean Canvas Created Yet</h4>
          <p className="text-blue-600 mb-4">Build your lean canvas to validate and structure your business model.</p>
          <Link 
            href={`/lean-canvas?startupId=${startup?.startupId}`}
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Create Lean Canvas
          </Link>
        </div>
      )
    }

    const canvasSections = [
      { 
        key: 'problem', 
        name: '🎯 Problem',
        description: 'What problems are you solving?',
        bgColor: 'bg-red-50 border-red-200',
        textColor: 'text-red-800'
      },
      { 
        key: 'customerSegments', 
        name: '👥 Customer Segments',
        description: 'Who are your customers?',
        bgColor: 'bg-purple-50 border-purple-200',
        textColor: 'text-purple-800'
      },
      { 
        key: 'uniqueValueProposition', 
        name: '💎 Value Proposition',
        description: 'What makes you unique?',
        bgColor: 'bg-green-50 border-green-200',
        textColor: 'text-green-800'
      },
      { 
        key: 'solution', 
        name: '💡 Solution',
        description: 'How do you solve the problem?',
        bgColor: 'bg-blue-50 border-blue-200',
        textColor: 'text-blue-800'
      },
      { 
        key: 'channels', 
        name: '📢 Channels',
        description: 'How do you reach customers?',
        bgColor: 'bg-orange-50 border-orange-200',
        textColor: 'text-orange-800'
      },
      { 
        key: 'revenueStreams', 
        name: '💰 Revenue Streams',
        description: 'How do you make money?',
        bgColor: 'bg-emerald-50 border-emerald-200',
        textColor: 'text-emerald-800'
      },
      { 
        key: 'costStructure', 
        name: '💸 Cost Structure',
        description: 'What are your main costs?',
        bgColor: 'bg-rose-50 border-rose-200',
        textColor: 'text-rose-800'
      },
      { 
        key: 'keyMetrics', 
        name: '📊 Key Metrics',
        description: 'How do you measure success?',
        bgColor: 'bg-indigo-50 border-indigo-200',
        textColor: 'text-indigo-800'
      },
      { 
        key: 'unfairAdvantage', 
        name: '🏆 Unfair Advantage',
        description: 'What can\'t be copied?',
        bgColor: 'bg-yellow-50 border-yellow-200',
        textColor: 'text-yellow-800'
      }
    ]

    const completedSections = canvasSections.filter(section => 
      leanCanvas[section.key as keyof LeanCanvasData]?.trim()
    ).length

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {canvasSections.map((section) => {
            const content = leanCanvas[section.key as keyof LeanCanvasData]
            const isEmpty = !content?.trim()
            
            return (
              <div
                key={section.key}
                className={`border rounded-lg p-4 ${
                  isEmpty 
                    ? 'bg-gray-50 border-gray-200' 
                    : `${section.bgColor} border`
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`font-semibold ${isEmpty ? 'text-gray-500' : section.textColor}`}>
                    {section.name}
                  </h3>
                  {!isEmpty && (
                    <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
                      ✓
                    </span>
                  )}
                </div>
                
                <p className="text-xs text-gray-600 mb-2">
                  {section.description}
                </p>
                
                {isEmpty ? (
                  <p className="text-gray-400 text-sm italic">
                    Not filled yet
                  </p>
                ) : (
                  <div className={`text-sm ${isEmpty ? 'text-gray-500' : section.textColor.replace('800', '700')}`}>
                    {content.length > 150 ? (
                      <>
                        {content.substring(0, 150)}...
                        <button className="text-blue-600 hover:text-blue-700 ml-1 text-xs">
                          expand
                        </button>
                      </>
                    ) : (
                      content
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
        
        <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-4">
          <div>
            <p className="font-medium text-green-900">
              {completedSections} of {canvasSections.length} sections completed
            </p>
            <div className="flex items-center mt-1">
              <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${(completedSections / canvasSections.length) * 100}%` }}
                />
              </div>
              <span className="text-green-600 text-sm">
                {Math.round((completedSections / canvasSections.length) * 100)}%
              </span>
            </div>
          </div>
          <Link 
            href={`/lean-canvas?startupId=${startup?.startupId}`}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            {completedSections === 0 ? 'Start Canvas' : 'Edit Canvas'}
          </Link>
        </div>
      </div>
    )
  }

  // Loading state
  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
        <p className="mt-4 text-gray-600">Loading your startup dashboard...</p>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-semibold">Error</h3>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={fetchData} 
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // No startup found
  if (!startup) {
    return (
      <div className="p-6">
        <div className="text-center space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-blue-900 mb-2">Welcome to Your Startup Journey!</h2>
            <p className="text-blue-700 mb-4">You haven't registered your startup yet. Let's get started!</p>
            <Link 
              href='/register-startup' 
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Register Your Startup
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {startup.name}
        </h1>
        <p className="text-lg text-gray-600">
          Founded by <span className="font-medium text-gray-800">{startup.owner_name}</span>
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 mb-8">
        {/* Startup Overview */}
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <span className="mr-2">🚀</span>
            Startup Overview
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Description</label>
              <p className="text-gray-800 mt-1">{startup.description}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Founder</label>
              <p className="text-gray-800 mt-1">{startup.owner_name}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Created</label>
              <p className="text-gray-600 mt-1">
                {new Date(startup.$createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>

          {startup.team && startup.team.length > 0 && (
            <div className="mt-4">
              <label className="text-sm font-medium text-gray-500">Team Members</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {startup.team.map((member, index) => (
                  <div key={index} className="bg-blue-100 rounded-full px-3 py-1 text-sm text-blue-800">
                    {member}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pitch Deck Content */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 flex items-center">
          <span className="mr-2">📊</span>
          Pitch Deck Content
        </h2>
        {renderPitchDeckContent()}
      </div>

      {/* Lean Canvas Content */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 flex items-center">
          <span className="mr-2">📋</span>
          Lean Canvas
        </h2>
        {renderLeanCanvasContent()}
      </div>

      {/* Quick Actions */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link 
            href={`/lean-canvas?startupId=${startup.startupId}`}
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition text-center"
          >
            <div className="text-2xl mb-2">📋</div>
            <div className="text-sm font-medium">Lean Canvas</div>
          </Link>
          
          <Link 
            href="/pitch-deck" 
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition text-center"
          >
            <div className="text-2xl mb-2">📊</div>
            <div className="text-sm font-medium">Pitch Deck</div>
          </Link>
          
          <Link 
            href="/validation" 
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition text-center"
          >
            <div className="text-2xl mb-2">✅</div>
            <div className="text-sm font-medium">Validation</div>
          </Link>
          
          <Link 
            href="/roadmap" 
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition text-center"
          >
            <div className="text-2xl mb-2">🗺️</div>
            <div className="text-sm font-medium">Roadmap</div>
          </Link>
        </div>
      </div>
    </div>
  )
}