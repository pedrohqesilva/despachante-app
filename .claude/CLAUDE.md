# Language Standards

## Code and Database Objects
- **Always use English** for:
  - Variable names
  - Function names
  - Class names
  - Interface/Type names
  - Database table names
  - Database column names
  - API endpoints (paths)
  - Object properties
  - File names (when possible)

## Comments and Documentation
- **Always use Portuguese (pt-BR)** for:
  - Code comments (`//`, `/* */`) - **only when necessary, avoid excessive comments**
  - Documentation strings
  - Error messages shown to users
  - UI text (labels, buttons, placeholders)
  - Commit messages

### Comment Guidelines
- **Only comment when necessary**: Code should be self-explanatory
- **Avoid obvious comments**: Don't comment what the code already clearly shows
- **Comment complex logic**: Explain "why" not "what" when the reason isn't obvious
- **Prefer clear code over comments**: Refactor unclear code instead of adding comments

## Examples

### ✅ GOOD - Code in English, Comments Only When Necessary

```typescript
// ✅ GOOD - Comment explains complex business logic
export const getActiveNotaryOffices = async (): Promise<NotaryOffice[]> => {
  // Filtra cartórios ativos e ordena por código para facilitar busca
  return await db.query("notaryOffices")
    .filter((office) => office.status === "active")
    .order("asc")
    .collect()
}
```

```typescript
// ✅ GOOD - No unnecessary comments, code is self-explanatory
export const getActiveNotaryOffices = async (): Promise<NotaryOffice[]> => {
  return await db.query("notaryOffices")
    .filter((office) => office.status === "active")
    .collect()
}
```

```typescript
interface NotaryOffice {
  _id: string
  name: string
  code: string
  address?: string
  city?: string
  state?: string
}
```

### ❌ BAD - Mixed Languages and Excessive Comments

```typescript
// ❌ BAD - Comment in English, function name in Portuguese, excessive comments
// Get all active notary offices
export const buscarCartoriosAtivos = async () => {
  // Filter active offices
  return await db.query("cartorios") // ❌ Table name in Portuguese
    .filter((cartorio) => cartorio.status === "ativo") // ❌ Variable and value in Portuguese
}
```

```typescript
// ❌ BAD - Excessive unnecessary comments
export const getActiveNotaryOffices = async (): Promise<NotaryOffice[]> => {
  // Busca todos os cartórios
  const allOffices = await db.query("notaryOffices").collect()
  // Filtra apenas os ativos
  const activeOffices = allOffices.filter((office) => office.status === "active")
  // Retorna o resultado
  return activeOffices
}
```

## Database Schema

```typescript
// ✅ GOOD - Comments only when field purpose isn't obvious
notaryOffices: defineTable({
  name: v.string(),
  code: v.string(),
  // Código único do cartório no sistema nacional (ex: 1º OFICIO)
  address: v.optional(v.string()),
  city: v.optional(v.string()),
})

// ❌ BAD
cartorios: defineTable({ // ❌ Table name in Portuguese
  nome: v.string(), // ❌ Column name in Portuguese
  codigo: v.string(),
})
```

## UI Text

```typescript
// ✅ GOOD - UI text in Portuguese, code in English
<Button onClick={handleSubmit}>
  Salvar Cartório
</Button>

// ❌ BAD
<Button onClick={salvarCartorio}> // ❌ Function name in Portuguese
  Save Notary Office // ❌ UI text in English
</Button>
```

## Design System Reference

When working with UI components, styling, or design patterns, **ALWAYS** check these reference files:

1. **`.cursor/rules/design.mdc`** - Complete design system documentation with:
   - Component patterns and structures
   - Semantic tokens (colors, spacing, typography)
   - Reusable components (StatusBadge, IconContainer, etc.)
   - Layout patterns (pages, dialogs, tables)
   - Best practices and consistency guidelines

2. **`apps/web/src/pages/StyleGuide.tsx`** - Visual style guide with:
   - Interactive examples of all components
   - Color swatches and tokens
   - Typography hierarchy
   - Icon sizes and variants
   - Spacing and layout tokens
   - Component patterns and structures

**When to check these files:**
- Before creating new UI components
- When implementing styling or layout
- When unsure about which component or pattern to use
- When adding new design tokens or patterns
- When reviewing code for design consistency

**IMPORTANT**: Always verify existing patterns before creating new ones. Reuse components and follow established structures to maintain consistency.

## External Documentation (Context7 MCP)

When you need up-to-date documentation for any library (React, Next.js, Convex, Tailwind, etc.), use the Context7 MCP tools:

1. **mcp__context7__resolve-library-id** - First, find the library ID
   - `libraryName`: "next.js", `query`: "what you need to know"

2. **mcp__context7__query-docs** - Then, query the documentation
   - `libraryId`: "/vercel/next.js", `query`: "server components usage"

**When to use:**
- When unsure about a library's API or best practices
- When implementing features that require specific library knowledge
- When debugging issues related to external libraries
- When the built-in knowledge might be outdated

## Specialized Agents

Use the specialized agents when working on specific areas of the application:

### Dev Specialist (Full-Stack)

**`.claude/agents/dev-specialist.md`** - Use for:
- Creating complete features from database to UI
- Implementing full CRUD operations end-to-end
- Building forms with validation on both frontend and backend
- Creating and modifying React/Next.js components
- Managing shadcn/ui components using MCP tools
- Implementing styling with Tailwind CSS 4
- Creating or modifying database schemas (Convex)
- Implementing queries and mutations
- Ensuring type consistency across all layers

**When to use:**
- Creating new features (schema + queries + mutations + components + hooks)
- Adding fields or functionality that spans both layers
- Refactoring features that involve frontend and/or backend
- Any frontend or backend development task

### CI/CD Specialist

**`.claude/agents/cicd-specialist.md`** - Use for:
- Configuring GitHub Actions workflows
- Managing Railway deployments and services
- Setting up environment variables and secrets
- Troubleshooting build and deployment failures
- Optimizing CI/CD pipeline performance
- Implementing deployment strategies

**When to use:**
- Setting up new deployment pipelines
- Debugging deployment failures
- Adding or modifying environment variables
- Optimizing build times
- Configuring new services in Railway
- Managing secrets and credentials

### Security Specialist

**`.claude/agents/security-specialist.md`** - Use for:
- Identifying OWASP Top 10 vulnerabilities
- Reviewing code for security flaws
- Auditing authentication and authorization implementations
- Analyzing dependencies for known CVEs
- Reviewing CI/CD security configurations
- Implementing secure coding patterns
- Configuring security headers

**When to use:**
- Performing security audits on the codebase
- Reviewing code for injection vulnerabilities (XSS, SQLi, etc.)
- Auditing authentication flows
- Checking for exposed secrets or credentials
- Validating input sanitization
- Ensuring secure data handling practices
- Before deploying to production

### How to Use Agents

1. Identify the task area:
   - **Development (frontend/backend)**: Use dev-specialist
   - **CI/CD**: Use cicd-specialist
   - **Security**: Use security-specialist
2. Reference the appropriate agent file for guidelines
3. Follow the architectural patterns described
4. Apply the language standards (English code, Portuguese UI/comments)
5. For security concerns, always involve the security-specialist agent

## Enforcement Rules

When writing or reviewing code, always ensure:
1. All code identifiers (variables, functions, classes, etc.) are in English
2. All database objects (tables, columns) are in English
3. Comments are in Portuguese and only added when necessary
4. UI text and user-facing messages are in Portuguese
5. Code is self-explanatory - prefer refactoring over adding comments
6. Complex business logic includes Portuguese comments explaining the "why"
7. Design patterns follow the guidelines in `design.mdc` and `StyleGuide.tsx`
8. **When editing any file, remove unnecessary comments** - delete obvious, redundant, or outdated comments that don't add value
9. **Read feature README before starting work** - always read the README.md of a feature before modifying it
10. **Always update feature README** - when modifying components, hooks, or types in a feature folder
11. **Check for existing components before creating new ones** - always search for existing components in `shared/components/`, `features/*/components/`, and shadcn/ui before creating a new component. Reuse and extend existing components instead of duplicating functionality

## Feature Documentation

Each feature in `apps/web/src/features/` has its own `README.md` that documents:
- Folder structure
- Components (props, usage)
- Hooks (return values, usage)
- Types (interfaces, enums)
- Backend integration (queries, mutations)
- Usage examples

### Before Starting Work on a Feature

**ALWAYS read the feature's README.md first** to understand:
1. Current folder structure and file organization
2. Existing components and their responsibilities
3. Available hooks and their APIs
4. Type definitions currently in use
5. Backend integration patterns (queries/mutations)

This ensures you have full context before making changes and helps maintain consistency with existing patterns.

### When to Update Feature README

**ALWAYS update the feature's README.md when:**
- Adding new components to the feature
- Modifying component props or behavior
- Adding or modifying hooks
- Changing types or interfaces
- Adding new exports to `index.ts`
- Changing backend integration (new queries/mutations)

### README Update Checklist

When modifying a feature, verify that the README reflects:
1. ✅ Current folder structure
2. ✅ All exported components with their props
3. ✅ All exported hooks with their return types
4. ✅ All exported types
5. ✅ Accurate usage examples
6. ✅ Current backend integration info

### Feature README Locations

```
apps/web/src/features/
├── clients/README.md
├── properties/README.md
└── notary-offices/README.md
```

**IMPORTANT**: Outdated documentation is worse than no documentation. Keep READMEs in sync with code changes.
