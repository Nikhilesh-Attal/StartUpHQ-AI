'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Loader, Sparkles, Save, Plus, Check, Copy } from 'lucide-react'

// Simplified interfaces to avoid potential type issues
interface CanvasSection {
  name: string
  key: string
  description: string
  aiPrompt: string
  placeholder: string
}

interface AISuggestion {
  section: string
  suggestion: string
  reasoning?: string
  timestamp: string
  applied: boolean
}

const CANVAS_SECTIONS: CanvasSection[] = [
  {
    name: 'Problem',
    key: 'problem',
    description: 'What problem are you solving? List the top 1-3 problems.',
    aiPrompt: 'Help me identify and articulate the key problems my startup solves.',
    placeholder: 'Describe the main problems your target customers face...'
  },
  {
    name: 'Customer Segments',
    key: 'customerSegments',
    description: 'Who are your target customers? Be specific.',
    aiPrompt: 'Help me define and segment my target customers.',
    placeholder: 'Define your target customer segments...'
  },
  {
    name: 'Unique Value Proposition',
    key: 'uniqueValueProposition',
    description: 'What makes you different? Your single, clear message.',
    aiPrompt: 'Help me craft a compelling unique value proposition.',
    placeholder: 'What unique value do you provide to customers?...'
  },
  {
    name: 'Solution',
    key: 'solution',
    description: 'How do you solve the problem? List your top features.',
    aiPrompt: 'Help me define the solution features.',
    placeholder: 'Describe your solution and key features...'
  },
  {
    name: 'Channels',
    key: 'channels',
    description: 'How do you reach your customers?',
    aiPrompt: 'Suggest effective channels to reach customers.',
    placeholder: 'List your marketing and distribution channels...'
  },
  {
    name: 'Revenue Streams',
    key: 'revenueStreams',
    description: 'How do you make money?',
    aiPrompt: 'Help me identify potential revenue streams.',
    placeholder: 'How will you generate revenue?...'
  },
  {
    name: 'Cost Structure',
    key: 'costStructure',
    description: 'What are your major costs?',
    aiPrompt: 'Help me identify key cost drivers.',
    placeholder: 'List your main costs and expenses...'
  },
  {
    name: 'Key Metrics',
    key: 'keyMetrics',
    description: 'How do you measure success?',
    aiPrompt: 'Suggest key metrics and KPIs to track.',
    placeholder: 'What metrics will you track?...'
  },
  {
    name: 'Unfair Advantage',
    key: 'unfairAdvantage',
    description: 'What can\'t be easily copied or bought?',
    aiPrompt: 'Help me identify my unfair advantage.',
    placeholder: 'What is your unfair advantage?...'
  }
]

export default function LeanCanvasPage() {
  const searchParams = useSearchParams()
  const startupId = searchParams?.get('startupId') || ''
  
  // Simplified state management
  const [canvasData, setCanvasData] = useState<Record<string, string>>({})
  const [version, setVersion] = useState<string>('v1')
  const [availableVersions, setAvailableVersions] = useState<string[]>(['v1'])
  const [loading, setLoading] = useState<boolean>(false)
  const [saving, setSaving] = useState<boolean>(false)
  const [aiSuggestions, setAISuggestions] = useState<Record<string, AISuggestion[]>>({})
  const [loadingAI, setLoadingAI] = useState<Record<string, boolean>>({})
  const [startupInfo, setStartupInfo] = useState<any>(null)
  const [copiedSuggestion, setCopiedSuggestion] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)

  // Mock user for testing - replace with your actual useUser hook
  useEffect(() => {
    // Temporary mock user - replace this with your actual user logic
    setUser({ $id: 'test-user-id' })
  }, [])

  // Load startup information with error handling
  useEffect(() => {
    if (!startupId || !user?.$id) return

    const loadStartupInfo = async () => {
      try {
        // Mock startup info for testing - replace with actual API call
        setStartupInfo({
          name: 'Test Startup',
          description: 'A test startup for lean canvas',
          owner_name: 'Test Owner'
        })
      } catch (error) {
        console.error('Failed to load startup info:', error)
        // Set fallback data
        setStartupInfo({
          name: 'My Startup',
          description: 'Startup description',
          owner_name: 'Owner'
        })
      }
    }

    loadStartupInfo()
  }, [startupId, user?.$id])

  // Load canvas data with error handling
  useEffect(() => {
    if (!startupId || !version) return

    const loadCanvas = async () => {
      setLoading(true)
      try {
        // Mock canvas loading - replace with actual API call
        const mockData = {
          problem: 'Sample problem description',
          customerSegments: 'Sample customer segments'
        }
        setCanvasData(mockData)
      } catch (error) {
        console.error('Failed to load canvas:', error)
        setCanvasData({})
      } finally {
        setLoading(false)
      }
    }

    loadCanvas()
  }, [startupId, version])

  // Load available versions with error handling
  useEffect(() => {
    const fetchVersions = async () => {
      try {
        if (!startupId || !user?.$id) return
        
        // Mock versions - replace with actual API call
        setAvailableVersions(['v1', 'v2', 'beta'])
      } catch (err) {
        console.error('Failed to fetch versions', err)
        setAvailableVersions(['v1'])
      }
    }

    if (user?.$id) {
      fetchVersions()
    }
  }, [startupId, user?.$id])

  // Get AI suggestions with error handling
  const getAISuggestions = async (section: CanvasSection) => {
    if (!startupInfo) return

    setLoadingAI(prev => ({ ...prev, [section.key]: true }))
    
    try {
      const context = `
        Startup Name: ${startupInfo.name}
        Description: ${startupInfo.description}
        Founder: ${startupInfo.owner_name}
      `

      const previousSuggestions = aiSuggestions[section.key]?.map(s => s.suggestion) || []

      const response = await fetch('/api/ai-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          section: section.name,
          context: context,
          existingContent: canvasData[section.key] || '',
          previousAttempts: previousSuggestions
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const newSuggestion: AISuggestion = {
          section: section.key,
          suggestion: data.suggestion,
          reasoning: data.reasoning,
          timestamp: new Date().toISOString(),
          applied: false
        }

        setAISuggestions(prev => ({
          ...prev,
          [section.key]: [newSuggestion, ...(prev[section.key] || [])].slice(0, 5)
        }))
      } else {
        console.error('Failed to get AI suggestions:', await response.text())
        // Add mock suggestion for testing
        const mockSuggestion: AISuggestion = {
          section: section.key,
          suggestion: `Sample AI suggestion for ${section.name}`,
          reasoning: 'This is a test suggestion',
          timestamp: new Date().toISOString(),
          applied: false
        }
        setAISuggestions(prev => ({
          ...prev,
          [section.key]: [mockSuggestion]
        }))
      }
    } catch (error) {
      console.error('Failed to get AI suggestions:', error)
      // Add mock suggestion for testing
      const mockSuggestion: AISuggestion = {
        section: section.key,
        suggestion: `Sample AI suggestion for ${section.name}`,
        reasoning: 'This is a test suggestion',
        timestamp: new Date().toISOString(),
        applied: false
      }
      setAISuggestions(prev => ({
        ...prev,
        [section.key]: [mockSuggestion]
      }))
    } finally {
      setLoadingAI(prev => ({ ...prev, [section.key]: false }))
    }
  }

  // Apply AI suggestion
  const applySuggestion = (sectionKey: string, suggestion: string, suggestionIndex: number) => {
    setCanvasData(prev => ({
      ...prev,
      [sectionKey]: suggestion
    }))

    setAISuggestions(prev => ({
      ...prev,
      [sectionKey]: prev[sectionKey]?.map((s, i) => 
        i === suggestionIndex ? { ...s, applied: true } : s
      ) || []
    }))
  }

  // Copy suggestion to clipboard
  const copySuggestion = async (suggestion: string, id: string) => {
    try {
      await navigator.clipboard.writeText(suggestion)
      setCopiedSuggestion(id)
      setTimeout(() => setCopiedSuggestion(null), 2000)
    } catch (error) {
      console.error('Failed to copy suggestion:', error)
    }
  }

  // Create new version
  const handleNewVersion = async () => {
    const newVersion = prompt('Enter new version name (e.g., v2, beta, final):')
    if (!newVersion || availableVersions.includes(newVersion)) return

    setSaving(true)
    try {
      // Mock save - replace with actual API call
      //console.log('Saving new version:', newVersion)
      setAvailableVersions(prev => [...prev, newVersion])
      setVersion(newVersion)
      alert('New version created!')
    } catch (error) {
      console.error('Failed to create new version:', error)
      alert('Failed to create new version')
    } finally {
      setSaving(false)
    }
  }

  // Save canvas
  const handleSave = async () => {
    setSaving(true)
    try {
      // Mock save - replace with actual API call
      //console.log('Saving canvas data:', canvasData)
      alert('Canvas saved successfully!')
    } catch (error) {
      console.error('Failed to save canvas:', error)
      alert('Failed to save canvas. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 text-center">
        <Loader className="animate-spin inline-block mb-4" size={32} />
        <p>Loading your Lean Canvas...</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Lean Canvas</h1>
          {startupInfo && (
            <p className="text-gray-600 mt-1">{startupInfo.name} - {version}</p>
          )}
        </div>
        <div className="flex gap-3">
          <select 
            value={version} 
            onChange={(e) => setVersion(e.target.value)}
            className="w-40 px-3 py-2 border border-gray-300 rounded-md"
          >
            {availableVersions.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
          <button 
            onClick={handleNewVersion}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Version
          </button>
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Canvas
          </button>
        </div>
      </div>

      {/* Canvas Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {CANVAS_SECTIONS.map((section, index) => (
          <div key={section.key} className="border border-gray-200 rounded-lg">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">{section.name}</h3>
                <div className="flex gap-2">
                  <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                    {index + 1}
                  </span>
                  <button
                    onClick={() => getAISuggestions(section)}
                    disabled={loadingAI[section.key]}
                    className="hover:bg-blue-50 p-1 rounded"
                  >
                    {loadingAI[section.key] ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-blue-500" />
                    )}
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-1">{section.description}</p>
            </div>
            
            <div className="p-4 space-y-4">
              <textarea
                value={canvasData[section.key] || ''}
                onChange={(e) =>
                  setCanvasData(prev => ({
                    ...prev,
                    [section.key]: e.target.value,
                  }))
                }
                placeholder={section.placeholder}
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              {/* AI Suggestions */}
              {aiSuggestions[section.key] && aiSuggestions[section.key].length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium">AI Suggestions</span>
                  </div>
                  
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {aiSuggestions[section.key].slice(0, 3).map((suggestion, idx) => (
                      <div
                        key={`${suggestion.timestamp}-${idx}`}
                        className={`p-3 rounded-lg border text-sm ${
                          suggestion.applied 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-blue-50 border-blue-200'
                        }`}
                      >
                        <p className="mb-2 font-medium">{suggestion.suggestion}</p>
                        {suggestion.reasoning && (
                          <p className="mb-2 text-xs text-gray-600 italic">
                            💡 {suggestion.reasoning}
                          </p>
                        )}
                        <div className="flex gap-2">
                          <button
                            onClick={() => applySuggestion(section.key, suggestion.suggestion, idx)}
                            disabled={suggestion.applied}
                            className={`text-xs px-2 py-1 rounded border ${
                              suggestion.applied 
                                ? 'bg-green-100 border-green-300 text-green-800' 
                                : 'bg-white border-gray-300 hover:bg-gray-50'
                            } flex items-center gap-1`}
                          >
                            {suggestion.applied ? (
                              <>
                                <Check className="w-3 h-3" />
                                Applied
                              </>
                            ) : (
                              'Apply'
                            )}
                          </button>
                          <button
                            onClick={() => copySuggestion(suggestion.suggestion, `${section.key}-${idx}`)}
                            className="text-xs px-2 py-1 rounded border border-gray-300 hover:bg-gray-50"
                          >
                            {copiedSuggestion === `${section.key}-${idx}` ? (
                              <Check className="w-3 h-3" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Canvas Summary */}
      <div className="border border-gray-200 rounded-lg">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium">Canvas Completion</h3>
        </div>
        <div className="p-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>
                {CANVAS_SECTIONS.filter(s => canvasData[s.key]?.trim()).length} / {CANVAS_SECTIONS.length} sections completed
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{
                  width: `${(CANVAS_SECTIONS.filter(s => canvasData[s.key]?.trim()).length / CANVAS_SECTIONS.length) * 100}%`
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}