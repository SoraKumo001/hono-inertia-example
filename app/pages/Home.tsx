import { Head } from '@inertiajs/react';
import type { PageProps } from '../pages.gen';
import Layout from './Layout';
import { useSelector } from '../components/context';
import { Counter } from '../components/counter';

export default function Home({ message }: PageProps<'Home'>) {
  return (
    <Layout>
      <Head title='Home' />
      <Counter />
      <h1>{message}</h1>
    </Layout>
  );
}
