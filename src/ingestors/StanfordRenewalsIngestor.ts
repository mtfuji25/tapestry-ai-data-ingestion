// src/ingestors/StanfordRenewalsIngestor.ts
import axios, { AxiosResponse } from "axios";
import * as cheerio from "cheerio";
import { BaseIngestor, ItemRecord, FileRecord } from "../utils/BaseIngestor";
import { Logger } from "../utils/Logger";

export class StanfordRenewalsIngestor extends BaseIngestor {
  public sourceName = "Stanford Copyright Renewals";

  /**
   * fetchAll could iterate through search queries for each letter or specific year,
   * but here we implement a simple example: search by a given title.
   */
  async fetchByTitle(title: string): Promise<void> {
    // Construct search URL based on title. The actual URL depends on Stanford’s implementation.
    // Example URL: https://exhibits.stanford.edu/copyrightrenewals/search?query=YOUR_TITLE
    const searchUrl = `https://exhibits.stanford.edu/copyrightrenewals/search?query=${encodeURIComponent(
      title
    )}`;
    Logger.info(
      `Stanford Renewals: Fetching search results for "${title}" from ${searchUrl}`
    );
    try {
      const res: AxiosResponse = await axios.get(searchUrl);
      const html = res.data;
      const $ = cheerio.load(html);
      // This example assumes the page contains an element with id "search-results"
      const resultText = $("#search-results").text();
      let renewed = true;
      if (resultText.toLowerCase().includes("no results found")) {
        renewed = false;
      }
      // Build a minimal item record to store the renewal status,
      // which can later be linked with a book from Gutenberg.
      const itemRecord: ItemRecord = {
        source_id: 0, // will be resolved via sources table (Stanford Renewals)
        source_item_id: title, // using title as identifier for demonstration
        title: title,
        description: renewed ? "Copyright renewed" : "No renewal record found",
        creator_override: null,
        publication_date: null,
        type_id: 1, // Assuming "Text" – adjust type if needed.
        license_id: 1, // Not directly applicable – set as default.
        source_url: searchUrl,
        extra_info: { renewed },
      };

      // No files are associated in this check.
      await this.saveItem(itemRecord, []);
      Logger.info(`Stanford Renewals: Processed "${title}" renewal record.`);
    } catch (error) {
      Logger.error("Stanford Renewals: Error fetching search results", error);
    }
  }

  // If needed, implement fetchAll() to iterate through a series of queries.
  async fetchAll(): Promise<void> {
    Logger.info(
      "Stanford Renewals: fetchAll is not implemented. Use fetchByTitle(title) for targeted queries."
    );
  }
}
