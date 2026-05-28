import { Head, Link } from '@inertiajs/react'
import { findUser, type User } from '../../data'
import type { Context } from 'hono'

export const route = {
  path: '/users/:id{[0-9]+}',
  method: 'get' as const,
}

export const loader = async (c: Context) => {
  const id = Number(c.req.param('id'))
  const user = findUser(id)
  if (!user) return c.notFound()
  return { user }
}

type Props = {
  user: User
}

export default function UsersShow({ user }: Props) {
  return (
    <>
      <Head title={user.name} />
      <p>
        <Link href="/users">← Back to users</Link>
      </p>
      <h1>{user.name}</h1>
      <dl>
        <dt>Email</dt>
        <dd>{user.email}</dd>
        <dt>Bio</dt>
        <dd>{user.bio}</dd>
      </dl>
    </>
  )
}
