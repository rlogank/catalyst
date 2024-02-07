import { FooterNav, FooterNavGroupList, FooterNavLink } from '@bigcommerce/components/Footer';
import {
  SiFacebook,
  SiInstagram,
  SiLinkedin,
  SiPinterest,
  SiX,
  SiYoutube,
} from '@icons-pack/react-simple-icons';

import { Link } from '~/components/link';
import { FragmentOf, graphql, readFragment } from '~/tada/graphql';

export const SocialIconsFragment = graphql(`
  fragment SocialIconsFragment on Settings {
    socialMediaLinks {
      name
      url
    }
  }
`);

const socialIconNames = [
  'Facebook',
  'Twitter',
  'X',
  'Pinterest',
  'Instagram',
  'LinkedIn',
  'YouTube',
];

const SocialIcon = ({ name }: { name: string }) => {
  switch (name) {
    case 'Facebook':
      return <SiFacebook title="Facebook" />;

    case 'Twitter':
    case 'X':
      return <SiX title="X" />;

    case 'Pinterest':
      return <SiPinterest title="Pinterest" />;

    case 'Instagram':
      return <SiInstagram title="Instagram" />;

    case 'LinkedIn':
      return <SiLinkedin title="LinkedIn" />;

    case 'YouTube':
      return <SiYoutube title="YouTube" />;

    default:
      return null;
  }
};

interface Props {
  data: FragmentOf<typeof SocialIconsFragment>;
}

export const SocialIcons = ({ data }: Props) => {
  const { socialMediaLinks } = readFragment(SocialIconsFragment, data);

  if (socialMediaLinks.length === 0) {
    return null;
  }

  return (
    <FooterNav aria-label="Social media links" className="block">
      <FooterNavGroupList className="flex-row gap-6">
        {socialMediaLinks.map((link) => {
          if (!socialIconNames.includes(link.name)) {
            return null;
          }

          return (
            <FooterNavLink asChild key={link.name}>
              <Link className="inline-block" href={link.url}>
                <SocialIcon name={link.name} />
              </Link>
            </FooterNavLink>
          );
        })}
      </FooterNavGroupList>
    </FooterNav>
  );
};
