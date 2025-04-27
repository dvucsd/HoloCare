import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

export default function DashboardPage() {
  const { id } = useRouter().query
  const [status, setStatus] = useState(null)

  useEffect(() => {
    if (!id) return
    fetch(`http://localhost:8000/status/${id}`)
      .then(r => r.json())
      .then(setStatus)
  }, [id])

  if (!status) return <div>Loading…</div>

  return (
    <div style={{ padding: 20 }}>
      <h1>Request #{status.id}</h1>
      {/* … */}
    </div>
  )
}
