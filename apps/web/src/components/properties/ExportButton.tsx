import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Property } from "@/types/property"
import { formatZipCode, formatCurrency, formatArea, formatDateOnly } from "@/lib/format"

interface ExportButtonProps {
  properties: Property[]
  disabled?: boolean
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
      property.address,
      formatZipCode(property.zipCode),
      property.city,
      property.state,
      property.type === "house"
        ? "Casa"
        : property.type === "apartment"
        ? "Apartamento"
        : property.type === "land"
        ? "Terreno"
        : property.type === "building"
        ? "Prédio"
        : property.type,
      property.area.toString(),
      formatCurrency(property.value),
      property.status === "active"
        ? "Ativo"
        : property.status === "inactive"
        ? "Inativo"
        : "Pendente",
      property.ownerIds.length.toString(),
      formatDateOnly(property.createdAt),
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
