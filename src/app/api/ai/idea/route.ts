// src/app/api/ai/idea/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generateStartupIdeas } from '@/ai/flows/generate-startup-ideas';

export async function POST(req: NextRequest) {
  try {
    const { problemDescription, category } = await req.json();
    const ideas = await generateStartupIdeas({ problemDescription, category });
    return NextResponse.json(ideas);
  } catch (error) {
    console.error('AI Idea generation failed:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export function GET() {
  return new NextResponse('Method Not Allowed', { status: 405 });
}
