import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

export async function POST(req: NextRequest) {
  const { subject, grade, difficulty, sourceText, mode } = await req.json()
  if (!sourceText) return NextResponse.json({ error: 'Missing sourceText' }, { status: 400 })

  let prompt = ''
  if (mode === 'variants') {
    prompt = `Dựa vào đề gốc dưới đây, hãy tạo 3 đề biến thể khác nhau, mỗi đề gồm 12 câu trắc nghiệm (4 đáp án, 1 đúng) và 2 câu tự luận, có đáp án chi tiết. 
    Môn ${subject}, lớp ${grade}, độ khó ${difficulty}. 
    Trả về JSON có cấu trúc: { "de1": { "mc": [...], "essay": [...] }, "de2": {...}, "de3": {...} }`
  } else if (mode === 'cv7991') {
    prompt = `Tạo một đề kiểm tra theo đúng cấu trúc CV 7991 của Bộ GD&ĐT, môn ${subject} lớp ${grade}, độ khó ${difficulty}. 
    Đề gồm 12 câu trắc nghiệm (mỗi câu 4 đáp án, 1 đúng) và 2 câu tự luận, có đáp án chi tiết. 
    Trả về JSON: { "mc": [{"q":"...", "opts":["A.","B.","C.","D."], "ans":"A", "exp":"giải thích"}], "essay":[{"q":"...","ans":"hướng dẫn chấm"}] }`
  } else {
    prompt = `Phân tích cấu trúc đề gốc và tạo một đề thi tương tự, môn ${subject} lớp ${grade}, độ khó ${difficulty}. 
    Gồm 12 câu trắc nghiệm (4 đáp án, 1 đúng) và 2 câu tự luận, có đáp án chi tiết. 
    Trả về JSON: { "mc": [...], "essay": [...] }`
  }

  try {
    const result = await model.generateContent(`${prompt}\nNội dung đề gốc:\n${sourceText.substring(0, 3000)}`)
    let text = result.response.text().replace(/```json|```/g, '').trim()
    const exam = JSON.parse(text)
    return NextResponse.json({ exam })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}