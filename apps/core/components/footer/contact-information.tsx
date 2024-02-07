import { FragmentOf, readFragment } from 'gql.tada';
import { Fragment } from 'react';

import { graphql } from '~/tada/graphql';

export const ContactInformationFragment = graphql(`
  fragment ContactInformationFragment on Settings {
    contact {
      address
      phone
    }
  }
`);

interface Props {
  data: FragmentOf<typeof ContactInformationFragment>;
}

export const ContactInformation = ({ data }: Props) => {
  const { contact } = readFragment(ContactInformationFragment, data);

  if (!contact) {
    return null;
  }

  return (
    <>
      <address className="not-italic">
        {contact.address.split('\n').map((line) => (
          <Fragment key={line}>
            {line}
            <br />
          </Fragment>
        ))}
      </address>
      {contact.phone ? (
        <a
          className="hover:text-blue-primary focus:outline-none focus:ring-4 focus:ring-blue-primary/20"
          href={`tel:${contact.phone}`}
        >
          <p>{contact.phone}</p>
        </a>
      ) : null}
    </>
  );
};
