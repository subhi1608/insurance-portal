const spec: Record<string, unknown> = {
  openapi: "3.0.3",
  info: {
    title: "Insurance Portal API",
    version: "1.0.0",
    description:
      "REST API for managing insurance clients, policies, and claims. " +
      "All resource endpoints require a JWT Bearer token obtained from /auth/login or /auth/signin.",
  },
  servers: [{ url: "/api/v1", description: "Current server" }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Access token (15 min TTL). Refresh via POST /auth/refresh.",
      },
    },
    schemas: {
      Client: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          name: { type: "string", example: "Jane Doe" },
          date_of_birth: { type: "string", format: "date", example: "1990-05-15" },
          address: { type: "string", example: "123 Main St, Springfield" },
          contact: { type: "string", example: "+1-555-0100" },
        },
      },
      ClientInput: {
        type: "object",
        required: ["name", "date_of_birth", "address", "contact"],
        properties: {
          name: { type: "string", example: "Jane Doe" },
          date_of_birth: { type: "string", format: "date", example: "1990-05-15" },
          address: { type: "string", example: "123 Main St, Springfield" },
          contact: { type: "string", minLength: 10, example: "+1-555-0100" },
        },
      },
      Policy: {
        type: "object",
        properties: {
          id: { type: "integer", example: 10 },
          client_id: { type: "integer", example: 1 },
          type: { type: "string", example: "Health" },
          coverage_amount: { type: "number", format: "float", example: 100000 },
          premium: { type: "number", format: "float", example: 500 },
          start_date: { type: "string", format: "date", example: "2024-01-01" },
          end_date: { type: "string", format: "date", example: "2025-01-01" },
        },
      },
      PolicyInput: {
        type: "object",
        required: ["client_id", "type", "coverage_amount", "premium", "start_date", "end_date"],
        properties: {
          client_id: { type: "integer", example: 1 },
          type: { type: "string", example: "Health" },
          coverage_amount: { type: "number", format: "float", example: 100000 },
          premium: { type: "number", format: "float", example: 500 },
          start_date: { type: "string", format: "date", example: "2024-01-01" },
          end_date: { type: "string", format: "date", example: "2025-01-01" },
        },
      },
      PolicyUpdateInput: {
        type: "object",
        required: ["type", "coverage_amount", "premium", "start_date", "end_date"],
        properties: {
          type: { type: "string", example: "Health" },
          coverage_amount: { type: "number", format: "float", example: 100000 },
          premium: { type: "number", format: "float", example: 500 },
          start_date: { type: "string", format: "date", example: "2024-01-01" },
          end_date: { type: "string", format: "date", example: "2025-01-01" },
        },
      },
      Claim: {
        type: "object",
        properties: {
          id: { type: "integer", example: 100 },
          insurance_policy_id: { type: "integer", example: 10 },
          description: { type: "string", example: "Hospital admission claim" },
          claim_status: {
            type: "string",
            enum: ["Pending", "Approved", "Rejected", "Under Review"],
            example: "Pending",
          },
          claim_date: { type: "string", format: "date", example: "2024-03-15" },
        },
      },
      ClaimInput: {
        type: "object",
        required: ["insurance_policy_id", "description", "claim_status", "claim_date"],
        properties: {
          insurance_policy_id: { type: "integer", example: 10 },
          description: { type: "string", example: "Hospital admission claim" },
          claim_status: {
            type: "string",
            enum: ["Pending", "Approved", "Rejected", "Under Review"],
            example: "Pending",
          },
          claim_date: { type: "string", format: "date", example: "2024-03-15" },
        },
      },
      Meta: {
        type: "object",
        properties: {
          page: { type: "integer", example: 1 },
          limit: { type: "integer", example: 20 },
          total: { type: "integer", example: 42 },
        },
      },
      Error: {
        type: "object",
        properties: {
          error: {
            type: "object",
            properties: {
              code: { type: "string", example: "INVALID_CREDENTIALS" },
              message: { type: "string", example: "Invalid email or password" },
            },
          },
        },
      },
      TokenResponse: {
        type: "object",
        properties: {
          data: {
            type: "object",
            properties: { accessToken: { type: "string", example: "eyJhbGci..." } },
          },
        },
      },
      MessageResponse: {
        type: "object",
        properties: {
          data: {
            type: "object",
            properties: { message: { type: "string", example: "deleted" } },
          },
        },
      },
      CreatedResponse: {
        type: "object",
        properties: {
          data: {
            type: "object",
            properties: { id: { type: "integer", example: 7 } },
          },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    "/auth/signin": {
      post: {
        tags: ["Auth"],
        summary: "Register a new user",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email", example: "user@example.com" },
                  password: { type: "string", minLength: 8, example: "password123" },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Created — accessToken in body, refreshToken in httpOnly cookie", content: { "application/json": { schema: { $ref: "#/components/schemas/TokenResponse" } } } },
          "400": { description: "Validation error", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "429": { description: "Rate limited (10 req / min per IP)" },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Log in",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email", example: "user@example.com" },
                  password: { type: "string", example: "password123" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "OK — accessToken in body, refreshToken in httpOnly cookie", content: { "application/json": { schema: { $ref: "#/components/schemas/TokenResponse" } } } },
          "401": { description: "Invalid credentials", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "429": { description: "Rate limited (10 req / min per IP)" },
        },
      },
    },
    "/auth/refresh": {
      post: {
        tags: ["Auth"],
        summary: "Refresh access token",
        description: "Reads the `refreshToken` httpOnly cookie. No request body required.",
        security: [],
        responses: {
          "200": { description: "New access token", content: { "application/json": { schema: { $ref: "#/components/schemas/TokenResponse" } } } },
          "401": { description: "Missing or expired refresh token", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },
    "/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Log out",
        description: "Clears the refresh token cookie and invalidates the session.",
        responses: {
          "200": { description: "Logged out", content: { "application/json": { schema: { $ref: "#/components/schemas/MessageResponse" } } } },
          "401": { description: "Unauthorized" },
        },
      },
    },
    "/clients": {
      get: {
        tags: ["Clients"],
        summary: "List clients (paginated)",
        parameters: [
          { in: "query", name: "page", schema: { type: "integer", default: 1, minimum: 1 } },
          { in: "query", name: "limit", schema: { type: "integer", default: 20, minimum: 1, maximum: 100 } },
        ],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: { type: "array", items: { $ref: "#/components/schemas/Client" } },
                    meta: { $ref: "#/components/schemas/Meta" },
                  },
                },
              },
            },
          },
          "401": { description: "Unauthorized" },
        },
      },
      post: {
        tags: ["Clients"],
        summary: "Create client",
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/ClientInput" } } } },
        responses: {
          "201": { description: "Created", content: { "application/json": { schema: { $ref: "#/components/schemas/CreatedResponse" } } } },
          "400": { description: "Validation error", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "401": { description: "Unauthorized" },
        },
      },
    },
    "/clients/{id}": {
      parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" }, example: 1 }],
      get: {
        tags: ["Clients"],
        summary: "Get client by ID",
        responses: {
          "200": { description: "OK", content: { "application/json": { schema: { type: "object", properties: { data: { $ref: "#/components/schemas/Client" } } } } } },
          "401": { description: "Unauthorized" },
          "404": { description: "Not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
      put: {
        tags: ["Clients"],
        summary: "Update client",
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/ClientInput" } } } },
        responses: {
          "200": { description: "Updated", content: { "application/json": { schema: { $ref: "#/components/schemas/MessageResponse" } } } },
          "400": { description: "Validation error", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "401": { description: "Unauthorized" },
          "404": { description: "Not found" },
        },
      },
      delete: {
        tags: ["Clients"],
        summary: "Delete client",
        responses: {
          "200": { description: "Deleted", content: { "application/json": { schema: { $ref: "#/components/schemas/MessageResponse" } } } },
          "401": { description: "Unauthorized" },
          "404": { description: "Not found" },
        },
      },
    },
    "/policies": {
      get: {
        tags: ["Policies"],
        summary: "List policies (paginated)",
        parameters: [
          { in: "query", name: "client_id", schema: { type: "integer" }, description: "Filter by client" },
          { in: "query", name: "page", schema: { type: "integer", default: 1, minimum: 1 } },
          { in: "query", name: "limit", schema: { type: "integer", default: 20, minimum: 1, maximum: 100 } },
        ],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: { type: "array", items: { $ref: "#/components/schemas/Policy" } },
                    meta: { $ref: "#/components/schemas/Meta" },
                  },
                },
              },
            },
          },
          "400": { description: "Invalid client_id", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "401": { description: "Unauthorized" },
        },
      },
      post: {
        tags: ["Policies"],
        summary: "Create policy",
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/PolicyInput" } } } },
        responses: {
          "201": { description: "Created", content: { "application/json": { schema: { $ref: "#/components/schemas/CreatedResponse" } } } },
          "400": { description: "Validation error", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "401": { description: "Unauthorized" },
        },
      },
    },
    "/policies/{id}": {
      parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" }, example: 10 }],
      get: {
        tags: ["Policies"],
        summary: "Get policy by ID",
        responses: {
          "200": { description: "OK", content: { "application/json": { schema: { type: "object", properties: { data: { $ref: "#/components/schemas/Policy" } } } } } },
          "401": { description: "Unauthorized" },
          "404": { description: "Not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
      put: {
        tags: ["Policies"],
        summary: "Update policy (client_id cannot be changed)",
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/PolicyUpdateInput" } } } },
        responses: {
          "200": { description: "Updated", content: { "application/json": { schema: { $ref: "#/components/schemas/MessageResponse" } } } },
          "400": { description: "Validation error", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "401": { description: "Unauthorized" },
          "404": { description: "Not found" },
        },
      },
      delete: {
        tags: ["Policies"],
        summary: "Delete policy",
        responses: {
          "200": { description: "Deleted", content: { "application/json": { schema: { $ref: "#/components/schemas/MessageResponse" } } } },
          "401": { description: "Unauthorized" },
          "404": { description: "Not found" },
        },
      },
    },
    "/claims": {
      get: {
        tags: ["Claims"],
        summary: "List claims (paginated)",
        parameters: [
          { in: "query", name: "policy_id", schema: { type: "integer" }, description: "Filter by policy" },
          { in: "query", name: "page", schema: { type: "integer", default: 1, minimum: 1 } },
          { in: "query", name: "limit", schema: { type: "integer", default: 20, minimum: 1, maximum: 100 } },
        ],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: { type: "array", items: { $ref: "#/components/schemas/Claim" } },
                    meta: { $ref: "#/components/schemas/Meta" },
                  },
                },
              },
            },
          },
          "400": { description: "Invalid policy_id", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "401": { description: "Unauthorized" },
        },
      },
      post: {
        tags: ["Claims"],
        summary: "Create claim",
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/ClaimInput" } } } },
        responses: {
          "201": { description: "Created", content: { "application/json": { schema: { $ref: "#/components/schemas/CreatedResponse" } } } },
          "400": { description: "Validation error", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "401": { description: "Unauthorized" },
        },
      },
    },
    "/claims/{id}": {
      parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" }, example: 100 }],
      get: {
        tags: ["Claims"],
        summary: "Get claim by ID",
        responses: {
          "200": { description: "OK", content: { "application/json": { schema: { type: "object", properties: { data: { $ref: "#/components/schemas/Claim" } } } } } },
          "401": { description: "Unauthorized" },
          "404": { description: "Not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
      put: {
        tags: ["Claims"],
        summary: "Update claim",
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/ClaimInput" } } } },
        responses: {
          "200": { description: "Updated", content: { "application/json": { schema: { $ref: "#/components/schemas/MessageResponse" } } } },
          "400": { description: "Validation error", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "401": { description: "Unauthorized" },
          "404": { description: "Not found" },
        },
      },
      delete: {
        tags: ["Claims"],
        summary: "Delete claim",
        responses: {
          "200": { description: "Deleted", content: { "application/json": { schema: { $ref: "#/components/schemas/MessageResponse" } } } },
          "401": { description: "Unauthorized" },
          "404": { description: "Not found" },
        },
      },
    },
  },
};

export default spec;
