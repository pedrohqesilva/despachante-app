import jsPDF from "jspdf"
import html2canvas from "html2canvas"

interface GeneratePdfOptions {
  content: string
  filename: string
}

export async function generateContractPdf({
  content,
}: GeneratePdfOptions): Promise<Blob> {
  const iframe = document.createElement("iframe")
  iframe.style.position = "absolute"
  iframe.style.left = "-9999px"
  iframe.style.top = "0"
  iframe.style.width = "210mm"
  iframe.style.height = "297mm"
  iframe.style.border = "none"
  document.body.appendChild(iframe)

  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
  if (!iframeDoc) {
    document.body.removeChild(iframe)
    throw new Error("Não foi possível criar o documento do iframe")
  }

  iframeDoc.open()
  iframeDoc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: Arial, Helvetica, sans-serif;
            font-size: 12pt;
            line-height: 1.6;
            color: #000000;
            background-color: #ffffff;
            padding: 20mm;
            width: 210mm;
          }
          h1 { font-size: 18pt; font-weight: bold; margin-bottom: 12pt; }
          h2 { font-size: 16pt; font-weight: bold; margin-bottom: 10pt; }
          h3 { font-size: 14pt; font-weight: bold; margin-bottom: 8pt; }
          p { margin-bottom: 10pt; text-align: justify; }
          ul, ol { margin-left: 20pt; margin-bottom: 10pt; }
          li { margin-bottom: 4pt; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 10pt; }
          th, td { border: 1px solid #000000; padding: 6pt; text-align: left; }
          th { background-color: #f0f0f0; font-weight: bold; }
          strong, b { font-weight: bold; }
          em, i { font-style: italic; }
          u { text-decoration: underline; }
          s { text-decoration: line-through; }
          hr { border: none; border-top: 1px solid #000000; margin: 12pt 0; }
          blockquote { border-left: 3px solid #cccccc; padding-left: 10pt; margin: 10pt 0; }
          mark { background-color: #ffff00; }
        </style>
      </head>
      <body>
        ${content}
      </body>
    </html>
  `)
  iframeDoc.close()

  await new Promise((resolve) => setTimeout(resolve, 100))

  try {
    const canvas = await html2canvas(iframeDoc.body, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      windowWidth: 794,
      windowHeight: 1123,
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
    document.body.removeChild(iframe)
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
