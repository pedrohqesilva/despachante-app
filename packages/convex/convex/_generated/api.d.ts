/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as clientDocuments_helpers from "../clientDocuments/helpers.js";
import type * as clientDocuments_index from "../clientDocuments/index.js";
import type * as clientDocuments_mutations from "../clientDocuments/mutations.js";
import type * as clientDocuments_queries from "../clientDocuments/queries.js";
import type * as clients_helpers from "../clients/helpers.js";
import type * as clients_index from "../clients/index.js";
import type * as clients_mutations from "../clients/mutations.js";
import type * as clients_queries from "../clients/queries.js";
import type * as contractTemplates_helpers from "../contractTemplates/helpers.js";
import type * as contractTemplates_index from "../contractTemplates/index.js";
import type * as contractTemplates_mutations from "../contractTemplates/mutations.js";
import type * as contractTemplates_queries from "../contractTemplates/queries.js";
import type * as contracts_helpers from "../contracts/helpers.js";
import type * as contracts_index from "../contracts/index.js";
import type * as contracts_mutations from "../contracts/mutations.js";
import type * as contracts_queries from "../contracts/queries.js";
import type * as http from "../http.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_errors from "../lib/errors.js";
import type * as lib_index from "../lib/index.js";
import type * as lib_utils from "../lib/utils.js";
import type * as lib_validators from "../lib/validators.js";
import type * as notaryOffices_helpers from "../notaryOffices/helpers.js";
import type * as notaryOffices_index from "../notaryOffices/index.js";
import type * as notaryOffices_mutations from "../notaryOffices/mutations.js";
import type * as notaryOffices_queries from "../notaryOffices/queries.js";
import type * as properties_helpers from "../properties/helpers.js";
import type * as properties_index from "../properties/index.js";
import type * as properties_mutations from "../properties/mutations.js";
import type * as properties_queries from "../properties/queries.js";
import type * as propertyDocuments_mutations from "../propertyDocuments/mutations.js";
import type * as propertyDocuments_queries from "../propertyDocuments/queries.js";
import type * as users_index from "../users/index.js";
import type * as users_mutations from "../users/mutations.js";
import type * as users_queries from "../users/queries.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  "clientDocuments/helpers": typeof clientDocuments_helpers;
  "clientDocuments/index": typeof clientDocuments_index;
  "clientDocuments/mutations": typeof clientDocuments_mutations;
  "clientDocuments/queries": typeof clientDocuments_queries;
  "clients/helpers": typeof clients_helpers;
  "clients/index": typeof clients_index;
  "clients/mutations": typeof clients_mutations;
  "clients/queries": typeof clients_queries;
  "contractTemplates/helpers": typeof contractTemplates_helpers;
  "contractTemplates/index": typeof contractTemplates_index;
  "contractTemplates/mutations": typeof contractTemplates_mutations;
  "contractTemplates/queries": typeof contractTemplates_queries;
  "contracts/helpers": typeof contracts_helpers;
  "contracts/index": typeof contracts_index;
  "contracts/mutations": typeof contracts_mutations;
  "contracts/queries": typeof contracts_queries;
  http: typeof http;
  "lib/auth": typeof lib_auth;
  "lib/errors": typeof lib_errors;
  "lib/index": typeof lib_index;
  "lib/utils": typeof lib_utils;
  "lib/validators": typeof lib_validators;
  "notaryOffices/helpers": typeof notaryOffices_helpers;
  "notaryOffices/index": typeof notaryOffices_index;
  "notaryOffices/mutations": typeof notaryOffices_mutations;
  "notaryOffices/queries": typeof notaryOffices_queries;
  "properties/helpers": typeof properties_helpers;
  "properties/index": typeof properties_index;
  "properties/mutations": typeof properties_mutations;
  "properties/queries": typeof properties_queries;
  "propertyDocuments/mutations": typeof propertyDocuments_mutations;
  "propertyDocuments/queries": typeof propertyDocuments_queries;
  "users/index": typeof users_index;
  "users/mutations": typeof users_mutations;
  "users/queries": typeof users_queries;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
