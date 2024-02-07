import { PropsWithChildren } from 'react';

import { Footer, FooterFragment } from '~/components/footer/footer';
import { Header, HeaderFragment } from '~/components/header';
import { Cart } from '~/components/header/cart';
import { execute, graphql } from '~/tada/graphql';

const DefaultLayoutQuery = graphql(
  `
    query DefaultLayoutQuery {
      site {
        ...HeaderFragment
        ...FooterFragment
      }
    }
  `,
  [HeaderFragment, FooterFragment],
);

export default async function DefaultLayout({ children }: PropsWithChildren) {
  const data = await execute(DefaultLayoutQuery);

  return (
    <>
      <Header cart={<Cart />} data={data.site} />
      <main className="flex-1 px-6 2xl:container sm:px-10 lg:px-12 2xl:mx-auto 2xl:px-0">
        {children}
      </main>
      <Footer data={data.site} />
    </>
  );
}
