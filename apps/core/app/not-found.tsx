import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { Message } from '@bigcommerce/components/Message';
import { ShoppingCart } from 'lucide-react';

import { Footer, FooterFragment } from '~/components/footer/footer';
import { Header, HeaderFragment } from '~/components/header';
import { CartLink } from '~/components/header/cart';
import { ProductCard, ProductCardFragment } from '~/components/product-card';
import { SearchForm } from '~/components/search-form';
import { execute, graphql } from '~/tada/graphql';

export const metadata = {
  title: 'Not Found',
};

const NotFoundQuery = graphql(
  `
    query NotFoundQuery {
      site {
        ...HeaderFragment
        ...FooterFragment
        featuredProducts(first: 12) {
          edges {
            node {
              ...ProductCardFragment
            }
          }
        }
      }
    }
  `,
  [HeaderFragment, FooterFragment, ProductCardFragment],
);

export default async function NotFound() {
  const fragmentData = await execute(NotFoundQuery, { imageHeight: 500, imageWidth: 500 });
  const featuredProductsFragments = removeEdgesAndNodes(fragmentData.site.featuredProducts);

  return (
    <>
      <Header
        cart={
          <CartLink>
            <ShoppingCart aria-label="cart" />
          </CartLink>
        }
        data={fragmentData.site}
      />
      <main className="mx-auto mb-10 max-w-[835px] space-y-8 px-6 sm:px-10 lg:px-0">
        <Message className="flex-col gap-8 px-0 py-16">
          <h2 className="text-h2">We couldn't find that page!</h2>
          <p className="text-lg">
            It looks like the page you requested has moved or no longer exists.
          </p>
        </Message>
        <SearchForm />
        <section>
          <h3 className="mb-8 text-h3">Featured Products</h3>
          <div className="grid grid-cols-2 gap-x-8 gap-y-8 md:grid-cols-4">
            {featuredProductsFragments.map((productFragment, i) => (
              <ProductCard data={productFragment} key={i} />
            ))}
          </div>
        </section>
      </main>
      <Footer data={fragmentData.site} />
    </>
  );
}

export const runtime = 'edge';
