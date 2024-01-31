import { MetadataRoute } from 'next'
// import and parse static-routes.json
import * as staticRoutes from './static-routes.json' 

const nonIndexableRouteTypes = ['cart', 'account']

const disallow = staticRoutes
    .filter(route => nonIndexableRouteTypes.includes(route.type))
    .map(route => route.route)

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow
    },
  }
}