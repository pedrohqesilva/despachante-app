import jsPDF from "jspdf"
import html2canvas from "html2canvas"

interface GeneratePdfOptions {
  content: string
  filename: string
}

export async function generateContractPdf({
  content,
  filename,
}: GeneratePdfOptions): Promise<Blob> {
  const container = document.createElement("div")
  container.innerHTML = content
  container.style.width = "170mm"
  container.style.padding = "20mm"
  container.style.fontFamily = "Arial, sans-serif"
  container.style.fontSize = "12pt"
  container.style.lineHeight = "1.6"
  container.style.position = "absolute"
  container.style.left = "-9999px"
  container.style.top = "0"
  container.style.backgroundColor = "white"
  container.style.color = "black"
  document.body.appendChild(container)

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    })

    const imgData = canvas.toDataURL("image/png")
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const imgWidth = pageWidth
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight
    let position = 0

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    while (heightLeft > 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    return pdf.output("blob")
  } finally {
    document.body.removeChild(container)
  }
}

export function downloadPdf(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename.endsWith(".pdf") ? filename : `${filename}.pdf`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export async function generateAndDownloadPdf(
  content: string,
  filename: string
): Promise<void> {
  const blob = await generateContractPdf({ content, filename })
  downloadPdf(blob, filename)
}
