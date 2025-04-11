// src/orchestrator.ts
import dotenv from "dotenv";
import dbPool from "./config/dbConfig";
import { Logger } from "./utils/Logger";
import { InternetArchiveIngestor } from "./ingestors/InternetArchiveIngestor";
import { CreativeCommonsIngestor } from "./ingestors/CreativeCommonsIngestor";
import { SmithsonianIngestor } from "./ingestors/SmithsonianIngestor";
import { LibraryOfCongressIngestor } from "./ingestors/LibraryOfCongressIngestor";
// Import additional ingestors as needed.

dotenv.config();

async function runIngestions() {
  try {
    Logger.info("Starting ingestion process...");

    // Internet Archive ingestion
    const iaIngestor = new InternetArchiveIngestor(
      dbPool,
      process.env.PROXY_URL
    );
    await iaIngestor.fetchAll();

    // Creative Commons ingestion
    const ccIngestor = new CreativeCommonsIngestor(
      dbPool,
      process.env.PROXY_URL
    );
    await ccIngestor.fetchAll();

    // Smithsonian ingestion
    const smithsonianIngestor = new SmithsonianIngestor(dbPool);
    await smithsonianIngestor.fetchAll();

    // Library of Congress ingestion
    const locIngestor = new LibraryOfCongressIngestor(dbPool);
    await locIngestor.fetchAll();

    // Additional modules (HathiTrust, Stanford Renewals, Public Domain Review, Wikimedia Commons, Public Domain Films, etc.)
    // Their fetchAll() methods will be called similarly.

    Logger.info("Ingestion process completed successfully.");
  } catch (error) {
    Logger.error("Ingestion process encountered an error:", error);
  } finally {
    await dbPool.end(); // Close the PostgreSQL pool when all jobs are done.
  }
}

runIngestions();
