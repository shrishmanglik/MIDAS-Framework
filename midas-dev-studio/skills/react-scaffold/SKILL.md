---
name: react-scaffold
description: "Generate a complete React/Next.js project structure from architecture specs. Template-based for boilerplate, Tier 3 for page-specific UI logic. Triggers on: frontend scaffolding, React/Next.js project setup."
---

# React/Next.js Scaffold

Generate a production-ready Next.js 14+ project with App Router.

## Standard Structure

```
frontend/
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
├── public/
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Root layout with providers
│   │   ├── page.tsx             # Home page
│   │   ├── globals.css          # Global styles + Tailwind imports
│   │   ├── login/
│   │   │   └── page.tsx         # Login page
│   │   ├── register/
│   │   │   └── page.tsx         # Register page
│   │   └── [resource]/
│   │       ├── page.tsx         # List page
│   │       └── [id]/
│   │           └── page.tsx     # Detail page
│   ├── components/
│   │   ├── ui/                  # Generic UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   └── ErrorMessage.tsx
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Sidebar.tsx
│   │   └── [feature]/           # Feature-specific components
│   ├── hooks/
│   │   ├── useAuth.ts           # Auth state management
│   │   └── use[Entity].ts      # Data fetching per entity
│   ├── lib/
│   │   ├── api.ts               # Typed API client
│   │   ├── auth.ts              # Token management
│   │   └── utils.ts             # Shared utilities
│   └── types/
│       └── index.ts             # Shared TypeScript types
```

## Template: package.json (dependencies)

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.3.0"
  }
}
```

## Template: Root Layout

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "{project_name}",
  description: "{project_summary}",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
```

## Template: API Client

```typescript
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

class ApiClient {
  private getHeaders(): HeadersInit {
    const token = typeof window !== "undefined"
      ? localStorage.getItem("access_token")
      : null;
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async get<T>(path: string): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, { headers: this.getHeaders() });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  }

  async post<T>(path: string, data: unknown): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  }

  // put, delete methods follow same pattern
}

export const api = new ApiClient();
```

## Generation Rules

1. **Tier 1 (template):** package.json, tsconfig, tailwind config, layout, API client, auth utils
2. **Tier 1 (template):** Generic UI components (Button, Input, Card, Loading, Error)
3. **Tier 3 (LLM):** Page components (require project-specific UI logic)
4. **Tier 3 (LLM):** Feature-specific components (require business logic understanding)
