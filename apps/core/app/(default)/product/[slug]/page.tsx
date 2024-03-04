import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { getProduct } from '~/client/queries/get-product';
import { execute, graphql } from '~/tada/graphql';

import { BreadCrumbs, BreadcrumbsFragment } from './_components/breadcrumbs';
import { Gallery } from './_components/gallery';
import { ProductDetails } from './_components/product-details';
import { ProductDetailsFragment } from './_components/product-details/fragment';
import { RelatedProducts, RelatedProductsFragment } from './_components/related-products';
import { Reviews } from './_components/reviews';

type Product = Awaited<ReturnType<typeof getProduct>>;

const ProductDescriptionAndReviews = ({ product }: { product: NonNullable<Product> }) => {
  return (
    <div className="lg:col-span-2">
      {Boolean(product.description) && (
        <>
          <h2 className="mb-4 text-h5">Description</h2>
          <div dangerouslySetInnerHTML={{ __html: product.description }} />
        </>
      )}

      {Boolean(product.warranty) && (
        <>
          <h2 className="mb-4 mt-8 text-h5">Warranty</h2>
          <p>{product.warranty}</p>
        </>
      )}

      <Suspense fallback="Loading...">
        <Reviews productId={product.entityId} />
      </Suspense>
    </div>
  );
};

interface ProductPageProps {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const productId = Number(params.slug);
  const product = await getProduct(productId);

  if (!product) {
    return {};
  }

  const { pageTitle, metaDescription, metaKeywords } = product.seo;
  const { url, altText: alt } = product.defaultImage || {};

  return {
    title: pageTitle || product.name,
    description: metaDescription || `${product.plainTextDescription.slice(0, 150)}...`,
    keywords: metaKeywords ? metaKeywords.split(',') : null,
    openGraph: url
      ? {
          images: [
            {
              url,
              alt,
            },
          ],
        }
      : null,
  };
}

const ProductPageQuery = graphql(
  `
    query ProductPageQuery($firstRelatedProducts: Int!, $entityId: Int!) {
      site {
        product(entityId: $entityId) {
          ...ProductDetailsFragment
          ...RelatedProductsFragment
          categories(first: 1) {
            ...BreadcrumbsFragment
          }
          images {
            edges {
              node {
                altText
                isDefault
                url(width: 600)
              }
            }
          }
        }
      }
    }
  `,
  [RelatedProductsFragment, BreadcrumbsFragment, ProductDetailsFragment],
);

export default async function Product({ params, searchParams }: ProductPageProps) {
  const productId = Number(params.slug);
  const { slug, ...options } = searchParams;

  const optionValueIds = Object.keys(options)
    .map((option) => ({
      optionEntityId: Number(option),
      valueEntityId: Number(searchParams[option]),
    }))
    .filter(
      (option) => !Number.isNaN(option.optionEntityId) && !Number.isNaN(option.valueEntityId),
    );

  const product = await getProduct(productId, optionValueIds);

  const fragmentData = await execute(ProductPageQuery, {
    entityId: productId,
    firstRelatedProducts: 12,
  });

  const product2 = fragmentData.site.product;

  if (!product) {
    return notFound();
  }

  // Remove this when we merge
  if (!product2) {
    return notFound();
  }

  // make a copy of product.images
  const images = removeEdgesAndNodes(product2.images);

  // pick the top-level default image out of the `Image` response
  const topLevelDefaultImg = product.images.find((image) => image.isDefault);

  // if product.defaultImage exists, and product.defaultImage.url is not equal to the url of the isDefault image in the Image response, mark the existing isDefault image to "isDefault = false" and append the correct default image to images
  if (product.defaultImage && topLevelDefaultImg?.url !== product.defaultImage.url) {
    images.forEach((image) => {
      image.isDefault = false;
    });

    images.push({
      url: product.defaultImage.url,
      altText: product.defaultImage.altText,
      isDefault: true,
    });
  }

  return (
    <>
      <BreadCrumbs data={product2.categories} />
      <div className="mb-12 mt-4 lg:grid lg:grid-cols-2 lg:gap-8">
        <Gallery images={images} />
        <ProductDetails data={product2} />
        <ProductDescriptionAndReviews product={product} />
      </div>

      {/* TODO - TADA: This suspense is not being used because we do a single request */}
      {/* do we want to split the requests? */}
      <Suspense fallback="Loading...">
        <RelatedProducts data={product2} />
      </Suspense>
    </>
  );
}

export const runtime = 'edge';
