// frontend/pages/doctor.js
import React, { useState, useEffect } from 'react'

export default function DoctorPage() {
  const [text, setText] = useState('')
  const [requestId, setRequestId] = useState(null)
  const [messages, setMessages] = useState([])

  const sendRequest = async () => {
    console.log('🔵 sendRequest called, text =', text)
    try {
      const res = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      })
      if (!res.ok) {
        console.error('❌ /chat returned', res.status, await res.text())
        return
      }
      const { request_id } = await res.json()
      console.log('🟢 got request_id =', request_id)
      setRequestId(request_id)
      setMessages([{ speaker: 'System', text: `Tracking request #${request_id}` }])
    } catch (err) {
      console.error('⚠️ sendRequest error', err)
    }
  }

  useEffect(() => {
    if (!requestId) return
    const iv = setInterval(async () => {
      try {
        const res = await fetch(`http://localhost:8000/status/${requestId}`)
        if (!res.ok) {
          console.error('❌ /status returned', res.status)
          return clearInterval(iv)
        }
        const data = await res.json()
        setMessages(data.steps.map(s => ({ speaker: s.name, text: s.result })))
        if (data.status === 'completed') clearInterval(iv)
      } catch (err) {
        console.error('⚠️ polling error', err)
        clearInterval(iv)
      }
    }, 2000)
    return () => clearInterval(iv)
  }, [requestId])

  return (
    <div style={{ padding: 20 }}>
      <h1>MedLedger Chat</h1>

      <div
        style={{
          border: '1px solid #ccc',
          padding: 10,
          height: 300,
          overflowY: 'auto',
          marginBottom: 10
        }}
      >
        {messages.map((m, i) => (
          <div key={i}>
            <b>{m.speaker}:</b> {m.text}
          </div>
        ))}
      </div>

      <input
        placeholder="Type your request here…"
        value={text}
        onChange={e => setText(e.target.value)}
        style={{ width: '80%' }}
      />
      <button onClick={sendRequest} style={{ marginLeft: 8 }}>
        Send
      </button>
    </div>
  )
}
