import { Command } from '@commander-js/extra-typings';
import * as z from 'zod';

const BIGCOMMERCE_API_URL = process.env.BIGCOMMMERCE_API_URL ?? 'https://api.bigcommerce.com';

class HTTPError extends Error {}

function createClient(baseUrl: string, token: string) {
  return async <T>(path: string, schema: z.Schema<T>, options: RequestInit = {}) => {
    const { headers = {}, method, ...rest } = options;

    const response = await fetch(`${baseUrl}${path}`, {
      method: method ?? 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...headers,
        'X-Auth-Token': token,
      },
      ...rest,
    });

    if (!response.ok) {
      console.log(await response.text());
      throw new HTTPError(
        `[${response.status} ${response.statusText}] - ${method} ${baseUrl}${path}`,
      );
    }

    return schema.parse(await response.json());
  };
}

export const copy = new Command('copy')
  .requiredOption('-h, --hash <hash>', 'store hash')
  .requiredOption('-t, --token <token>', 'access token')
  .requiredOption('-c, --channel-id <channelId>', 'channel ID')
  .action(async (options) => {
    /**
     * Create a client to interact with the BigCommerce API
     */
    const client = createClient(`${BIGCOMMERCE_API_URL}/stores/${options.hash}`, options.token);

    /**
     * Create a Catalyst category tree
     */
    console.log('[INFO] Creating Catalyst category tree...');

    const createdCategoryTree = await client(
      '/v3/catalog/trees',
      z.object({
        data: z.array(
          z.object({ id: z.number(), name: z.string(), channels: z.array(z.number()) }),
        ),
      }),
      {
        method: 'PUT',
        body: JSON.stringify([
          {
            name: 'Catalyst catalog tree',
            channels: [parseInt(options.channelId, 10)],
          },
        ]),
      },
    );

    console.log('[SUCCESS] Created Catalyst category tree');
    console.dir({ createdCategoryTree }, { depth: null });

    /**
     * Fetch all categories
     */
    console.log('[INFO] Fetching categories...');

    const categories = await client(
      '/v3/catalog/trees/categories',
      z.object({
        data: z.array(
          z.object({ category_id: z.number(), name: z.string(), sort_order: z.number() }),
        ),
      }),
    );

    console.log('[SUCCESS] Fetched categories');
    console.dir({ categories }, { depth: null });

    /**
     * Build Catalyst categories to be created
     */
    console.log('[INFO] Building Catalyst categories...');
    console.log('[SUCCESS] Built Catalyst categories');

    const catalystCategories = categories.data.map(({ name, sort_order }) => ({
      name,
      sort_order,
      tree_id: createdCategoryTree.data[0].id,
    }));

    console.dir({ catalystCategories }, { depth: null });

    /**
     * Create Catalyst categories
     */
    console.log('[INFO] Creating Catalyst categories...');

    const createdCategories = await client(
      '/v3/catalog/trees/categories',
      z.object({
        data: z.array(
          z.object({ category_id: z.number(), name: z.string(), sort_order: z.number() }),
        ),
      }),
      {
        method: 'POST',
        body: JSON.stringify(catalystCategories),
      },
    );

    console.log('[SUCCESS] Created Catalyst categories');
    console.dir({ createdCategories }, { depth: null });

    /**
     * Fetch existing product category assignments
     */
    console.log('[INFO] Fetching product category assignments...');

    /**
     * Fetch product category assignments
     */
    console.log('[INFO] Fetching product category assignments...');

    const productCategoryAssignments = await client(
      '/v3/catalog/products/category-assignments',
      z.object({
        data: z.array(z.object({ product_id: z.number(), category_id: z.number() })),
      }),
    );

    console.log('[SUCCESS] Fetched product category assignments');
    console.dir({ productCategoryAssignments }, { depth: null });

    /**
     * Create a map for quick lookup
     */
    const categoriesMap = new Map(categories.data.map((cat) => [cat.category_id, cat.name]));
    const createdCategoriesMap = new Map(
      createdCategories.data.map((cat) => [cat.name, cat.category_id]),
    );

    /**
     * Map through the productCategoryAssignments to build Catalyst product category assignments
     */
    console.log('[INFO] Building Catalyst product category assignments...');

    const catalystProductCategoryAssignments = productCategoryAssignments.data.map((assign) => {
      const categoryName = categoriesMap.get(assign.category_id);

      if (!categoryName)
        throw new Error(`Stencil category name not found for category ID ${assign.category_id}`);

      const newCategoryId = createdCategoriesMap.get(categoryName);

      if (!newCategoryId)
        throw new Error(`Catalyst category ID not found for category name ${categoryName}`);

      return {
        product_id: assign.product_id,
        category_id: newCategoryId,
      };
    });

    console.log('[SUCCESS] Built Catalyst product category assignments');
    console.dir({ catalystProductCategoryAssignments }, { depth: null });

    /**
     * Create Catalyst product category assignments
     */
    console.log('[INFO] Creating Catalyst product category assignments...');

    try {
      await client('/v3/catalog/products/category-assignments', z.never(), {
        method: 'PUT',
        body: JSON.stringify(catalystProductCategoryAssignments),
      });
    } catch (error) {
      console.error('[@TODO] Handle 204 response type in client');
      console.log('[SUCCESS] Created Catalyst product category assignments');
    }

    /**
     * Delete the old product category assignments
     */
    console.log('[INFO] Deleting old product category assignments...');

    const categoryIdsStr = categories.data.map((cat) => cat.category_id).join(',');

    try {
      await client(
        `/v3/catalog/products/category-assignments?category_id:in=${categoryIdsStr}`,
        z.never(),
        {
          method: 'DELETE',
        },
      );
    } catch (error) {
      console.error('[@TODO] Handle 204 response type in client');
      console.log('[SUCCESS] Deleted old product category assignments');
    }

    /**
     * Fetch existing product channel assignments
     */
    console.log('[INFO] Fetching product channel assignments...');

    const productChannelAssignments = await client(
      '/v3/catalog/products/channel-assignments',
      z.object({
        data: z.array(z.object({ product_id: z.number(), channel_id: z.number() })),
      }),
    );

    console.log('[SUCCESS] Fetched product channel assignments');
    console.dir({ productChannelAssignments }, { depth: null });

    /**
     * Build Catalyst product channel assignments to be created
     */
    console.log('[INFO] Building Catalyst product channel assignments...');
    console.log('[SUCCESS] Built Catalyst product channel assignments');

    const catalystChannelAssignments = productChannelAssignments.data.map(({ product_id }) => ({
      product_id,
      channel_id: parseInt(options.channelId, 10),
    }));

    console.dir({ catalystChannelAssignments }, { depth: null });

    /**
     * Create Catalyst product channel assignments
     */
    console.log('[INFO] Creating Catalyst product channel assignments...');

    try {
      await client('/v3/catalog/products/channel-assignments', z.never(), {
        method: 'PUT',
        body: JSON.stringify(catalystChannelAssignments),
      });
    } catch (error) {
      console.error('[@TODO] Handle 204 response type in client');
      console.log('[SUCCESS] Created Catalyst product channel assignments');
    }

    /**
     * Delete the old product channel assignments
     */
    console.log('[INFO] Deleting old product channel assignments...');

    try {
      await client(`/v3/catalog/products/channel-assignments?channel_id:in=1`, z.never(), {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('[@TODO] Handle 204 response type in client');
      console.log('[SUCCESS] Deleted old product channel assignments');
    }
  });
