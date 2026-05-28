# Hono + Inertia.js (React) Example

This is an example application showcasing [Hono](https://hono.dev) combined with [Inertia.js](https://inertiajs.com) (React) running on Cloudflare Workers.

It implements modern conventions like **Persistent Layouts** to maintain client-side state across navigation, and a **Remix-like dynamic routing system (Loader / Action pattern)**.

## Pages
- `/` — Home
- `/users` — Users list
- `/users/:id` — User detail
- `/users/new` — Create user (with `@hono/zod-validator`)

---

## Development

Install dependencies and start the local development server:

```sh
pnpm install
pnpm run dev
```

## Build & Deploy

Verify types, compile client/server bundles, and deploy to Cloudflare Workers:

```sh
pnpm run typecheck
pnpm run build
pnpm run deploy
```

---

## Key Features & Architecture

### 1. Server-Side Rendering (SSR)
The initial HTML document is rendered on the server side using React's `renderToString` within Hono's middleware lifecycle.

- **`app/root-view.tsx`**: Renders the outer HTML shell that mounts the Inertia React application.

```tsx
import { renderToString } from "react-dom/server";
import { Link, Script, ViteClient } from "vite-ssr-components/react";
import { type RootView } from "@hono/inertia";
import {
  createInertiaApp,
  usePage,
  type ResolvedComponent,
} from "@inertiajs/react";

type Page = ReturnType<typeof usePage>;

export const rootView: RootView = async (page) => {
  const res = await createInertiaApp({
    page: page as Page,
    render: renderToString,
    resolve: async (name) => {
      const pages = import.meta.glob<{ default: ResolvedComponent }>(
        "./pages/**/*.tsx",
      );
      const page = await pages[`./pages/${name}.tsx`]();
      return page.default;
    },
    setup: ({ App, props }) => <App {...props} />,
  });

  const { head, body } = res;
  return (
    "<!DOCTYPE html>\n" +
    renderToString(
      <html>
        <head>
          <ViteClient />
          <Link rel="stylesheet" href="/app/styles.css" />
          <Script src="/app/client.tsx" />
          <body dangerouslySetInnerHTML={{ __html: head }} />
        </head>
        <body dangerouslySetInnerHTML={{ __html: body }} />
      </html>,
    )
  );
};
```

---

### 2. Persistent Layouts
To maintain state across page transitions (e.g., navigation menus, global loaders, or a ticking counter), we use Inertia's **Persistent Layouts**.

- **`app/client.tsx`**: Sets up the persistent layout inside `resolve` so that the `Layout` component is not unmounted and remounted during navigation.

```tsx
import { createInertiaApp, type ResolvedComponent } from "@inertiajs/react";
import { hydrateRoot } from "react-dom/client";
import type { ReactNode } from "react";
import Layout from "./pages/Layout";

createInertiaApp({
  resolve: async (name) => {
    const pages = import.meta.glob<{ default: ResolvedComponent }>(
      "./pages/**/*.tsx",
    );
    const page = await pages[`./pages/${name}.tsx`]();
    // Wrap pages in a persistent layout if no custom layout is defined
    page.default.layout = page.default.layout || ((page: ReactNode) => <Layout>{page}</Layout>);
    return page.default;
  },
  setup({ el, App, props }) {
    hydrateRoot(el, <App {...props} />);
  },
});
```

Because `Layout` remains mounted during page transitions, the `Counter` component embedded in `Layout` maintains its current state (the counts are not reset to zero).

---

### 3. Remix-like Loader / Action Routing
We've integrated a dynamic routing system where page components encapsulate their routing paths, server-side data fetching (`loader`), and data submission (`action`).

#### Router Logic ([router.ts](file:///c:/prog/test/hono-inertia-example/app/router.ts))
The routing registry scans the `pages` directory using Vite's `import.meta.glob`, reading metadata from page exports to dynamically mount Hono routes:

```typescript
for (const filePath in pages) {
  const mod = pages[filePath]
  const componentName = getComponentName(filePath)

  // Dynamically register GET routes (routing & loader props)
  if (mod.route) {
    const { path, method = 'get' } = mod.route
    app.on([method], [path], async (c) => {
      let props = {}
      if (mod.loader) {
        const result = await mod.loader(c)
        if (result instanceof Response) return result // Directly bypass responses (like 404 / redirects)
        props = result
      }
      return c.render(componentName as keyof InertiaPages, props)
    })
  }

  // Dynamically register Action routes (POST/PUT/etc)
  if (mod.action) {
    const { path, method = 'post', handler } = mod.action
    const handlers = Array.isArray(handler) ? handler : [handler]
    app.on([method], [path], ...handlers)
  }
}
```

#### Page Component Implementation Example ([Index.tsx](file:///c:/prog/test/hono-inertia-example/app/pages/Users/Index.tsx))
Page files export their path definition (`route`), fetching mechanism (`loader`), and the React view component:

```tsx
import type { Context } from 'hono'
import { listUsers, type User } from '../../data'

// Route configurations
export const route = {
  path: '/users',
  method: 'get' as const
}

// Server-side loader
export const loader = async (c: Context) => {
  return { users: listUsers() }
}

// React component rendering the page
type Props = { users: User[] }
export default function UsersIndex({ users }: Props) {
  return (
    <>
      <h1>Users</h1>
      <ul>
        {users.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </>
  )
}
```

This dynamic approach keeps code highly maintainable by grouping related UI and backend logic together in single files, and eliminates the need to manually declare routing inside [server.ts](file:///c:/prog/test/hono-inertia-example/app/server.ts).


