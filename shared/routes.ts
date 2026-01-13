import { z } from "zod";
import { insertUserSchema, insertBaseSchema, insertAssetSchema, insertTransactionSchema, users, bases, assets, transactions } from "./schema";

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
  unauthorized: z.object({
    message: z.string(),
  }),
};

export const api = {
  auth: {
    login: {
      method: "POST" as const,
      path: "/api/login",
      input: z.object({ username: z.string(), password: z.string() }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    register: {
      method: "POST" as const,
      path: "/api/register",
      input: insertUserSchema,
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    logout: {
      method: "POST" as const,
      path: "/api/logout",
      responses: {
        200: z.void(),
      },
    },
    me: {
      method: "GET" as const,
      path: "/api/user",
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
  },
  bases: {
    list: {
      method: "GET" as const,
      path: "/api/bases",
      responses: {
        200: z.array(z.custom<typeof bases.$inferSelect>()),
      },
    },
    get: {
      method: "GET" as const,
      path: "/api/bases/:id",
      responses: {
        200: z.custom<typeof bases.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/bases",
      input: insertBaseSchema,
      responses: {
        201: z.custom<typeof bases.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  assets: {
    list: {
      method: "GET" as const,
      path: "/api/assets",
      input: z.object({
        baseId: z.coerce.number().optional(),
        type: z.string().optional(),
        status: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof assets.$inferSelect>()),
      },
    },
    get: {
      method: "GET" as const,
      path: "/api/assets/:id",
      responses: {
        200: z.custom<typeof assets.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/assets",
      input: insertAssetSchema,
      responses: {
        201: z.custom<typeof assets.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: "PUT" as const,
      path: "/api/assets/:id",
      input: insertAssetSchema.partial(),
      responses: {
        200: z.custom<typeof assets.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    transfer: {
      method: "POST" as const,
      path: "/api/assets/:id/transfer",
      input: z.object({
        toBaseId: z.number(),
        notes: z.string().optional(),
      }),
      responses: {
        200: z.custom<typeof assets.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    expend: {
      method: "POST" as const,
      path: "/api/assets/:id/expend",
      input: z.object({
        notes: z.string().optional(),
      }),
      responses: {
        200: z.custom<typeof assets.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    assign: {
      method: "POST" as const,
      path: "/api/assets/:id/assign",
      input: z.object({
        notes: z.string().optional(), // Could be assigned to person, but simplistic for now
      }),
      responses: {
        200: z.custom<typeof assets.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  transactions: {
    list: {
      method: "GET" as const,
      path: "/api/transactions",
      input: z.object({
        baseId: z.coerce.number().optional(),
        assetId: z.coerce.number().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof transactions.$inferSelect & { asset: typeof assets.$inferSelect; user: typeof users.$inferSelect }>()),
      },
    },
  },
  dashboard: {
    stats: {
      method: "GET" as const,
      path: "/api/dashboard/stats",
      input: z.object({
        baseId: z.coerce.number().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        type: z.string().optional(),
      }).optional(),
      responses: {
        200: z.object({
          openingBalance: z.number(),
          closingBalance: z.number(),
          netMovement: z.number(),
          purchases: z.number(),
          transfersIn: z.number(),
          transfersOut: z.number(),
          assigned: z.number(),
          expended: z.number(),
        }),
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
