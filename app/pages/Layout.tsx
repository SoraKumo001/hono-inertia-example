import { Link } from "@inertiajs/react";
import type { PropsWithChildren } from "react";
import { Counter } from "../components/counter";

export default function Layout({ children }: PropsWithChildren) {
  return (
    <div className="app">
      <header>
        <nav>
          <Link href="/">Home</Link>
          {" | "}
          <Link href="/users">Users</Link>
        </nav>
        <Counter />
      </header>
      <main>{children}</main>
    </div>
  );
}
