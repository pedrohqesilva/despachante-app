import { Id } from "../../convex/_generated/dataModel"

export type ClientStatus = "active" | "inactive" | "pending"

export interface Client {
  _id: Id<"clients">
  name: string
  email: string
  phone?: string
  taxId: string
  status: ClientStatus
  createdAt: number
  updatedAt: number
}

export interface ClientFilters {
  search?: string
  status?: ClientStatus
}

export interface ClientPagination {
  page: number
  pageSize: number
}

export interface ClientListResponse {
  clients: Client[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
