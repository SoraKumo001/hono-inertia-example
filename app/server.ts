import { Hono } from 'hono'
import { inertia } from '@hono/inertia'
import { rootView } from './root-view'
import { registerRoutes } from './router'

const app = new Hono()

app.use(inertia({ rootView }))

registerRoutes(app)

export default app
