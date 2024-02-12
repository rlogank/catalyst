import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';

import { Hero } from '~/components/hero';
import { ProductCard, ProductCardFragment } from '~/components/product-card';
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
        <ProductCardCarousel title="Best Selling Products">
          {bestSellingProducts.map((productCardFragment, i) => (
            <ProductCard data={productCardFragment} key={i} showCart={false} showCompare={false} />
          ))}
        </ProductCardCarousel>

        <ProductCardCarousel title="Featured Products">
          {featuredProducts.map((productCardFragment, i) => (
            <ProductCard data={productCardFragment} key={i} showCart={false} showCompare={false} />
          ))}
        </ProductCardCarousel>
      </div>
    </>
  );
}

export const runtime = 'edge';
