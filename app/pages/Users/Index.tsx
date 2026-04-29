import { Head, Link } from '@inertiajs/react';
import type { PageProps } from '../../pages.gen';
import Layout from '../Layout';
import { Counter } from '../../components/counter';

export default function UsersIndex({ users }: PageProps<'Users/Index'>) {
  return (
    <Layout>
      <Head title='Users' />
      <Counter />
      <h1>Users</h1>
      <p>
        <Link href='/users/new'>+ New user</Link>
      </p>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            <Link href={`/users/${user.id}`}>{user.name}</Link> &lt;{user.email}
            &gt;
          </li>
        ))}
      </ul>
    </Layout>
  );
}
