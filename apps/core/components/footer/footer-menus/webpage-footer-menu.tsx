import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import React from 'react';

import { FragmentOf, graphql, readFragment, ResultOf } from '~/tada/graphql';

import { BaseFooterMenu } from '../footer-menus';

export const WebpageFooterMenuFragment = graphql(`
  fragment WebpageFooterMenuFragment on Content {
    pages {
      edges {
        node {
          __typename
          name
          isVisibleInNavigation
          ... on RawHtmlPage {
            path
          }
          ... on ContactPage {
            path
          }
          ... on NormalPage {
            path
          }
          ... on BlogIndexPage {
            path
          }
          ... on ExternalLinkPage {
            link
          }
        }
      }
    }
  }
`);

interface Props {
  data: FragmentOf<typeof WebpageFooterMenuFragment>;
}

export const WebPageFooterMenu = ({ data }: Props) => {
  const fragmentData = readFragment(WebpageFooterMenuFragment, data);
  // const storeWebPages = cleanNodes(fragmentData.pages);
  const storeWebPages = removeEdgesAndNodes(fragmentData.pages);
  const items = filterActivePages(storeWebPages);

  if (!items.length) {
    return null;
  }

  return <BaseFooterMenu items={items} title="Navigate" />;
};

function filterActivePages(availableStorePages: Page[]) {
  return availableStorePages.reduce<Array<{ name: string; path: string }>>(
    (visiblePages, currentPage) => {
      if (currentPage.isVisibleInNavigation) {
        const { name, __typename } = currentPage;

        visiblePages.push({
          name,
          path: __typename === 'ExternalLinkPage' ? currentPage.link : currentPage.path,
        });

        return visiblePages;
      }

      return visiblePages;
    },
    [],
  );
}

function cleanNodes(pages: ResultOf<typeof WebpageFooterMenuFragment>['pages']) {
  return removeEdgesAndNodes(pages);
}

type Page = ReturnType<typeof cleanNodes>[number];
