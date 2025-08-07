// app/api/ai-suggestions/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { aiSuggestLeanCanvasBlock } from '@/ai/flows/ai-suggest-lean-canvas-block' // Adjust path as needed

export async function POST(request: NextRequest) {
  try {
    const { section, context, existingContent, previousAttempts } = await request.json()

    // Extract startup info from context
    const startupName = extractStartupName(context)
    const startupDescription = extractStartupDescription(context)

    // Call your AI function
    const result = await aiSuggestLeanCanvasBlock({
      blockName: section,
      currentContent: existingContent || '',
      previousAttempts: previousAttempts || [],
      startupName,
      startupDescription,
    })

    return NextResponse.json({
      suggestion: result.suggestion,
      reasoning: result.reasoning,
    })

  } catch (error) {
    console.error('Error generating AI suggestions:', error)
    return NextResponse.json(
      { error: 'Failed to generate suggestions' },
      { status: 500 }
    )
  }
}

// Helper functions to extract startup info from context string
function extractStartupName(context: string): string {
  const match = context.match(/Startup Name:\s*([^\n]+)/i)
  return match?.[1]?.trim() || ''
}

function extractStartupDescription(context: string): string {
  const match = context.match(/Description:\s*([^\n]+)/i)
  return match?.[1]?.trim() || ''
}