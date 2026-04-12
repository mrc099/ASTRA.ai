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
        body: JSON.stringify({ q: lastMessage, num: 5 }),
      })
      const serperData = await serperRes.json()
      if (serperData.answerBox?.answer) {
        searchContext += `Direct Answer: ${serperData.answerBox.answer}\n`
      }
      if (serperData.answerBox?.snippet) {
        searchContext += `Answer: ${serperData.answerBox.snippet}\n`
      }
      if (serperData.organic?.length) {
        serperData.organic.slice(0, 4).forEach((r: any) => {
          searchContext += `- ${r.title}: ${r.snippet}\n`
        })
      }
      if (serperData.knowledgeGraph?.description) {
        searchContext += `Knowledge: ${serperData.knowledgeGraph.description}\n`
      }
    } catch (e) {}

    const gptRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer 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`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are ASTRA, a free AI assistant for students in India especially Hyderabad. Today is ${new Date().toDateString()}.

You have access to LIVE Google search results. Use them to answer accurately.
NEVER say "check Google" — always give a direct answer using the search data.
NEVER use your old training data for current facts like politicians, results, news.

LIVE GOOGLE SEARCH DATA:
${searchContext || 'No search results available for this query.'}`
          },
          ...messages,
        ],
      }),
    })
    const gptData = await gptRes.json()
    const reply = gptData.choices?.[0]?.message?.content || 'No reply'
    return NextResponse.json({ reply })

  } catch (error) {
    return NextResponse.json({ reply: 'Error: ' + error }, { status: 500 })
  }
}