import { Head, Link, useForm } from '@inertiajs/react'
import type { PageProps } from '../../pages.gen'

export default function UsersNew({ values, errors }: PageProps<'Users/New'>) {
  const form = useForm({
    name: values?.name ?? '',
    email: values?.email ?? '',
    bio: values?.bio ?? ''
  })

  const fieldErrors = errors

  return (
    <>
      <Head title="New user" />
      <p>
        <Link href="/users">← Back to users</Link>
      </p>
      <h1>New user</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          form.post('/users')
        }}
      >
        <div>
          <label htmlFor="name">Name</label>
          <input id="name" type="text" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} />
          {fieldErrors.name && <p className="error">{fieldErrors.name}</p>}
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={form.data.email}
            onChange={(e) => form.setData('email', e.target.value)}
          />
          {fieldErrors.email && <p className="error">{fieldErrors.email}</p>}
        </div>
        <div>
          <label htmlFor="bio">Bio</label>
          <textarea id="bio" value={form.data.bio} onChange={(e) => form.setData('bio', e.target.value)} />
          {fieldErrors.bio && <p className="error">{fieldErrors.bio}</p>}
        </div>
        <button type="submit" disabled={form.processing}>
          Create
        </button>
      </form>
    </>
  )
}
