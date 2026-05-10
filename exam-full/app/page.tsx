'use client'
import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { MathJaxContext } from 'better-react-mathjax'
import ExamDisplay from '../components/ExamDisplay'
import ExportPDF from '../components/ExportPDF'

export default function Home() {
  const [mode, setMode] = useState<'similar' | 'cv7991' | 'variants'>('similar')
  const [sourceText, setSourceText] = useState('')
  const [subject, setSubject] = useState('Toán')
  const [grade, setGrade] = useState('11')
  const [difficulty, setDifficulty] = useState('Trung bình')
  const [exam, setExam] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return
    const fd = new FormData()
    fd.append('file', file)
    setLoading(true)
    try {
      const res = await fetch('/api/extract-text', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.text) setSourceText(data.text)
      else alert('Lỗi trích xuất: ' + data.error)
    } catch (e) {
      alert('Lỗi kết nối API')
    }
    setLoading(false)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  const generateExam = async () => {
    if (!sourceText) return alert('Vui lòng nhập nội dung đề gốc!')
    setLoading(true)
    try {
      const res = await fetch('/api/generate-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, grade, difficulty, sourceText, mode })
      })
      const data = await res.json()
      if (data.exam) setExam(data.exam)
      else alert('Lỗi sinh đề: ' + data.error)
    } catch (e) {
      alert('Lỗi kết nối API')
    }
    setLoading(false)
  }

  const openTestPage = () => {
    if (!exam) return
    const testData = { mc: exam.mc || exam.de1?.mc || [], subject, grade, difficulty, mode }
    const encoded = encodeURIComponent(JSON.stringify(testData))
    window.open(`/test?data=${encoded}`, '_blank')
  }

  return (
    <MathJaxContext>
      <main className="max-w-7xl mx-auto p-4 md:p-8">
        <h1 className="text-3xl font-bold text-center mb-6">📝 Tạo đề thi AI & Thi online</h1>

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {[
            { key: 'similar', title: 'Tạo đề tương tự', desc: 'Upload 1 đề mẫu → AI phân tích cấu trúc & sinh đề mới', icon: '📄' },
            { key: 'cv7991', title: 'Tạo đề theo CV 7991', desc: 'Pipeline chuẩn, xuất Word/HTML', icon: '📋' },
            { key: 'variants', title: 'Sinh 3 đề biến thể', desc: '1 đề gốc → 3 đề khác nhau kèm đáp án', icon: '🔄' },
          ].map((item) => (
            <div
              key={item.key}
              onClick={() => { setMode(item.key as any); setExam(null) }}
              className={`cursor-pointer rounded-2xl p-6 border-2 transition-all hover:shadow-lg ${
                mode === item.key ? 'border-blue-600 bg-blue-50 shadow-md' : 'border-gray-200 bg-white'
              }`}
            >
              <div className="text-4xl mb-4">{item.icon}</div>
              <h2 className="text-xl font-semibold mb-2">{item.title}</h2>
              <p className="text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">📥 Tải lên hoặc dán nội dung đề gốc</h2>
          <div {...getRootProps()} className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer bg-gray-50 hover:bg-gray-100 mb-4">
            <input {...getInputProps()} />
            {isDragActive ? <p>Thả file vào đây...</p> : <p>📎 Kéo thả PDF/Ảnh hoặc click để chọn file</p>}
          </div>
          <textarea
            className="w-full border rounded-xl p-4 h-40"
            placeholder="Hoặc dán trực tiếp nội dung đề mẫu..."
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <select value={subject} onChange={(e) => setSubject(e.target.value)} className="border rounded-lg p-2">
              <option>Toán</option><option>Vật Lý</option><option>Hóa Học</option><option>Sinh Học</option>
              <option>Ngữ Văn</option><option>Tiếng Anh</option><option>Lịch Sử</option><option>Địa Lý</option>
            </select>
            <select value={grade} onChange={(e) => setGrade(e.target.value)} className="border rounded-lg p-2">
              {[6,7,8,9,10,11,12].map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="border rounded-lg p-2">
              <option>Dễ</option><option>Trung bình</option><option>Khó</option>
            </select>
            <button
              onClick={generateExam}
              disabled={!sourceText || loading}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 font-medium disabled:opacity-50 transition"
            >
              {loading ? '⏳ Đang sinh...' : '🚀 Tạo đề'}
            </button>
          </div>
        </div>

        {exam && (
          <div className="bg-white rounded-2xl shadow p-6">
            {mode === 'variants' ? (
              <div className="space-y-8">
                {['de1', 'de2', 'de3'].map((de, i) => (
                  <div key={de}>
                    <h2 className="text-2xl font-bold mb-4">Đề số {i+1}</h2>
                    <ExamDisplay exam={exam[de]} subject={subject} grade={grade} />
                    <ExportPDF exam={exam[de]} subject={subject} grade={grade} label={`de${i+1}`} />
                  </div>
                ))}
              </div>
            ) : (
              <>
                <ExamDisplay exam={exam} subject={subject} grade={grade} />
                <ExportPDF exam={exam} subject={subject} grade={grade} />
              </>
            )}
            <button
              onClick={openTestPage}
              className="mt-6 ml-4 bg-green-600 hover:bg-green-700 text-white rounded-lg px-6 py-2 font-medium"
            >
              📝 Làm bài thi online
            </button>
          </div>
        )}
      </main>
    </MathJaxContext>
  )
}