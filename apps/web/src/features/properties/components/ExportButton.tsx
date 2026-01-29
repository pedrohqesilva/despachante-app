import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Property } from "@/types/property"
import { formatZipCode, formatCurrency, formatDateOnly } from "@/lib/format"
import { getPropertyTypeLabel, getPropertyStatusLabel } from "@/lib/constants"

interface ExportButtonProps {
  properties: Property[]
  disabled?: boolean
}

function buildPropertyAddress(property: Property): string {
  let address = `${property.street}, ${property.number}`
  if (property.complement) address += ` - ${property.complement}`
  address += `, ${property.neighborhood}`
  return address
}

export function ExportButton({ properties, disabled }: ExportButtonProps) {
  const handleExport = () => {
    if (properties.length === 0) return

    const headers = [
      "Endereço",
      "CEP",
      "Cidade",
      "Estado",
      "Tipo",
      "Área (m²)",
      "Valor",
      "Status",
      "Proprietários",
      "Data de Cadastro",
    ]
    const rows = properties.map((property) => [
      buildPropertyAddress(property),
      formatZipCode(property.zipCode),
      property.city,
      property.state,
      getPropertyTypeLabel(property.type),
      property.area.toString(),
      formatCurrency(property.value),
      getPropertyStatusLabel(property.status),
      property.ownerIds.length.toString(),
      formatDateOnly(property._creationTime),
    ])

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n")

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `imoveis_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={disabled || properties.length === 0}
    >
      <Download className="mr-2 h-4 w-4" />
      Exportar CSV
    </Button>
  )
}
