'use client'
import { useState, useEffect } from 'react'

export default function Timer({ minutes, onTimeUp }: { minutes: number; onTimeUp: () => void }) {
  const [timeLeft, setTimeLeft] = useState(minutes * 60)

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp()
      return
    }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000)
    return () => clearInterval(timer)
  }, [timeLeft, onTimeUp])

  const format = (s: number) => {
    const min = Math.floor(s / 60)
    const sec = s % 60
    return `${min.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}`
  }

  return <span className="font-mono text-lg text-red-600 font-bold">{format(timeLeft)}</span>
}