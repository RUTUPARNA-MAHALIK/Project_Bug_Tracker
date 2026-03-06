import { z } from 'zod';
import { insertBugSchema, insertDeveloperSchema, bugs, developers } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  developers: {
    list: {
      method: 'GET' as const,
      path: '/api/developers' as const,
      responses: {
        200: z.array(z.custom<typeof developers.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/developers' as const,
      input: insertDeveloperSchema,
      responses: {
        201: z.custom<typeof developers.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  bugs: {
    list: {
      method: 'GET' as const,
      path: '/api/bugs' as const,
      responses: {
        200: z.array(z.custom<any>()), // Will return BugResponse
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/bugs/:id' as const,
      responses: {
        200: z.custom<any>(), // Will return BugResponse
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/bugs' as const,
      input: insertBugSchema,
      responses: {
        201: z.custom<typeof bugs.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/bugs/:id' as const,
      input: insertBugSchema.partial(),
      responses: {
        200: z.custom<typeof bugs.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/bugs/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type DeveloperResponse = z.infer<typeof api.developers.list.responses[200]>[number];
