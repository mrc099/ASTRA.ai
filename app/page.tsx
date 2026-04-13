'use client'
import { useState, useEffect } from 'react'

export default function Home() {
  const [messages, setMessages] = useState<{ role: string, content: string }[]>([])
  const [input, setInput] = useState('')
  const [greeting, setGreeting] = useState('')

  // Logic for Dynamic Greeting
  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good Morning, Chandu')
    else if (hour < 17) setGreeting('Good Afternoon, Chandu')
    else if (hour < 21) setGreeting('Good Evening, Chandu')
    else setGreeting('Good Night, Chandu')
  }, [])

  async function sendMessage() {
    if (!input.trim()) return
    const newMessages = [...messages, { role: 'user', content: input }]
    setMessages(newMessages)
    setInput('')

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      })
      const data = await res.json()
      // Fix: Specifically look for 'reply' from our API
      setMessages([...newMessages, { role: 'assistant', content: data.reply || "No response received." }])
    } catch (error) {
      setMessages([...newMessages, { role: 'assistant', content: "Error connecting to ASTRA." }])
    }
  }

  return (
    <div className="flex h-screen bg-gray-50 text-black font-sans">
      {/* Sidebar - Basic Version */}
      <div className="w-64 bg-white border-r p-4 hidden md:block">
        <h1 className="font-bold text-orange-500 text-xl flex items-center gap-2">
          <span>✦</span> ASTRA
        </h1>
        <button className="mt-4 w-full border rounded-lg py-2 hover:bg-gray-50">New Chat</button>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="h-full flex items-center justify-center text-3xl font-semibold text-gray-400">
              {greeting}
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`p-4 rounded-lg max-w-2xl ${m.role === 'user' ? 'bg-blue-100 ml-auto' : 'bg-white border'}`}>
              <strong>{m.role === 'user' ? 'You' : 'ASTRA'}:</strong>
              <p className="mt-1">{m.content}</p>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t bg-white">
          <div className="max-w-3xl mx-auto flex gap-2">
            <input 
              className="flex-1 border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Message ASTRA..."
            />
            <button onClick={sendMessage} className="bg-black text-white px-6 py-3 rounded-xl hover:opacity-80">Send</button>
          </div>
        </div>
      </div>
    </div>
  )
}