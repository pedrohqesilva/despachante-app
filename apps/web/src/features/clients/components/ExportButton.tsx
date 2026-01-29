import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Client } from "@/types/client"
import { formatTaxId, formatPhone, formatDateOnly } from "@/lib/format"

interface ExportButtonProps {
  clients: Client[]
  disabled?: boolean
}

export function ExportButton({ clients, disabled }: ExportButtonProps) {
  const handleExport = () => {
    if (clients.length === 0) return

    const headers = ["Nome", "Email", "Telefone", "CPF/CNPJ", "Status", "Data de Cadastro"]
    const rows = clients.map((client) => [
      client.name,
      client.email,
      client.phone ? formatPhone(client.phone) : "-",
      formatTaxId(client.taxId),
      client.status === "active"
        ? "Ativo"
        : client.status === "inactive"
        ? "Inativo"
        : "Pendente",
      formatDateOnly(client._creationTime),
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
    link.setAttribute("download", `clientes_${new Date().toISOString().split("T")[0]}.csv`)
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
      disabled={disabled || clients.length === 0}
    >
      <Download className="mr-2 h-4 w-4" />
      Exportar CSV
    </Button>
  )
}
