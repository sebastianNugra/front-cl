# Calculadora Frontend

Web-based calculator with operation history. Built with Angular 22, Tailwind CSS v4, and TypeScript 6.

## Tech Stack

| Technology | Purpose |
|---|---|
| Angular 22 | Framework (standalone components, signals, control flow) |
| Tailwind CSS v4 | Utility-first styling |
| TypeScript 6 | Language |
| Vitest | Unit testing |
| Prettier | Code formatting |

## Features

- **Calculator** — Numpad grid with keyboard support (digits, `+ - * /`, Enter, Esc, Backspace)
- **History** — Paginated table with operation type badges and delete confirmation modal
- **Detail** — Single operation view with full expression and result
- **Dark mode** — Toggle persisted in localStorage, respects system preference
- **View Transitions** — Smooth page fade animations

## Project Structure

```
src/app/
├── app.ts / app.html / app.scss    # Root shell (navbar + dark mode)
├── app.routes.ts                   # Lazy-loaded routes
├── app.config.ts                   # Providers (router, HttpClient)
├── models/
│   └── operacion.model.ts          # Interfaces + helper functions
├── core/services/
│   └── operacion.service.ts        # HTTP service for API calls
└── pages/
    ├── calculadora/                 # Calculator page
    ├── historial/                   # History list page
    │   └── detalle/                 # Operation detail page
```

## Routes

| Path | Component |
|---|---|
| `/` | Calculadora |
| `/historial` | Historial |
| `/historial/:id` | Detalle |

## Getting Started

### Prerequisites

- Node.js + npm 11.13.0
- Backend API running at `http://localhost:8080`

### Install & Run

```bash
npm install
npm start
```

Opens at `http://localhost:4200/`

### Commands

| Command | Description |
|---|---|
| `npm start` | Dev server with live reload |
| `npm run build` | Production build |
| `npm test` | Run unit tests |

## API Configuration

The frontend connects to the backend at:

```
http://localhost:8080/api/v1/operaciones
```

Configured in `src/environments/environment.ts`.
