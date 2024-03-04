import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { Product as ProductSchemaType, WithContext } from 'schema-dts';

import { FragmentOf, graphql, readFragment } from '~/tada/graphql';

export const ProductReviewSchemaFragment = graphql(`
  fragment ProductReviewSchema on Product {
    entityId
    reviews(first: 5) {
      edges {
        node {
          entityId
          author {
            name
          }
          createdAt {
            utc
          }
          rating
          title
          text
        }
      }
    }
  }
`);

interface Props {
  data: FragmentOf<typeof ProductReviewSchemaFragment>;
}

export const ProductReviewSchema = ({ data }: Props) => {
  const fragmentData = readFragment(ProductReviewSchemaFragment, data);
  const productId = fragmentData.entityId;
  const reviews = removeEdgesAndNodes(fragmentData.reviews);

  const productReviewSchema: WithContext<ProductSchemaType> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `product-${productId}`,
    review: reviews.map((review) => {
      return {
        '@type': 'Review' as const,
        datePublished: new Intl.DateTimeFormat('en-US').format(new Date(review.createdAt.utc)),
        name: review.title,
        reviewBody: review.text,
        author: {
          '@type': 'Person' as const,
          name: review.author.name,
        },
        reviewRating: {
          '@type': 'Rating' as const,
          bestRating: 5,
          ratingValue: review.rating,
          worstRating: 1,
        },
      };
    }),
  };

  return (
    <script
      dangerouslySetInnerHTML={{ __html: JSON.stringify(productReviewSchema) }}
      type="application/ld+json"
    />
  );
};
