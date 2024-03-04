import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';

import { Link } from '~/components/link';
import { cn } from '~/lib/utils';
import { FragmentOf, graphql, readFragment } from '~/tada/graphql';

export const BreadcrumbsFragment = graphql(`
  fragment BreadcrumbsFragment on CategoryConnection {
    edges {
      node {
        breadcrumbs(depth: 5) {
          edges {
            node {
              name
              path
            }
          }
        }
      }
    }
  }
`);

interface Props {
  data: FragmentOf<typeof BreadcrumbsFragment>;
}

export const BreadCrumbs = ({ data }: Props) => {
  const fragmentData = readFragment(BreadcrumbsFragment, data);
  const [category] = removeEdgesAndNodes(fragmentData);

  if (!category) {
    return null;
  }

  const breadcrumbs = removeEdgesAndNodes(category.breadcrumbs);

  return (
    <nav>
      <ul className="m-0 flex flex-wrap items-center p-0 md:container md:mx-auto ">
        {breadcrumbs.map((breadcrumb, i, arr) => {
          const isLast = arr.length - 1 === i;

          return (
            <li
              className={cn('p-1 ps-0 hover:text-blue-primary', {
                'font-semibold': !isLast,
                'font-extrabold': isLast,
              })}
              key={breadcrumb.name}
            >
              <Link href="#">{breadcrumb.name}</Link>
              {!isLast && <span className="mx-2">/</span>}
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
