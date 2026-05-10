'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { MathJax, MathJaxContext } from 'better-react-mathjax'
import Timer from '../../components/Timer'

function TestContent() {
  const searchParams = useSearchParams()
  const dataParam = searchParams.get('data')
  const [examData, setExamData] = useState<any>(null)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState<number | null>(null)

  useEffect(() => {
    if (dataParam) {
      try {
        const decoded = JSON.parse(decodeURIComponent(dataParam))
        setExamData(decoded)
      } catch (e) {
        alert('Dữ liệu đề không hợp lệ')
      }
    }
  }, [dataParam])

  const handleAnswer = (questionIndex: number, option: string) => {
    if (submitted) return
    setAnswers(prev => ({ ...prev, [questionIndex]: option }))
  }

  const handleSubmit = () => {
    if (!examData) return
    let correct = 0
    examData.mc.forEach((q: any, i: number) => {
      if (answers[i] === q.ans) correct++
    })
    setScore(correct)
    setSubmitted(true)
  }

  const handleTimeUp = () => {
    alert('Hết giờ! Bài thi sẽ được nộp tự động.')
    handleSubmit()
  }

  if (!examData) return <div className="p-8 text-center">Đang tải đề thi...</div>

  return (
    <MathJaxContext>
      <main className="max-w-4xl mx-auto p-4 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">
            📝 Thi online: {examData.subject} lớp {examData.grade}
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-lg">⏱️ Thời gian còn lại:</span>
            <Timer minutes={examData.duration || 45} onTimeUp={handleTimeUp} />
          </div>
        </div>

        {submitted && score !== null && (
          <div className="bg-green-100 border border-green-400 rounded-xl p-4 mb-6">
            <p className="text-xl font-semibold">
              ✅ Kết quả: {score}/{examData.mc.length} câu đúng 
              ({Math.round((score/examData.mc.length)*100)}%)
            </p>
          </div>
        )}

        <div className="space-y-6">
          {examData.mc.map((q: any, i: number) => {
            const isCorrect = submitted && answers[i] === q.ans
            const isWrong = submitted && answers[i] && answers[i] !== q.ans
            return (
              <div key={i} className="bg-white rounded-xl shadow p-4">
                <p className="font-medium mb-2"><MathJax>{`Câu ${i+1}: ${q.q}`}</MathJax></p>
                <div className="space-y-2">
                  {q.opts.map((opt: string, j: number) => {
                    const letter = opt.charAt(0)
                    const isSelected = answers[i] === letter
                    return (
                      <label
                        key={j}
                        className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition border ${
                          isCorrect ? 'bg-green-100 border-green-500' :
                          isWrong && isSelected ? 'bg-red-100 border-red-500' :
                          isSelected ? 'bg-blue-100 border-blue-500' : 'border-gray-200 hover:bg-gray-50'
                        } ${submitted ? 'cursor-default' : ''}`}
                      >
                        <input
                          type="radio"
                          name={`q${i}`}
                          value={letter}
                          checked={isSelected}
                          onChange={() => handleAnswer(i, letter)}
                          disabled={submitted}
                          className="hidden"
                        />
                        <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-bold ${
                          isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-400'
                        }`}>{letter}</span>
                        <MathJax inline>{opt.substring(2).trim()}</MathJax>
                      </label>
                    )
                  })}
                </div>
                {submitted && <p className="mt-2 text-sm text-green-700">Đáp án: {q.ans}</p>}
              </div>
            )
          })}
        </div>

        {!submitted && (
          <button
            onClick={handleSubmit}
            className="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 font-semibold text-lg"
          >
            📩 Nộp bài
          </button>
        )}
      </main>
    </MathJaxContext>
  )
}

export default function TestPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Đang tải...</div>}>
      <TestContent />
    </Suspense>
  )
}