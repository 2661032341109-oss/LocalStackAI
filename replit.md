# Overview

This is a full-stack database management application called "LocalBase" that provides both SQL editing and visual table editing capabilities. The application features a React frontend with a Node.js/Express backend, designed to work with both local SQLite databases and remote PostgreSQL databases. It includes AI-powered SQL query assistance, real-time WebSocket communication, and a modern dark-themed UI built with shadcn/ui components.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript, using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Framework**: shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **Component Structure**: Feature-based organization with separate directories for AI, database, editors, layout, and UI components

## Backend Architecture
- **Runtime**: Node.js with Express.js framework using TypeScript
- **Database Layer**: Dual database support with Drizzle ORM - SQLite (better-sqlite3) for local development and PostgreSQL with Neon for production
- **API Design**: RESTful endpoints with WebSocket support for real-time AI chat functionality
- **Database Services**: Abstracted database operations through service classes supporting both SQLite and PostgreSQL
- **Storage Abstraction**: Interface-based storage layer allowing for easy switching between different database backends

## Key Features
- **Dual Editor Modes**: SQL query editor with syntax highlighting and table editor for visual data manipulation
- **AI Integration**: OpenAI GPT-4o integration for SQL query generation, optimization, and explanation
- **Real-time Communication**: WebSocket connection for live AI chat assistance
- **Command Palette**: Keyboard-driven interface (Ctrl/Cmd+K) for quick navigation and actions
- **Query Management**: Save, load, and manage SQL queries with user association
- **Table Management**: View table schemas, browse data with pagination, and edit records inline

## External Dependencies

- **Database**: 
  - Neon PostgreSQL for production database hosting
  - Better-sqlite3 for local development database
  - Drizzle ORM for type-safe database operations and migrations
- **AI Services**: OpenAI API for SQL query assistance and natural language processing
- **UI Libraries**: 
  - Radix UI for accessible component primitives
  - Tailwind CSS for utility-first styling
  - Lucide React for consistent iconography
- **Development Tools**: 
  - Vite for fast development and building
  - TypeScript for type safety
  - ESBuild for server-side bundling
- **Communication**: WebSocket (ws) for real-time AI chat functionality
- **Authentication**: Session-based authentication with connect-pg-simple for PostgreSQL session storage