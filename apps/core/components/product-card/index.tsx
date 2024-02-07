import {
  ProductCard as ComponentsProductCard,
  ProductCardImage,
  ProductCardInfo,
  ProductCardInfoBrandName,
  ProductCardInfoPrice,
  ProductCardInfoProductName,
} from '@bigcommerce/components/ProductCard';
import { Rating } from '@bigcommerce/components/Rating';
import Image from 'next/image';
import { useId } from 'react';

import { Link } from '~/components/link';
import { cn } from '~/lib/utils';
import { FragmentOf, graphql, readFragment } from '~/tada/graphql';

import { Pricing, PricingFragment } from '../pricing';

import { Cart } from './cart';
import { Compare } from './compare';

export const ProductCardFragment = graphql(
  `
    fragment ProductCardFragment on Product {
      entityId
      name
      path
      defaultImage {
        altText
        url(height: 300, width: 300)
      }
      brand {
        name
      }
      reviewSummary {
        numberOfReviews
        averageRating
      }

      ...PricingFragment
    }
  `,
  [PricingFragment],
);

interface ProductCardProps {
  imageSize?: 'tall' | 'wide' | 'square';
  imagePriority?: boolean;
  showCart?: boolean;
  showCompare?: boolean;
  data: FragmentOf<typeof ProductCardFragment>;
}

export const ProductCard = ({
  imageSize = 'square',
  imagePriority = false,
  showCart = true,
  showCompare = true,
  data,
}: ProductCardProps) => {
  const product = readFragment(ProductCardFragment, data);
  const summaryId = useId();

  return (
    <ComponentsProductCard key={product.entityId}>
      <ProductCardImage>
        <div
          className={cn('relative flex-auto', {
            'aspect-square': imageSize === 'square',
            'aspect-[4/5]': imageSize === 'tall',
            'aspect-[7/5]': imageSize === 'wide',
          })}
        >
          {product.defaultImage ? (
            <Image
              alt={product.defaultImage.altText}
              className="object-contain"
              fill
              priority={imagePriority}
              src={product.defaultImage.url}
            />
          ) : (
            <div className="h-full w-full bg-gray-200" />
          )}
        </div>
      </ProductCardImage>
      <ProductCardInfo className={cn(showCart && 'justify-end')}>
        {product.brand && <ProductCardInfoBrandName>{product.brand.name}</ProductCardInfoBrandName>}
        <ProductCardInfoProductName>
          {product.path ? (
            <Link
              className="focus:outline focus:outline-4 focus:outline-offset-2 focus:outline-blue-primary/20 focus:ring-0"
              href={product.path}
            >
              <span aria-hidden="true" className="absolute inset-0 bottom-20" />
              {product.name}
            </Link>
          ) : (
            product.name
          )}
        </ProductCardInfoProductName>

        <div className="flex items-center gap-3">
          <p
            aria-describedby={summaryId}
            className={cn(
              'flex flex-nowrap text-blue-primary',
              product.reviewSummary.numberOfReviews === 0 && 'text-gray-400',
            )}
          >
            <Rating size={16} value={product.reviewSummary.averageRating || 0} />
          </p>

          <div className="text-sm text-gray-500" id={summaryId}>
            {product.reviewSummary.averageRating !== 0 && (
              <>
                <span className="sr-only">Rating:</span>
                {product.reviewSummary.averageRating}
                <span className="sr-only">out of 5 stars.</span>{' '}
              </>
            )}
            <span className="sr-only">Number of reviews:</span>(
            {product.reviewSummary.numberOfReviews})
          </div>
        </div>

        <div className="flex flex-wrap items-end justify-between pt-2">
          <ProductCardInfoPrice>
            <Pricing data={product} />
          </ProductCardInfoPrice>
          {showCompare && (
            <Compare
              productId={product.entityId}
              productImage={product.defaultImage}
              productName={product.name}
            />
          )}
        </div>
      </ProductCardInfo>
      {showCart && <Cart product={product} />}
    </ComponentsProductCard>
  );
};
