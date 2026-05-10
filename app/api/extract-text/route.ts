import { NextRequest, NextResponse } from 'next/server'
import pdfParse from 'pdf-parse'
import Tesseract from 'tesseract.js'

export async function POST(req: NextRequest) {
  const form = await req.formData()
  const file = form.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })
  const buf = Buffer.from(await file.arrayBuffer())
  try {
    if (file.type === 'application/pdf') {
      const data = await pdfParse(buf)
      return NextResponse.json({ text: data.text })
    } else if (file.type.startsWith('image/')) {
      const { data: { text } } = await Tesseract.recognize(buf, 'eng+vie')
      return NextResponse.json({ text })
    }
    return NextResponse.json({ error: 'Unsupported format' }, { status: 400 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}