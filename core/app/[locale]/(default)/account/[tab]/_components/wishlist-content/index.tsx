interface Props {
  wishlists: Wishlists;
}

import { getWishlistQuery } from '../../page-data';
import { TabHeading } from '../tab-heading';

import { WishlistBook } from './wishlist-book';

export type Wishlists = NonNullable<Awaited<ReturnType<typeof getWishlistQuery>>>;

export interface FormStatus {
  status: 'success' | 'error';
  message: string;
}

export const WishlistContent = ({ wishlists }: Props) => {
  return (
    <>
      <TabHeading heading="wishlists" />
      <WishlistBook wishlists={wishlists} />
    </>
  );
};
