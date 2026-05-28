import { Head, Link, useForm } from '@inertiajs/react'
import { z } from 'zod'
import { createUser } from '../../data'
import type { Context } from 'hono'

export const userInput = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  bio: z.string().max(200, 'Bio must be 200 characters or less').optional().default('')
})

export const route = {
  path: '/users/new',
  method: 'get' as const,
}

export const loader = async () => {
  return {
    values: { name: '', email: '', bio: '' },
    errors: {} as Record<string, string>
  }
}

export const action = {
  path: '/users',
  method: 'post' as const,
  handler: async (c: Context) => {
    const body = await c.req.parseBody()
    const result = userInput.safeParse(body)

    if (!result.success) {
      const fieldErrors = z.flattenError(result.error).fieldErrors
      const errors: Record<string, string> = {}
      for (const [key, messages] of Object.entries(fieldErrors)) {
        if (messages && messages.length > 0) errors[key] = messages[0]
      }
      const raw = body ?? {}
      return c.render('Users/New', {
        values: {
          name: typeof raw.name === 'string' ? raw.name : '',
          email: typeof raw.email === 'string' ? raw.email : '',
          bio: typeof raw.bio === 'string' ? raw.bio : ''
        },
        errors
      })
    }

    const input = result.data
    const user = createUser(input)
    return c.redirect(`/users/${user.id}`, 303)
  }
}

type Props = {
  values: { name: string; email: string; bio: string }
  errors: Record<string, string>
}

export default function UsersNew({ values, errors }: Props) {
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
