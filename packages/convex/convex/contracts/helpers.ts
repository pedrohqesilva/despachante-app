import type { Doc } from "../_generated/dataModel"
import { normalizeForSearch } from "../lib/utils"

type Contract = Doc<"contracts">

export function filterContractsBySearch(
  contracts: Contract[],
  search: string
): Contract[] {
  const searchLower = normalizeForSearch(search)

  return contracts.filter((contract) =>
    contract.name.toLowerCase().includes(searchLower)
  )
}
