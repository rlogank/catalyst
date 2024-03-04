import { cache } from 'react';

import { client } from '..';
import { WEB_PAGE_FRAGMENT } from '../fragments/web-page';
import { graphql } from '../graphql';
import { revalidate } from '../revalidate-target';

const GET_WEB_PAGE_QUERY = /* GraphQL */ `
  query getWebPage($path: String!, $characterLimit: Int = 120) {
    site {
      route(path: $path) {
        node {
          ... on ContactPage {
            contactFields
            path
            htmlBody
            plainTextSummary(characterLimit: $characterLimit)
            renderedRegions {
              regions {
                name
                html
              }
            }
            seo {
              pageTitle
              metaKeywords
              metaDescription
            }
            ...WebPage
          }
          ... on NormalPage {
            htmlBody
            plainTextSummary(characterLimit: $characterLimit)
            renderedRegions {
              regions {
                name
                html
              }
            }
            seo {
              pageTitle
              metaKeywords
              metaDescription
            }
            ...WebPage
          }
        }
      }
    }
  }
`;

export interface Options {
  path: string;
  characterLimit?: number;
}

export const getWebPage = cache(async ({ path, characterLimit = 120 }: Options) => {
  const query = graphql(GET_WEB_PAGE_QUERY, [graphql(WEB_PAGE_FRAGMENT)]);

  const response = await client.fetch({
    document: query,
    variables: { path, characterLimit },
    fetchOptions: { next: { revalidate } },
  });

  const webpage = response.data.site.route.node;

  if (!webpage) {
    return undefined;
  }

  switch (webpage.__typename) {
    case 'ContactPage':
    case 'NormalPage':
      return webpage;

    default:
      return undefined;
  }
});
