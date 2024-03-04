import { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { initGraphQLTada } from 'gql.tada';
import { print } from 'graphql';

import type { introspection } from '~/graphql-env';

export const graphql = initGraphQLTada<{
  introspection: introspection;
  scalars: {
    DateTime: string;
    Long: number;
    BigDecimal: number;
  };
}>();

export type { FragmentOf, ResultOf, VariablesOf } from 'gql.tada';
export { readFragment } from 'gql.tada';

// Custom client

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function execute<Result = any, Variables = any>(
  query: TypedDocumentNode<Result, Variables>,
  variables?: Variables,
): Promise<Result> {
  const timeStart = Date.now();

  const response = await fetch(
    `https://store-${process.env.BIGCOMMERCE_STORE_HASH ?? ''}.mybigcommerce.com/graphql`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.BIGCOMMERCE_CUSTOMER_IMPERSONATION_TOKEN ?? ''}`,
      },
      body: JSON.stringify({
        query: print(query),
        variables,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch data${JSON.stringify(await response.json())}`);
  }

  const timeEnd = Date.now();
  const duration = timeEnd - timeStart;

  console.log(
    '==== Query cpx: ',
    response.headers.get('X-Bc-Graphql-Complexity'),
    'duration',
    duration,
    'ms',
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
  return (await response.json()).data;
}
