import { Id } from "../../convex/_generated/dataModel"

export type NotaryOfficeStatus = "active" | "inactive"

export interface NotaryOffice {
  _id: Id<"notaryOffices">
  name: string
  code: string
  zipCode?: string
  street?: string
  number?: string
  complement?: string
  neighborhood?: string
  city?: string
  state?: string
  phone?: string
  email?: string
  status: NotaryOfficeStatus
  createdAt: number
  updatedAt: number
}

export interface CreateNotaryOfficeDTO {
  name: string
  code: string
  zipCode?: string
  street?: string
  number?: string
  complement?: string
  neighborhood?: string
  city?: string
  state?: string
  phone?: string
  email?: string
  status?: NotaryOfficeStatus
}

export interface UpdateNotaryOfficeDTO extends Partial<CreateNotaryOfficeDTO> {}
