import { api } from "@despachante/convex/_generated/api"

export const clientsApi = {
  queries: api.clients.queries,
  mutations: api.clients.mutations,
}

export const clientDocumentsApi = {
  queries: api.clientDocuments.queries,
  mutations: api.clientDocuments.mutations,
}

export const propertiesApi = {
  queries: api.properties.queries,
  mutations: api.properties.mutations,
}

export const propertyDocumentsApi = {
  queries: api.propertyDocuments.queries,
  mutations: api.propertyDocuments.mutations,
}

export const notaryOfficesApi = {
  queries: api.notaryOffices.queries,
  mutations: api.notaryOffices.mutations,
}

export const usersApi = {
  queries: api.users.queries,
  mutations: api.users.mutations,
}

export const contractTemplatesApi = {
  queries: api.contractTemplates.queries,
  mutations: api.contractTemplates.mutations,
}

export const contractsApi = {
  queries: api.contracts.queries,
  mutations: api.contracts.mutations,
}
