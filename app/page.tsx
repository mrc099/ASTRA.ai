'use client'
import { useState } from 'react'

const AstraLogo = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <ellipse cx="50" cy="50" rx="8" ry="42" fill="#c96442"/>
    <ellipse cx="50" cy="50" rx="42" ry="8" fill="#c96442"/>
    <ellipse cx="50" cy="50" rx="5" ry="26" fill="#e8956d" opacity="0.5" transform="rotate(45 50 50)"/>
    <ellipse cx="50" cy="50" rx="5" ry="26" fill="#e8956d" opacity="0.5" transform="rotate(-45 50 50)"/>
    <circle cx="50" cy="50" r="5" fill="#f7f4ef"/>
  </svg>
)

type Message = { role: string; content: string }
type Chat = { id: number; title: string; messages: Message[] }

function LoginPage({ onLogin }: { onLogin: (name: string) => void }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  return (
    <main style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100vh',background:'#f7f4ef',fontFamily:'ui-sans-serif,system-ui,sans-serif'}}>
      <div style={{background:'#fff',border:'1px solid #e5e0d8',borderRadius:'16px',padding:'40px',width:'360px',textAlign:'center'}}>
        <div style={{display:'flex',justifyContent:'center',marginBottom:'16px'}}><AstraLogo size={36}/></div>
        <div style={{fontSize:'24px',fontWeight:'700',color:'#1a1a1a',letterSpacing:'2px',marginBottom:'8px'}}>ASTRA</div>
        <div style={{fontSize:'13px',color:'#8a8a8a',marginBottom:'32px'}}>Your free AI assistant</div>
        <input
          style={{width:'100%',border:'1px solid #d4cfc8',borderRadius:'8px',padding:'12px 14px',fontSize:'14px',color:'#1a1a1a',background:'#f7f4ef',outline:'none',marginBottom:'12px',boxSizing:'border-box' as any}}
          placeholder="Your name"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <input
          style={{width:'100%',border:'1px solid #d4cfc8',borderRadius:'8px',padding:'12px 14px',fontSize:'14px',color:'#1a1a1a',background:'#f7f4ef',outline:'none',marginBottom:'24px',boxSizing:'border-box' as any}}
          placeholder="Your email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <button
          onClick={() => { if(name.trim()) onLogin(name) }}
          style={{width:'100%',background:'#c96442',color:'white',border:'none',borderRadius:'8px',padding:'12px',fontSize:'15px',fontWeight:'600',cursor:'pointer'}}>
          Start chatting with ASTRA
        </button>
        <div style={{fontSize:'11px',color:'#b0a898',marginTop:'16px'}}>Free to use. No credit card needed.</div>
      </div>
    </main>
  )
}

export default function Home() {
  const [user, setUser] = useState<string|null>(null)
  const [chats, setChats] = useState<Chat[]>([])
  const [activeChatId, setActiveChatId] = useState<number|null>(null)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [searching, setSearching] = useState(false)

  const activeChat = chats.find(c => c.id === activeChatId)
  const messages = activeChat?.messages || []

  const newChat = () => {
    const id = Date.now()
    setChats(prev => [{ id, title: 'New chat', messages: [] }, ...prev])
    setActiveChatId(id)
  }

  const sendMessage = async () => {
    if (!input.trim()) return
    if (!activeChatId) {
      const id = Date.now()
      const userMessage = { role: 'user', content: input }
      setChats(prev => [{ id, title: input.slice(0, 30), messages: [userMessage] }, ...prev])
      setActiveChatId(id)
      setInput('')
      setLoading(true)
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [userMessage] })
      })
      const data = await res.json()
      setChats(prev => prev.map(c => c.id === id ? { ...c, messages: [...c.messages, { role: 'assistant', content: data.reply }] } : c))
      setLoading(false)
      return
    }
    const userMessage = { role: 'user', content: input }
    const updatedMessages = [...messages, userMessage]
    setChats(prev => prev.map(c => c.id === activeChatId ? {
      ...c,
      title: c.messages.length === 0 ? input.slice(0, 30) : c.title,
      messages: updatedMessages
    } : c))
    setInput('')
    setLoading(true)
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: updatedMessages })
    })
    const data = await res.json()
    setChats(prev => prev.map(c => c.id === activeChatId ? {
      ...c, messages: [...updatedMessages, { role: 'assistant', content: data.reply }]
    } : c))
    setLoading(false)
  }

  const filteredChats = chats.filter(c => c.title.toLowerCase().includes(search.toLowerCase()))

  if (!user) return <LoginPage onLogin={setUser} />

  return (
    <main style={{display:'flex',height:'100vh',background:'#f7f4ef',fontFamily:'ui-sans-serif,system-ui,sans-serif'}}>
      <style>{`
        @keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(0.85)}}
        .astra-core{width:10px;height:10px;background:#c96442;border-radius:50%;animation:pulse 1.2s ease-in-out infinite}
        .astra-ring{position:absolute;width:24px;height:24px;border:2px solid transparent;border-top:2px solid #c96442;border-right:2px solid #c96442;border-radius:50%;animation:spin 1s linear infinite}
        .astra-ring2{position:absolute;width:16px;height:16px;border:1.5px solid transparent;border-bottom:1.5px solid #e8956d;border-left:1.5px solid #e8956d;border-radius:50%;animation:spin 0.7s linear infinite reverse}
        .chat-item:hover{background:#e0dbd2}
        .sidebar-btn:hover{background:#e0dbd2}
      `}</style>

      {/* Sidebar */}
      <div style={{width:'220px',background:'#eeebe4',borderRight:'0.5px solid #e0dbd2',display:'flex',flexDirection:'column',flexShrink:0}}>
        <div style={{padding:'14px 12px 8px'}}>
          <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'16px'}}>
            <AstraLogo size={22}/>
            <span style={{fontSize:'14px',fontWeight:'700',color:'#1a1a1a',letterSpacing:'2px'}}>ASTRA</span>
          </div>

          <button className="sidebar-btn" onClick={newChat} style={{display:'flex',alignItems:'center',gap:'8px',padding:'8px 10px',background:'#fff',border:'0.5px solid #d4cfc8',borderRadius:'8px',cursor:'pointer',fontSize:'13px',color:'#1a1a1a',width:'100%',marginBottom:'4px'}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c96442" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
            New chat
          </button>

          <button className="sidebar-btn" onClick={() => setSearching(!searching)} style={{display:'flex',alignItems:'center',gap:'8px',padding:'8px 10px',borderRadius:'8px',cursor:'pointer',fontSize:'13px',color:'#6b6b6b',width:'100%',background:'none',border:'none'}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            Search chats
          </button>

          {searching && (
            <input
              autoFocus
              style={{width:'100%',border:'0.5px solid #d4cfc8',borderRadius:'8px',padding:'7px 10px',fontSize:'13px',outline:'none',background:'#fff',marginTop:'4px',boxSizing:'border-box' as any}}
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          )}

          <div style={{fontSize:'11px',color:'#a09890',fontWeight:'600',letterSpacing:'0.5px',margin:'16px 0 4px 4px'}}>Recents</div>
          <div style={{maxHeight:'240px',overflowY:'auto'}}>
            {filteredChats.length === 0 && (
              <div style={{fontSize:'12px',color:'#b0a898',padding:'6px 8px'}}>No chats yet</div>
            )}
            {filteredChats.map(c => (
              <div key={c.id} className="chat-item" onClick={() => setActiveChatId(c.id)} style={{padding:'7px 10px',fontSize:'12px',color: c.id === activeChatId ? '#1a1a1a' : '#4a4a4a',cursor:'pointer',borderRadius:'6px',margin:'1px 0',background: c.id === activeChatId ? '#fff' : 'transparent',fontWeight: c.id === activeChatId ? '500' : '400',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
                {c.title || 'New chat'}
              </div>
            ))}
          </div>
        </div>

        <div style={{marginTop:'auto',padding:'12px',borderTop:'0.5px solid #e0dbd2'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
              <div style={{width:'28px',height:'28px',borderRadius:'50%',background:'#c96442',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'12px',fontWeight:'600',color:'white'}}>
                {user[0].toUpperCase()}
              </div>
              <span style={{fontSize:'13px',color:'#1a1a1a',fontWeight:'500'}}>{user}</span>
            </div>
            <button onClick={() => setUser(null)} style={{background:'none',border:'none',cursor:'pointer',fontSize:'11px',color:'#a09890'}}>Sign out</button>
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        <div style={{flex:1,overflowY:'auto',display:'flex',flexDirection:'column'}}>
          {messages.length === 0 && (
            <div style={{textAlign:'center',marginTop:'80px'}}>
              <div style={{display:'flex',justifyContent:'center',marginBottom:'16px'}}><AstraLogo size={40}/></div>
              <div style={{fontSize:'28px',fontWeight:'600',color:'#1a1a1a',marginBottom:'8px'}}>How can I help you, {user}?</div>
              <div style={{fontSize:'14px',color:'#8a8a8a'}}>Ask ASTRA anything — completely free.</div>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} style={{padding:'20px 24px',background:m.role==='user'?'#f7f4ef':'#ffffff',borderBottom:'0.5px solid #f0ebe4',display:'flex',gap:'16px',alignItems:'flex-start'}}>
              <div style={{width:'28px',height:'28px',borderRadius:'50%',flexShrink:0,background:m.role==='user'?'#1a1a1a':'#c96442',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'12px',fontWeight:'600',color:'white'}}>
                {m.role==='user'?user[0].toUpperCase():'A'}
              </div>
              <div style={{fontSize:'15px',lineHeight:'1.75',color:'#1a1a1a',flex:1,paddingTop:'2px'}}>{m.content}</div>
            </div>
          ))}
          {loading && (
            <div style={{padding:'20px 24px',background:'#ffffff',borderBottom:'0.5px solid #f0ebe4',display:'flex',gap:'16px',alignItems:'flex-start'}}>
              <div style={{width:'28px',height:'28px',position:'relative',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <div className="astra-ring"></div>
                <div className="astra-ring2"></div>
                <div className="astra-core"></div>
              </div>
              <div style={{fontSize:'14px',color:'#8a8a8a',paddingTop:'6px'}}>ASTRA is thinking...</div>
            </div>
          )}
        </div>

        <div style={{padding:'16px 24px',borderTop:'0.5px solid #e5e0d8',background:'#f7f4ef'}}>
          <div style={{maxWidth:'720px',margin:'0 auto',display:'flex',gap:'10px',alignItems:'center',background:'#ffffff',border:'0.5px solid #d4cfc8',borderRadius:'12px',padding:'10px 14px'}}>
            <input
              style={{flex:1,border:'none',outline:'none',fontSize:'15px',color:'#1a1a1a',background:'transparent',fontFamily:'inherit'}}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key==='Enter' && sendMessage()}
              placeholder="Message ASTRA..."
            />
            <button onClick={sendMessage} style={{background:'#1a1a1a',border:'none',borderRadius:'8px',width:'32px',height:'32px',cursor:'pointer',color:'white',fontSize:'14px',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>↑</button>
          </div>
          <div style={{textAlign:'center',fontSize:'11px',color:'#b0a898',marginTop:'8px'}}>ASTRA is free to use. Always verify important information.</div>
        </div>
      </div>
    </main>
  )
}