# hono-inertia-example

[Hono](https://hono.dev) + [Inertia.js](https://inertiajs.com) (React) on Cloudflare Workers.

## Pages

- `/` — Home
- `/users` — Users list
- `/users/:id` — User detail
- `/users/new` — Create user (with `@hono/zod-validator`)

## Develop

```sh
bun install
bun run dev
```

## Build & deploy

```sh
bun run build
bun run deploy
```

## SSR

- app/root-view.tsx

```tsx
import { renderToString } from 'react-dom/server';
import { Link, Script, ViteClient } from 'vite-ssr-components/react';
import { type RootView } from '@hono/inertia';
import {
  createInertiaApp,
  usePage,
  type ResolvedComponent,
} from '@inertiajs/react';

type Page = ReturnType<typeof usePage>;

const pages = import.meta.glob('./pages/**/*.tsx', { eager: true });

export const rootView: RootView = async (page) => {
  const res = await createInertiaApp({
    page: page as Page,
    render: renderToString,
    resolve: async (name) => {
      const pages = import.meta.glob<{ default: ResolvedComponent }>(
        './pages/**/*.tsx',
      );
      const page = await pages[`./pages/${name}.tsx`]();
      return page.default;
    },
    setup: ({ App, props }) => <App {...props} />,
  });

  const { head, body } = res;
  return (
    '<!DOCTYPE html>\n' +
    renderToString(
      <html>
        <head>
          <ViteClient />
          <Link rel='stylesheet' href='/app/styles.css' />
          <Script src='/app/client.tsx' />
          <body dangerouslySetInnerHTML={{ __html: head }} />
        </head>
        <body dangerouslySetInnerHTML={{ __html: body }} />
      </html>,
    )
  );
};
```

## Cross-page state sharing

- app/components/context.tsx

```tsx
import { createContext, useContext, useRef } from 'react';
import { useSyncExternalStore } from 'react';
import { usePage } from '@inertiajs/react';

export type ContextType<T> = {
  state: T;
  storeChanges: Set<() => void>;
  dispatch: (callback: (state: T) => T) => void;
  subscribe: (onStoreChange: () => void) => () => void;
};

export const createStoreContext = <T,>(s: T) => {
  const context = useRef<ContextType<T>>({
    state: s,
    storeChanges: new Set(),
    dispatch: (callback) => {
      context.state = callback(context.state);
      context.storeChanges.forEach((storeChange) => storeChange());
      globalState = context.state as never;
    },
    subscribe: (onStoreChange) => {
      context.storeChanges.add(onStoreChange);
      return () => {
        context.storeChanges.delete(onStoreChange);
      };
    },
  }).current;
  return context;
};

export const StoreContext = createContext<ContextType<any>>(undefined as never);

var globalState: Record<string, unknown> | undefined;

export const StoreProvider = <T extends Record<string, unknown>>({
  children,
  initState,
}: {
  children: React.ReactNode;
  initState: () => T;
}) => {
  if (!globalState) {
    globalState = Object.assign({}, initState());
  }
  const context = createStoreContext(globalState);
  return (
    <StoreContext.Provider value={context}>{children}</StoreContext.Provider>
  );
};

export const useSelector = <T, R>(getSnapshot: (state: T) => R) => {
  const context = useContext<ContextType<T>>(StoreContext);
  return useSyncExternalStore(
    context.subscribe,
    () => getSnapshot(context.state),
    () => getSnapshot(context.state),
  );
};

export const useDispatch = <T,>() => {
  const context = useContext<ContextType<T>>(StoreContext);
  return context.dispatch;
};

export const useSharedState = <T extends Record<string, unknown>>() => {
  const page = usePage();
  const state = page.props.sharedState ?? {};
  return {
    state,
    dispatch: (callback: (state: T) => T) => {
      page.props.sharedState = callback(page.props.sharedState);
    },
  };
};
```

- app/components/counter.tsx

```tsx
import { useEffect } from 'react';
import { useDispatch, useSelector } from './context';

export const Counter = () => {
  const count = useSelector((state: { count: number }) => state.count);
  const dispatch = useDispatch<{ count: number }>();
  useEffect(() => {
    const handle = setInterval(() => {
      dispatch((v) => ({ ...v, count: v.count + 1 }));
    }, 1000);
    return () => clearInterval(handle);
  }, []);
  return <div>count:{count}</div>;
};
```
