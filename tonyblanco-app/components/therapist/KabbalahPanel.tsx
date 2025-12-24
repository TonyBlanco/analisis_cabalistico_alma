'use client'

import { useEffect, useState } from 'react'
import { getKabbalahInterpretation } from '@/lib/kabbalah-api'

export default function KabbalahPanel({ patientId }: { patientId: string }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [engine, setEngine] = useState<any | null>(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    getKabbalahInterpretation(patientId)
      .then((res) => {
        if (!mounted) return
        if (res && res.kabbalah_engine) {
          setEngine(res.kabbalah_engine)
        } else {
          setError('No hay interpretación kabbalística disponible')
        }
      })
      .catch((e) => {
        setError('Error cargando interpretación')
      })
      .finally(() => {
        setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [patientId])

  if (loading) return <div className="p-4">Cargando interpretación kabbalística…</div>
  if (error) return <div className="p-4 text-red-600">{error}</div>
  if (!engine) return null

  const ranking = engine['72_names']?.ranking || []
  const tikun = engine['tikun_signals'] || []

  return (
    <div className="p-4 bg-white shadow rounded">
      <h3 className="text-lg font-semibold mb-2">Interpretación Kabbalística (PoC)</h3>
      <div className="mb-4">
        <h4 className="font-medium">Top 5 72 Names</h4>
        <ol className="list-decimal ml-5">
          {ranking.slice(0, 5).map(([key, score]: any) => (
            <li key={key} className="py-1">
              <span className="font-medium">{key}</span> — <span className="text-sm text-gray-600">{score}</span>
            </li>
          ))}
        </ol>
      </div>

      <div>
        <h4 className="font-medium">Señales de Tikún</h4>
        <ul className="list-disc ml-5">
          {tikun.length === 0 && <li className="text-sm text-gray-600">No hay señales detectadas.</li>}
          {tikun.map((s: any, idx: number) => (
            <li key={idx} className="py-1">
              <div className="font-medium">{s.type}</div>
              <div className="text-sm text-gray-600">{s.recommendation || JSON.stringify(s.details)}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
