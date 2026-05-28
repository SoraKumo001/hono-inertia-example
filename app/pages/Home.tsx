import { Head } from "@inertiajs/react";

export const route = {
  path: "/",
  method: "get" as const,
};

export const loader = async () => {
  return { message: "Hono x Inertia" };
};

type Props = {
  message: string;
};

export default function Home({ message }: Props) {
  return (
    <>
      <Head title="Home" />
      <h1>{message}</h1>
    </>
  );
}
