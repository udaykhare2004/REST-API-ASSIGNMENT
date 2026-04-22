const swaggerJsdoc = require("swagger-jsdoc");

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Scalable REST API",
      version: "1.0.0",
      description: "JWT auth + RBAC + Task CRUD API",
    },
    servers: [
      { url: process.env.API_BASE_URL || "/", description: "Current deployment" },
      { url: "http://localhost:5000", description: "Local development" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "string", example: "6807f12a8e4cce0eac726001" },
            name: { type: "string", example: "Aditya Test User" },
            email: { type: "string", example: "aditya.user1@example.com" },
            role: { type: "string", enum: ["user", "admin"] },
          },
        },
        Task: {
          type: "object",
          properties: {
            _id: { type: "string", example: "6807f12a8e4cce0eac7260aa" },
            title: { type: "string", example: "Finish assignment" },
            description: { type: "string", example: "Implement backend and frontend" },
            status: { type: "string", enum: ["pending", "in_progress", "done"] },
            createdBy: { type: "string", example: "6807f12a8e4cce0eac726001" },
          },
        },
      },
    },
  },
  apis: ["./src/routes/**/*.js"],
});

module.exports = swaggerSpec;
