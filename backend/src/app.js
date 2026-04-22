const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const v1Routes = require("./routes/v1");
const swaggerSpec = require("./config/swagger");
const { errorHandler, notFound } = require("./middlewares/errorMiddleware");

const app = express();

app.use(helmet());
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 500,
    standardHeaders: "draft-8",
    legacyHeaders: false,
  })
);

app.get("/", (_req, res) => {
  res.json({ success: true, message: "API is running", docs: "/api-docs" });
});

app.get("/api-docs.json", (_req, res) => {
  res.json(swaggerSpec);
});

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(null, {
    explorer: true,
    swaggerOptions: {
      url: "/api-docs.json",
      persistAuthorization: true,
      displayRequestDuration: true,
      tryItOutEnabled: true,
    },
  })
);
app.use("/api/v1", v1Routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
