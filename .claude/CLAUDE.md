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

## Subagent Usage

When working on frontend development tasks, **use the Next.js Frontend Specialist subagent** when necessary:

**`.cursor/agents/nextjs-frontend-specialist.md`** - Specialized agent for:
- Creating and modifying React/Next.js components
- Managing shadcn/ui components using MCP tools
- Implementing styling with Tailwind CSS 4
- Structuring applications with clean and modular architecture
- Applying SOLID principles in frontend
- Organizing code following Feature-Sliced Design patterns
- Implementing layouts and UI features
- Ensuring accessibility and UX best practices

**When to use this subagent:**
- When creating new UI components or features
- When implementing complex frontend architecture
- When working with shadcn/ui components
- When structuring frontend code organization
- When implementing design patterns and layouts
- When needing specialized frontend expertise

**How to use:**
- Reference the subagent file for detailed guidelines and workflows
- Follow the MCP tool usage patterns for shadcn components
- Apply the architectural patterns and best practices described

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
