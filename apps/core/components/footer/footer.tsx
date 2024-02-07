import {
  Footer as ComponentsFooter,
  FooterNav,
  FooterSection,
} from '@bigcommerce/components/Footer';
import { FragmentOf, graphql, readFragment } from 'gql.tada';
import React from 'react';

import { StoreLogo, StoreLogoFragment } from '../store-logo';

import { ContactInformation, ContactInformationFragment } from './contact-information';
import { Copyright, CopyrightFragment } from './copyright';
import {
  BrandFooterMenu,
  BrandFooterMenuFragment,
  CategoryFooterMenu,
  CategoryFooterMenuFragment,
} from './footer-menus';
import { WebPageFooterMenu, WebpageFooterMenuFragment } from './footer-menus/webpage-footer-menu';
import { PaymentMethods } from './payment-methods';
import { SocialIcons, SocialIconsFragment } from './social-icons';

export const FooterFragment = graphql(
  `
    fragment FooterFragment on Site {
      ...BrandFooterMenuFragment
      ...CategoryFooterMenuFragment
      settings {
        ...ContactInformationFragment
        ...CopyrightFragment
        ...SocialIconsFragment
        ...StoreLogoFragment
      }
      content {
        ...WebpageFooterMenuFragment
      }
    }
  `,
  [
    BrandFooterMenuFragment,
    CategoryFooterMenuFragment,
    ContactInformationFragment,
    CopyrightFragment,
    SocialIconsFragment,
    StoreLogoFragment,
    WebpageFooterMenuFragment,
  ],
);

interface Props {
  data: FragmentOf<typeof FooterFragment>;
}

export const Footer = ({ data }: Props) => {
  const fragmentData = readFragment(FooterFragment, data);
  const settings = fragmentData.settings;

  return (
    <ComponentsFooter>
      <FooterSection>
        <FooterNav>
          <CategoryFooterMenu data={fragmentData} />
          <BrandFooterMenu data={fragmentData} />
          <WebPageFooterMenu data={fragmentData.content} />
        </FooterNav>
        <div className="flex shrink-0 grow flex-col gap-4 md:order-first">
          {settings && (
            <h3 className="mb-4">
              <StoreLogo data={settings} />
            </h3>
          )}
          {settings && <ContactInformation data={settings} />}
          {settings && <SocialIcons data={settings} />}
        </div>
      </FooterSection>
      <FooterSection className="justify-between gap-10 sm:flex-row sm:gap-8 sm:py-6">
        <PaymentMethods />
        {settings && <Copyright data={settings} />}
      </FooterSection>
    </ComponentsFooter>
  );
};
