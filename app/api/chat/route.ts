import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()
    const lastMessage = messages[messages.length - 1].content

<<<<<<< HEAD
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
=======
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
>>>>>>> 5437e0f (Step 1: Fresh start for chat brain)
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
<<<<<<< HEAD
    }

    const systemPrompt = `You are ASTRA, a free AI assistant for students in India especially Hyderabad. Today is ${new Date().toDateString()}.
You have access to LIVE Google search results. Use them to answer accurately.
NEVER say "check Google" — always give a direct answer using the search data.
LIVE GOOGLE SEARCH DATA:
${searchContext || 'No search results available for this query.'}`

    // Try OpenRouter first
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
        console.log('OpenRouter response:', JSON.stringify(gptData))
        const reply = gptData.choices?.[0]?.message?.content
        if (reply) return NextResponse.json({ reply })
      } catch (e) {
        console.error('OpenRouter error:', e)
      }
=======
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
>>>>>>> 5437e0f (Step 1: Fresh start for chat brain)
    }

    // Fallback to Gemini
    const geminiKey = process.env.GEMINI_API_KEY
    if (geminiKey) {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                role: 'user',
                parts: [{ text: systemPrompt + '\n\nUser: ' + lastMessage }],
              }],
            }),
          }
        )
        const geminiData = await geminiRes.json()
        console.log('Gemini response:', JSON.stringify(geminiData))
        const reply = geminiData.candidates?.[0]?.content?.parts?.[0]?.text
        if (reply) return NextResponse.json({ reply })
      } catch (e) {
        console.error('Gemini error:', e)
      }
    }

    return NextResponse.json({ reply: 'ASTRA is temporarily unavailable. Please try again.' })

  } catch (error) {
<<<<<<< HEAD
    console.error('Route error:', error)
    return NextResponse.json({ reply: 'Something went wrong. Please try again.' }, { status: 500 })
=======
    return NextResponse.json({ reply: "I am offline right now. Try again in a moment." })
>>>>>>> 5437e0f (Step 1: Fresh start for chat brain)
  }
}
