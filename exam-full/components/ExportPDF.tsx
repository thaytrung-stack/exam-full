'use client'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

export default function ExportPDF({ exam, subject, grade, label = '' }: any) {
  const exportPDF = () => {
    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.text(`ĐỀ ${subject.toUpperCase()} LỚP ${grade}`, 105, 15, { align: 'center' })
    let y = 30
    doc.setFontSize(12)
    doc.text('I. TRẮC NGHIỆM', 14, y)
    y += 10
    exam.mc?.forEach((q: any, i: number) => {
      if (y > 270) { doc.addPage(); y = 20 }
      doc.text(`${i+1}. ${q.q}`, 14, y)
      y += 7
      q.opts.forEach((o: string) => { doc.text(o, 20, y); y += 7 })
      y += 4
    })
    y += 5
    doc.text('II. TỰ LUẬN', 14, y)
    y += 10
    exam.essay?.forEach((q: any, i: number) => {
      doc.text(`${i+1}. ${q.q}`, 14, y)
      y += 10
    })
    const fileName = `De-thi-${subject}-lop${grade}${label ? '-'+label : ''}.pdf`
    doc.save(fileName)
  }

  return (
    <button onClick={exportPDF} className="mt-4 bg-red-600 hover:bg-red-700 text-white rounded-lg px-6 py-2 font-medium">
      📄 Xuất PDF
    </button>
  )
}