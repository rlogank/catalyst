import { getLocale, getTranslations } from 'next-intl/server';

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

export const WishlistContent = async ({ wishlists }: Props) => {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'Account.Wishlist' });

  return (
    <div>
      <TabHeading heading="wishlists" />
      {wishlists.length === 0 ? <p>{t('noItems')}</p> : <WishlistBook wishlists={wishlists} />}
    </div>
  );
};
