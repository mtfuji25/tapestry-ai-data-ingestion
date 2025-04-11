import express from "express";
import dotenv from "dotenv";
import { dbPool } from "./config/dbConfig";
import { initAwsConfig } from "./config/awsConfig";
import { Logger } from "./utils/Logger";
import { InternetArchiveIngestor } from "./ingestors/InternetArchiveIngestor";

dotenv.config();

// Initialize AWS configuration if needed
initAwsConfig();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Simple health-check endpoint
app.get("/", (req, res) => {
  res.send("Tapestry AI Data Ingestion Service is running.");
});

// Example endpoint to trigger an ingestion run for Internet Archive
// In production you might trigger these via a scheduler or message queue instead.
app.post("/api/ingest/internetarchive", async (req, res) => {
  try {
    // You can accept parameters from the request body to modify ingestion (e.g., a specific collection, query, etc.)
    const ingestor = new InternetArchiveIngestor(dbPool, process.env.PROXY_URL);
    await ingestor.fetchAll();
    res.json({
      success: true,
      message: "Internet Archive ingestion complete.",
    });
  } catch (error: any) {
    Logger.error("Error during ingestion:", error);
    res.status(500).json({ error: error.message || error.toString() });
  }
});

// Additional endpoints for other ingestors can be defined in a similar manner.

app.listen(port, () => {
  Logger.info(`Server running on port ${port}`);
});
