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
  const html = renderToString(
    <html>
      <head>
        <ViteClient />
        <Link rel="stylesheet" href="/app/styles.css" />
        <Script src="/app/client.tsx" />
        <meta name="inertia-head-placeholder" />
      </head>
      <body dangerouslySetInnerHTML={{ __html: body }} />
    </html>,
  );

  return (
    "<!DOCTYPE html>\n" +
    html.replace('<meta name="inertia-head-placeholder"/>', head.join("\n"))
  );
};
