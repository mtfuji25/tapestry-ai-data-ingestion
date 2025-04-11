// src/ingestors/CopyrightOfficeIngestor.ts
import { AxiosResponse } from "axios";
import * as cheerio from "cheerio";
import { BaseIngestor, ItemRecord, FileRecord } from "../utils/BaseIngestor";
import { Logger } from "../utils/Logger";

export class CopyrightOfficeIngestor extends BaseIngestor {
  public sourceName = "Copyright Office Records";

  /**
   * Spot-check a record by searching for a given title.
   * (The actual URL structure may require adjustments based on the target site.)
   */
  async fetchByTitle(title: string): Promise<void> {
    const searchUrl = `https://publicrecords.copyright.gov/advanced_search.php?title=${encodeURIComponent(
      title
    )}`;
    Logger.info(
      `Copyright Office: Fetching record for title "${title}" from ${searchUrl}`
    );
    try {
      const res: AxiosResponse = await this.http.get(searchUrl);
      const html = res.data;
      const $ = cheerio.load(html);

      // Example: assume the result is in an element with class 'result-item'
      const resultItem = $(".result-item").first();
      if (!resultItem) {
        Logger.warn(`No record found for title: ${title}`);
        return;
      }

      // Extract example fields:
      const recordId = resultItem.attr("data-record-id") || title;
      const extractedTitle =
        resultItem.find(".record-title").text().trim() || title;
      const renewalInfo =
        resultItem.find(".record-renewal").text().trim() || "Not Found";

      const itemRecord: ItemRecord = {
        source_id: 0, // to be set in saveItem (via lookup into sources)
        source_item_id: recordId,
        title: extractedTitle,
        description: `Renewal information: ${renewalInfo}`,
        creator_override: null,
        publication_date: null,
        type_id: 5, // Adjust media_types (e.g., for "Copyright Records")
        license_id: 1, // Public domain or as default
        source_url: searchUrl,
        extra_info: { raw: html },
      };
      // No file links are expected here.
      await this.saveItem(itemRecord, []);
      Logger.info(
        `Copyright Office: Processed record for title "${title}" (ID: ${recordId})`
      );
    } catch (error) {
      Logger.error(
        "Copyright Office: Error fetching record for title",
        title,
        error
      );
    }
  }

  async fetchAll(): Promise<void> {
    Logger.info(
      "Copyright Office: Bulk ingestion not supported. Use fetchByTitle() for targeted lookups."
    );
  }
}
