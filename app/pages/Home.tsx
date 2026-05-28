import { Head } from "@inertiajs/react";
import type { PageProps } from "../pages.gen";

export default function Home({ message }: PageProps<"Home">) {
  return (
    <>
      <Head title="Home" />
      <h1>{message}</h1>
    </>
  );
}
