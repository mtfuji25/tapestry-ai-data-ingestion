// src/ingestors/HathiTrustIngestor.ts
import { AxiosResponse } from "axios";
import { BaseIngestor, ItemRecord, FileRecord } from "../utils/BaseIngestor";
import { Logger } from "../utils/Logger";

export class HathiTrustIngestor extends BaseIngestor {
  public sourceName = "HathiTrust";

  /**
   * This method is designed to query a single item on-demand.
   * Bulk access is not allowed under HathiTrust’s commercial usage policy.
   * For example, you could call fetchById("book-id") to retrieve metadata.
   */
  async fetchById(hathiId: string): Promise<void> {
    // HathiTrust does not provide a full public API for bulk ingestion.
    // You might use a URL such as:
    const url = `https://catalog.hathitrust.org/api/volumes/brief/json/${hathiId}`;
    try {
      const res: AxiosResponse = await this.http.get(url);
      const data = res.data;
      // The response structure for a given volume is nested under data[hathiId]
      const volData = data[hathiId];
      if (!volData) {
        Logger.warn(`HathiTrust: No data found for ID ${hathiId}`);
        return;
      }
      // Map response to our ItemRecord
      const itemRecord: ItemRecord = {
        source_id: 0, // will be set by saveItem
        source_item_id: hathiId,
        title: volData.title || "Untitled",
        description: volData.description || null,
        creator_override: volData.creator || null,
        publication_date: volData.pubDate ? `${volData.pubDate}-01-01` : null,
        type_id: 1, // Adjust media type id as needed; e.g., "Text"
        license_id: 1, // Often HathiTrust items are public domain (check terms)
        source_url: `https://catalog.hathitrust.org/Record/${hathiId}`,
        extra_info: volData,
      };

      const files: FileRecord[] = [];
      // HathiTrust might not provide direct file URLs via this API;
      // if available, map them:
      // e.g., if volData has a 'fileURL' field, then:
      if (volData.fileURL) {
        files.push({
          file_url: volData.fileURL,
          format: null,
          notes: "HathiTrust file URL",
        });
      }
      await this.saveItem(itemRecord, files);
      Logger.info(`HathiTrust: Processed item ${hathiId}`);
    } catch (error) {
      Logger.error(`HathiTrust: Error processing item ${hathiId}:`, error);
    }
  }

  // As bulk ingestion is not supported, leave fetchAll unimplemented.
  async fetchAll(): Promise<void> {
    Logger.info(
      "HathiTrust bulk ingestion is restricted. Use fetchById for on-demand queries."
    );
  }
}
