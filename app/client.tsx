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
    page.default.layout = page.default.layout || ((page: ReactNode) => <Layout>{page}</Layout>);
    return page.default;
  },
  setup({ el, App, props }) {
    hydrateRoot(el, <App {...props} />);
  },
});
