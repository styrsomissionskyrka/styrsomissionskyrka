import * as fs from 'node:fs';
import * as path from 'node:path';
import * as process from 'node:process';

import { JSONSchema, compile } from 'json-schema-to-typescript';
import { toStudlyCaps } from 'strman';

const BASE = new URL('http://localhost:8888/wp-json/');

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

/**
 * Generating endpoint arguments is really hard since we can't really extract a proper name from the
 * route configuration. Therefore we rely on this map of how to name our endpoint arguments.
 *
 * If you need types for a new endmpoint/method you need to add it here.
 */
const ARGS_MAP: Record<string, Record<string, string | undefined> | undefined> = {
  '/wp/v2/posts': { GET: 'ListPostsArgs' },
  '/wp/v2/posts/(?P<id>[\\d]+)': { GET: 'GetPostArgs' },
} as const;

async function main() {
  let endpoints = await fetchRouteConfigurations(BASE);
  let entities = await generateEntityTypes(endpoints);
  let args = await generateArgsTypes(endpoints);

  let interfaces = [...entities.values(), ...args.values()].map((config) => config.source);

  let typesPath = path.join(process.cwd(), 'src/generated/types.ts');
  try {
    fs.mkdirSync(path.dirname(typesPath), { recursive: true });
  } catch (err) {
    // void
  }

  fs.writeFileSync(typesPath, interfaces.join('\n\n') + '\n');
  console.log('Types generated in src/generated/types.ts');
}

async function fetchRouteConfigurations(base: URL) {
  console.log('Fetching route configurations...');
  let root = await fetch(base).then((r) => r.json());
  let routes = new Map<string, Route>();

  for (let endpoint of Object.keys(root.routes)) {
    let url = new URL(replaceEndpoint(endpoint), BASE);
    let routeConfig = (await fetch(url, { method: 'OPTIONS' }).then((r) => r.json())) as Route;
    routes.set(endpoint, routeConfig);
  }

  return routes;
}

async function generateEntityTypes(endpoints: Awaited<ReturnType<typeof fetchRouteConfigurations>>) {
  let generatedTypes = new Map<string, GeneratedInterface>();

  for (let routeConfig of Array.from(endpoints.values())) {
    let schema = routeConfig.schema;
    let title = schema?.title;
    if (title == null || schema == null || generatedTypes.has(title)) continue;

    try {
      let source = await compile(schema, toStudlyCaps(title), {
        bannerComment: '',
        strictIndexSignatures: true,
      });

      console.log(`Generated entity interface for ${title}`);
      generatedTypes.set(title, {
        interfaceName: toStudlyCaps(title),
        title,
        source,
      });
    } catch (error) {
      console.error(`Failed to generate types for ${title}`);
    }
  }

  return generatedTypes;
}

async function generateArgsTypes(endpoints: Awaited<ReturnType<typeof fetchRouteConfigurations>>) {
  let generatedTypes = new Map<string, GeneratedInterface>();

  for (let [route, routeConfig] of Array.from(endpoints.entries())) {
    let config = ARGS_MAP[route];
    if (config == null) continue;

    for (let endpoint of routeConfig.endpoints ?? []) {
      let title = config[endpoint.methods[0]];
      if (title == null) continue;

      let schema: JSONSchema = { properties: endpoint.args };
      if (schema == null || generatedTypes.has(title)) continue;

      try {
        let source = await compile(schema, toStudlyCaps(title), {
          bannerComment: '',
          strictIndexSignatures: true,
        });

        console.log(`Generated argument interface for ${title}`);
        generatedTypes.set(title, {
          interfaceName: toStudlyCaps(title),
          title,
          source,
        });
      } catch (error) {
        console.error(`Failed to generate types for ${title}`);
      }
    }
  }

  return generatedTypes;
}

interface GeneratedInterface {
  title: string;
  interfaceName: string;
  source: string;
}

interface Route {
  endpoints: { methods: ('GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE')[]; args?: JSONSchema['properties'] }[];
  schema?: JSONSchema;
}

function replaceEndpoint(endpoint: string) {
  return endpoint
    .replace('(?P<id>([^\\/:<>\\*\\?"\\|]+(?:\\/[^\\/:<>\\*\\?"\\|]+)?)[\\/\\w-]+)', '1')
    .replace('(?P<id>[\\/\\w-]+)', 'id')
    .replace('(?P<id>[\\d]+)', '1')
    .replace('(?P<id>[\\w-]+)', 'id')
    .replace('(?P<id>[\\w\\-]+)', 'id')
    .replace('(?P<id>[a-zA-Z0-9_-]+)', 'id')
    .replace('(?P<location>[\\w-]+)', 'location')
    .replace('(?P<name>[a-z0-9-]+/[a-z0-9-]+)', 'name')
    .replace('(?P<name>[a-zA-Z0-9_-]+)', 'name')
    .replace('(?P<namespace>[a-zA-Z0-9_-]+)', 'namespace')
    .replace('(?P<parent>[\\d]+)', '1')
    .replace('(?P<plugin>[^.\\/]+(?:\\/[^.\\/]+)?)', 'plugin')
    .replace('(?P<status>[\\w-]+)', 'status')
    .replace('(?P<stylesheet>[\\/\\s%\\w\\.\\(\\)\\[\\]\\@_\\-]+)', 'stylesheet')
    .replace('(?P<stylesheet>[^\\/:<>\\*\\?"\\|]+(?:\\/[^\\/:<>\\*\\?"\\|]+)?)', 'stylesheet')
    .replace('(?P<taxonomy>[\\w-]+)', 'taxonomy')
    .replace('(?P<type>[\\w-]+)', 'type')
    .replace('(?P<user_id>(?:[\\d]+|me))', 'me')
    .replace('(?P<uuid>[\\w\\-]+)', 'uuid')
    .replace(/^\//, '');
}
