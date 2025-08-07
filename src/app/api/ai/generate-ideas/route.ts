// src/app/api/ai/generate-ideas/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    console.log('📝 API: Received request to generate startup ideas');
    const { problem, category } = await req.json();

    console.log('📝 API: Received data:', { problem, category });

    // Enhanced prompt to get structured response
    const prompt = `Generate exactly 3 startup ideas for this problem: "${problem}" in the ${category} category.

For each idea, provide:
1. A creative title
2. A brief summary (2-3 sentences)
3. A market potential score from 1-10

Format each idea exactly like this:
Title: [Your title]
Summary: [Your summary]
Score: [1-10]

Separate each idea with a blank line.`;

    console.log('🤖 API: Calling OpenRouter...');

    // Fixed OpenRouter API call
    const openRouterRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000', // Optional
        'X-Title': 'Startup Ideas Generator', // Optional
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    console.log('🤖 API: Response status:', openRouterRes.status);
    console.log('🤖 API: Response headers:', Object.fromEntries(openRouterRes.headers.entries()));

    // Check if response is ok before parsing
    if (!openRouterRes.ok) {
      const errorText = await openRouterRes.text();
      console.error('❌ API: OpenRouter error response:', errorText);
      return NextResponse.json({ 
        error: `OpenRouter API error: ${openRouterRes.status} - ${errorText}` 
      }, { status: 500 });
    }

    const data = await openRouterRes.json();
    console.log('✅ API: Received response from OpenRouter:', data);

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('❌ API: Invalid response structure:', data);
      return NextResponse.json({ error: 'Invalid API response structure' }, { status: 500 });
    }

    const aiResponse = data.choices[0].message.content;
    console.log('✅ API: AI Response content:', aiResponse);

    // Parse the response into structured ideas
    const ideas = parseAIResponse(aiResponse);
    console.log('✅ API: Parsed ideas:', ideas);

    return NextResponse.json({ ideas });
  } catch (error) {
    console.error('❌ API: Error occurred:', error);
    return NextResponse.json({ 
      error: `Internal Server Error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
}

// Helper function to parse AI response into structured format
function parseAIResponse(text: string) {
  console.log('🔍 Parsing AI response...');
  
  const blocks = text.split('\n\n').filter(block => block.trim());
  
  const ideas = blocks.map((block, index) => {
    console.log(`🔍 Processing block ${index + 1}:`, block);
    
    const lines = block.split('\n').map(line => line.trim()).filter(line => line);
    
    let title = '';
    let summary = '';
    let score = 5;
    
    for (const line of lines) {
      if (line.toLowerCase().startsWith('title:')) {
        title = line.replace(/^title:\s*/i, '').trim();
      } else if (line.toLowerCase().startsWith('summary:')) {
        summary = line.replace(/^summary:\s*/i, '').trim();
      } else if (line.toLowerCase().startsWith('score:')) {
        const scoreStr = line.replace(/^score:\s*/i, '').trim();
        const parsedScore = parseInt(scoreStr, 10);
        score = isNaN(parsedScore) ? 5 : Math.max(1, Math.min(10, parsedScore));
      }
    }
    
    // Fallback parsing if format doesn't match exactly
    if (!title && lines.length > 0) {
      title = lines[0].replace(/^\d+\.\s*/, '').replace(/^title:\s*/i, '').trim();
    }
    if (!summary && lines.length > 1) {
      summary = lines.slice(1, -1).join(' ').replace(/^summary:\s*/i, '').trim();
    }
    
    console.log(`✅ Parsed idea ${index + 1}:`, { title, summary, score });
    
    return title && summary ? { title, summary, score } : null;
  }).filter(Boolean);
  
  // Fallback if parsing completely fails
  if (ideas.length === 0) {
    console.log('⚠️ Parsing failed, creating fallback from raw text');
    const sentences = text.split('.').filter(s => s.trim().length > 10);
    return [
      {
        title: "AI-Generated Startup Idea",
        summary: sentences.slice(0, 2).join('.') + '.',
        score: 7
      }
    ];
  }
  
  return ideas;
}