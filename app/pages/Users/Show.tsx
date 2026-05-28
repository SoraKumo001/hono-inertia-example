import { Head, Link } from '@inertiajs/react'
import type { PageProps } from '../../pages.gen'

export default function UsersShow({ user }: PageProps<'Users/Show'>) {
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
