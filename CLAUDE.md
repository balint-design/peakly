# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands
- Build: `npm run build`
- Dev server: `npm run dev`
- Lint: `npm run lint`
- Preview: `npm run preview`

## Code Style
- **Imports:** React first, then third-party libs, then local imports
- **Components:** Named function declarations `export function Component()`
- **Types:** Explicit interfaces for props, PascalCase for types
- **Naming:** PascalCase for components/interfaces, camelCase for variables/functions
- **Formatting:** Use TypeScript strict mode, avoid unused variables/parameters
- **Error handling:** try/catch for async, toast notifications for user feedback

## Project Structure
- React + TypeScript + Vite application with Tailwind CSS
- Supabase for backend services
- ESLint for code quality with TypeScript-ESLint integration
- Target ES2020 with strict TypeScript configuration