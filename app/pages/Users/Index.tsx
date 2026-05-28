import { Head, Link } from '@inertiajs/react';
import { listUsers, type User } from '../../data';

export const route = {
  path: '/users',
  method: 'get' as const,
};

export const loader = async () => {
  return { users: listUsers() };
};

type Props = {
  users: User[];
};

export default function UsersIndex({ users }: Props) {
  return (
    <>
      <Head title='Users' />
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
    </>
  );
}
