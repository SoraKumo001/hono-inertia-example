import type { Hono } from 'hono'
import { type InertiaPages } from '@hono/inertia'
import type { ResolvedComponent } from '@inertiajs/react'

export function registerRoutes(app: Hono) {
  // Scan pages directory to dynamically import routes, loaders, and actions
  const pages = import.meta.glob<{
    default: ResolvedComponent
    route?: { path: string; method?: string }
    loader?: (c: any) => any
    action?: { path: string; method?: string; handler: any | any[] }
  }>('./pages/**/*.tsx', { eager: true })

  function getComponentName(filePath: string): string {
    // e.g. "./pages/Users/Index.tsx" -> "Users/Index"
    return filePath
      .replace('./pages/', '')
      .replace('.tsx', '')
  }

  for (const filePath in pages) {
    const mod = pages[filePath]
    const componentName = getComponentName(filePath)

    // Register GET route (route & loader)
    if (mod.route) {
      const { path, method = 'get' } = mod.route
      
      app.on([method], [path], async (c) => {
        let props = {}
        if (mod.loader) {
          const result = await mod.loader(c)
          // If loader returns a Response (like c.notFound() or c.redirect()), return it directly
          if (result instanceof Response) {
            return result
          }
          props = result
        }
        return c.render(componentName as keyof InertiaPages, props)
      })
    }

    // Register POST / PUT etc Action route (action)
    if (mod.action) {
      const { path, method = 'post', handler } = mod.action
      const handlers = Array.isArray(handler) ? handler : [handler]
      app.on([method], [path], ...handlers)
    }
  }
}
