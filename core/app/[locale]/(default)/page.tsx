import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, unstable_setRequestLocale } from 'next-intl/server';

import { getSessionCustomerId } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { Hero } from '~/components/hero';
import {
  ProductCardCarousel,
  ProductCardCarouselFragment,
} from '~/components/product-card-carousel';
import { LocaleType } from '~/i18n';

interface Props {
  params: {
    locale: LocaleType;
  };
}

const HomePageQuery = graphql(
  `
    query HomePageQuery {
      site {
        newestProducts(first: 12) {
          edges {
            node {
              ...ProductCardCarouselFragment
            }
          }
        }
        featuredProducts(first: 12) {
          edges {
            node {
              ...ProductCardCarouselFragment
            }
          }
        }
      }
    }
  `,
  [ProductCardCarouselFragment],
);

const CarouselQuery = graphql(
  `
    query CarouselMetafieldQuery {
      carousel: channel {
        metafields(namespace: "sample-data", keys: "carousel-json") {
          edges {
            node {
              value
            }
          }
        }
      }
    }
  `);

export default async function Home({ params: { locale } }: Props) {
  const customerId = await getSessionCustomerId();

  unstable_setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'Home' });
  const messages = await getMessages({ locale });

  const { data } = await client.fetch({
    document: HomePageQuery,
    customerId,
    fetchOptions: customerId ? { cache: 'no-store' } : { next: { revalidate } },
  });

  const { data: carouselData } = await client.fetch({
    document: CarouselQuery,
    fetchOptions: { next: { revalidate } },
  });


  const carousel = !!carouselData.carousel?.metafields.edges.length ? JSON.parse(carouselData.carousel.metafields.edges[0].node.value) : null;
  
  const featuredProducts = removeEdgesAndNodes(data.site.featuredProducts);
  const newestProducts = removeEdgesAndNodes(data.site.newestProducts);

  return (
    <>
      <Hero slides={carousel.slides}/>

      <div className="my-10">
        <NextIntlClientProvider locale={locale} messages={{ Product: messages.Product ?? {} }}>
          <ProductCardCarousel
            products={featuredProducts}
            showCart={false}
            showCompare={false}
            showReviews={false}
            title={t('Carousel.featuredProducts')}
          />
          <ProductCardCarousel
            products={newestProducts}
            showCart={false}
            showCompare={false}
            showReviews={false}
            title={t('Carousel.newestProducts')}
          />
        </NextIntlClientProvider>
      </div>
    </>
  );
}

export const runtime = 'edge';
