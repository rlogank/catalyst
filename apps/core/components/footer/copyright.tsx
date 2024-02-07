import { FragmentOf, graphql, readFragment } from '~/tada/graphql';

export const CopyrightFragment = graphql(`
  fragment CopyrightFragment on Settings {
    storeName
  }
`);

interface Props {
  data: FragmentOf<typeof CopyrightFragment>;
}

export const Copyright = ({ data }: Props) => {
  const settings = readFragment(CopyrightFragment, data);

  return (
    <p className="text-gray-500 sm:order-first">
      © {new Date().getFullYear()} {settings.storeName} – Powered by BigCommerce
    </p>
  );
};
