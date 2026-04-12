import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()
    const lastMessage = messages[messages.length - 1].content

    // ── 1. Google Search via Serper ───────────────────────────────────
    let searchContext = ''
    const serperKey = process.env.SERPER_API_KEY
    if (serperKey) {
      try {
        const serperRes = await fetch('https://google.serper.dev/search', {
          method: 'POST',
          headers: {
            'X-API-KEY': serperKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ q: lastMessage, num: 5 }),
        })
        const serperData = await serperRes.json()
        if (serperData.answerBox?.answer)
          searchContext += `Direct Answer: ${serperData.answerBox.answer}\n`
        if (serperData.answerBox?.snippet)
          searchContext += `Answer: ${serperData.answerBox.snippet}\n`
        if (serperData.organic?.length)
          serperData.organic.slice(0, 4).forEach((r: any) => {
            searchContext += `- ${r.title}: ${r.snippet}\n`
          })
        if (serperData.knowledgeGraph?.description)
          searchContext += `Knowledge: ${serperData.knowledgeGraph.description}\n`
      } catch (e) {
        console.error('Serper error:', e)
      }
    }

    const systemPrompt = `You are ASTRA, a free AI assistant for students in India especially Hyderabad. Today is ${new Date().toDateString()}.
You have access to LIVE Google search results. Use them to answer accurately.
NEVER say "check Google" — always give a direct answer using the search data.
NEVER use your old training data for current facts like politicians, results, news.
LIVE GOOGLE SEARCH DATA:
${searchContext || 'No search results available for this query.'}`

    // ── 2. Try OpenRouter (GPT-3.5-turbo) ────────────────────────────
    const openrouterKey = process.env.OPENROUTER_API_KEY
    if (openrouterKey) {
      try {
        const gptRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openrouterKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://astra-ai-psi.vercel.app',
            'X-Title': 'ASTRA AI',
          },
          body: JSON.stringify({
            model: 'openai/gpt-3.5-turbo',
            messages: [
              { role: 'system', content: systemPrompt },
              ...messages,
            ],
          }),
        })
        const gptData = await gptRes.json()
        const reply = gptData.choices?.[0]?.message?.content
        if (reply) return NextResponse.json({ reply })
        console.error('OpenRouter no reply:', JSON.stringify(gptData))
      } catch (e) {
        console.error('OpenRouter error:', e)
      }
    }

    // ── 3. Fallback → Gemini 2.0 Flash ───────────────────────────────
    const geminiKey = process.env.GEMINI_API_KEY
    if (geminiKey) {
      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: systemPrompt + '\n\nUser: ' + lastMessage }],
              },
            ],
          }),
        }
      )
      const geminiData = await geminiRes.json()
      const reply = geminiData.candidates?.[0]?.content?.parts?.[0]?.text
      if (reply) return NextResponse.json({ reply })
      console.error('Gemini error:', JSON.stringify(geminiData))
    }

    // ── 4. All APIs failed ────────────────────────────────────────────
    return NextResponse.json({
      reply: 'ASTRA is temporarily unavailable. Please try again in a moment.'
    })

  } catch (error) {
    console.error('Route error:', error)
    return NextResponse.json(
      { reply: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
