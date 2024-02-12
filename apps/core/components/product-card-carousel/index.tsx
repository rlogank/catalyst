import {
  Carousel,
  CarouselContent,
  CarouselNextIndicator,
  CarouselPreviousIndicator,
  CarouselSlide,
} from '@bigcommerce/components/Carousel';
import { ReactNode, useId } from 'react';

import { Pagination } from './pagination';

interface Props {
  title: string;
  children: ReactNode[];
}

export const ProductCardCarousel = ({ title, children }: Props) => {
  const id = useId();

  if (children.length === 0) {
    return null;
  }

  const groupedChildren = children.reduce<ReactNode[][]>((batches, product, index) => {
    // Determine the current batch based on the index
    const batchIndex = Math.floor(index / 4);

    // If the batch doesn't exist, create it
    if (!batches[batchIndex]) {
      batches[batchIndex] = [];
    }

    // Add the current product to the current batch
    batches[batchIndex]?.push(product);

    return batches;
  }, []);

  return (
    <Carousel aria-labelledby="title" className="mb-14">
      <div className="flex items-center justify-between">
        <h2 className="text-h3" id="title">
          {title}
        </h2>
        <span className="no-wrap flex">
          <CarouselPreviousIndicator />
          <CarouselNextIndicator />
        </span>
      </div>
      <CarouselContent>
        {groupedChildren.map((group, index) => (
          <CarouselSlide
            aria-label={`${index + 1} of ${groupedChildren.length}`}
            id={`${id}-slide-${index + 1}`}
            index={index}
            key={index}
          >
            {group.map((child) => child)}
          </CarouselSlide>
        ))}
      </CarouselContent>

      <Pagination groupedChildren={groupedChildren} id={id} />
    </Carousel>
  );
};
