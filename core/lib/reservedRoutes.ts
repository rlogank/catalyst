import routes from '~/routes.json';

let ThirdPartyRoutes: { route: string }[] = [];

export const reservedRoutes = [
    ...routes,
    ...ThirdPartyRoutes,
]
