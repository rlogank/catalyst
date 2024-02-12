'use client';

import { CarouselPagination, CarouselPaginationTab } from '@bigcommerce/components/Carousel';
import { ReactNode } from 'react';

export const Pagination = ({
  groupedChildren,
  id,
}: {
  groupedChildren: ReactNode[][];
  id: string;
}) => {
  return (
    <CarouselPagination>
      {({ selectedIndex, scrollTo }) =>
        groupedChildren.map((_, index) => (
          <CarouselPaginationTab
            aria-controls={`${id}-slide-${index + 1}`}
            aria-label={`Slide ${index + 1}`}
            isSelected={selectedIndex === index}
            key={index}
            onClick={() => scrollTo(index)}
          />
        ))
      }
    </CarouselPagination>
  );
};
