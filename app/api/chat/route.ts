import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()
    const lastMessage = messages[messages.length - 1].content
    let searchContext = ''

    try {
      const serperRes = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: {
          'X-API-KEY': 'f479add2550369ad5fad21670fbf31d64b924b1e',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ q: lastMessage, num: 3 }),
      })
      const serperData = await serperRes.json()
      if (serperData.answerBox?.answer) searchContext += `Answer: ${serperData.answerBox.answer}\n`
      if (serperData.answerBox?.snippet) searchContext += `Info: ${serperData.answerBox.snippet}\n`
      if (serperData.organic?.length) {
        serperData.organic.slice(0, 3).forEach((r: any) => {
          if (r.snippet) searchContext += `- ${r.title}: ${r.snippet}\n`
        })
      }
    } catch (searchError) {
      console.log('Search failed:', searchError)
    }

    const openRouterRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer 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',
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://astra-ai-psi.vercel.app',
        'X-Title': 'ASTRA AI',
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo',
        max_tokens: 1000,
        messages: [
          {
            role: 'system',
            content: `You are ASTRA, a free AI assistant for students in India especially Hyderabad. Today is ${new Date().toDateString()}. Always give direct helpful answers. Use this live search data if relevant:\n\n${searchContext || 'No search data available.'}`
          },
          ...messages
        ],
      }),
    })

    const openRouterData = await openRouterRes.json()
    console.log('OpenRouter response:', JSON.stringify(openRouterData))

    if (openRouterData.error) {
      return NextResponse.json({ reply: `API Error: ${openRouterData.error.message}` })
    }

    const reply = openRouterData?.choices?.[0]?.message?.content
    if (!reply) {
      return NextResponse.json({ reply: `Debug: ${JSON.stringify(openRouterData)}` })
    }

    return NextResponse.json({ reply })

  } catch (error: any) {
    console.error('Route error:', error)
    return NextResponse.json({ reply: `Server error: ${error.message}` }, { status: 500 })
  }
}