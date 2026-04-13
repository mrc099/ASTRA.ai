import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()
    const lastMessage = messages[messages.length - 1].content
    let searchContext = ''

    // 1. SEARCH FOR ANSWERS (SERPER API)
    try {
      const serperRes = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: {
          'X-API-KEY': process.env.SERPER_API_KEY || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ q: lastMessage, num: 5 }),
      })
      
      if (serperRes.ok) {
        const serperData = await serperRes.json()
        if (serperData.answerBox?.answer) searchContext += `Direct Answer: ${serperData.answerBox.answer}\n`
        if (serperData.organic?.length) {
          serperData.organic.slice(0, 3).forEach((r: any) => {
            searchContext += `- ${r.title}: ${r.snippet}\n`
          })
        }
      }
    } catch (e) {
      console.log("Search skipped.")
    }

    // 2. TALK TO AI (OPENROUTER)
    const gptRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://astra-ai-psi.vercel.app',
        'X-Title': 'ASTRA AI',
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are ASTRA, a helpful AI for students in Hyderabad. Current date: ${new Date().toDateString()}.\n\nContext:\n${searchContext || 'No search data available.'}`
          },
          ...messages,
        ],
      }),
    })

    const gptData = await gptRes.json()
    
    if (gptData.choices && gptData.choices[0]) {
      return NextResponse.json({ reply: gptData.choices[0].message.content })
    } else {
      return NextResponse.json({ reply: "I am having trouble connecting to my brain. Please check the API key." })
    }

  } catch (error) {
    return NextResponse.json({ reply: "I am offline right now. Try again in a moment." })
  }
}