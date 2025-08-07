// app/api/lean-canvas/versions/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getAllCanvasVersions } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startupId = searchParams.get('startupId')
    const userId = searchParams.get('userId')

    if (!startupId || !userId) {
      return NextResponse.json(
        { error: 'Missing startupId or userId' },
        { status: 400 }
      )
    }

    const versions = await getAllCanvasVersions(startupId, userId)
    
    // If no versions exist, return default v1
    const finalVersions = versions.length > 0 ? versions : ['v1']

    return NextResponse.json({ versions: finalVersions })

  } catch (error) {
    console.error('Error fetching canvas versions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch versions' },
      { status: 500 }
    )
  }
}