import { MathJax } from 'better-react-mathjax'

export default function ExamDisplay({ exam, subject, grade }: any) {
  if (!exam) return null
  return (
    <div>
      <h3 className="text-lg font-semibold mt-4 mb-3">I. TRẮC NGHIỆM</h3>
      {exam.mc?.map((q: any, i: number) => (
        <div key={i} className="mb-4 pl-4 border-l-4 border-blue-500">
          <p className="font-medium"><MathJax>{`Câu ${i+1}: ${q.q}`}</MathJax></p>
          <ul className="ml-4 space-y-1">
            {q.opts.map((opt: string, j: number) => (
              <li key={j}><MathJax>{opt}</MathJax></li>
            ))}
          </ul>
          <p className="text-green-700 text-sm mt-1">✅ Đáp án: <MathJax inline>{q.ans}</MathJax></p>
        </div>
      ))}
      <h3 className="text-lg font-semibold mt-6 mb-3">II. TỰ LUẬN</h3>
      {exam.essay?.map((q: any, i: number) => (
        <div key={i} className="mb-4">
          <p className="font-medium"><MathJax>{`Câu ${i+1}: ${q.q}`}</MathJax></p>
          <p className="text-green-700 text-sm">📝 Hướng dẫn: <MathJax inline>{q.ans}</MathJax></p>
        </div>
      ))}
    </div>
  )
}