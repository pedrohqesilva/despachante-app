import type { Doc } from "../_generated/dataModel"
import { normalizeForSearch } from "../lib/utils"

type ContractTemplate = Doc<"contractTemplates">

export function filterContractTemplatesBySearch(
  templates: ContractTemplate[],
  search: string
): ContractTemplate[] {
  const searchLower = normalizeForSearch(search)

  return templates.filter(
    (template) =>
      template.name.toLowerCase().includes(searchLower) ||
      (template.description && template.description.toLowerCase().includes(searchLower))
  )
}
