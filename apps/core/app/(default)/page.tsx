import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';

import { Hero } from '~/components/hero';
import { ProductCardFragment } from '~/components/product-card';
import { ProductCardCarousel } from '~/components/product-card-carousel';
import { execute, graphql } from '~/tada/graphql';

const HomepageQuery = graphql(
  `
    query HomepageQuery {
      site {
        bestSellingProducts {
          edges {
            node {
              ...ProductCardFragment
            }
          }
        }
        featuredProducts {
          edges {
            node {
              ...ProductCardFragment
            }
          }
        }
      }
    }
  `,
  [ProductCardFragment],
);

export default async function Home() {
  const data = await execute(HomepageQuery);
  const bestSellingProducts = removeEdgesAndNodes(data.site.bestSellingProducts);
  const featuredProducts = removeEdgesAndNodes(data.site.featuredProducts);

  return (
    <>
      <Hero />

      <div className="my-10">
        <ProductCardCarousel
          data={bestSellingProducts}
          showCart={false}
          showCompare={false}
          title="Best Selling Products"
        />

        <ProductCardCarousel
          data={featuredProducts}
          showCart={false}
          showCompare={false}
          title="Featured Products"
        />
      </div>
    </>
  );
}

export const runtime = 'edge';
