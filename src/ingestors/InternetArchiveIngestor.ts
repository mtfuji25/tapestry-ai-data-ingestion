// src/ingestors/InternetArchiveIngestor.ts
import { AxiosResponse } from "axios";
import { BaseIngestor, ItemRecord, FileRecord } from "../utils/BaseIngestor";
import { Logger } from "../utils/Logger";

export class InternetArchiveIngestor extends BaseIngestor {
  public sourceName = "Internet Archive";

  /**
   * Fetch all items from Internet Archive using a collection-based query.
   */
  async fetchAll(): Promise<void> {
    let url =
      "https://archive.org/services/search/v1/scrape?query=collection:publicdomain";
    while (url) {
      Logger.info(`Internet Archive: Fetching data from ${url}`);
      try {
        const response: AxiosResponse = await this.http.get(url);
        const data = response.data;
        if (data && data.items && Array.isArray(data.items)) {
          for (const item of data.items) {
            await this.processItem(item);
          }
        } else {
          Logger.warn("Internet Archive: No items found in response.");
        }
        // If a cursor is provided for pagination, update URL; otherwise, exit loop.
        if (data.cursor) {
          url = `https://archive.org/services/search/v1/scrape?cursor=${data.cursor}&query=collection:publicdomain`;
        } else {
          url = null;
        }
        await this.delay(1000); // Throttle requests
      } catch (error) {
        Logger.error("Internet Archive: Error fetching collection", error);
        break;
      }
    }
  }

  /**
   * Process a single Internet Archive item.
   */
  async processItem(item: any): Promise<void> {
    const identifier: string = item.identifier;
    try {
      const metaResponse: AxiosResponse = await this.http.get(
        `https://archive.org/metadata/${identifier}`
      );
      const meta = metaResponse.data;
      const metadata = meta.metadata;

      const itemRecord: ItemRecord = {
        source_id: 0, // Will be set in saveItem (reference lookup)
        source_item_id: identifier,
        title: metadata.title || "Untitled",
        description: metadata.description || null,
        creator_override: metadata.creator || metadata.author || null,
        publication_date: metadata.year ? `${metadata.year}-01-01` : null,
        type_id: 1, // Assuming media_types record for Internet Archive (update as needed)
        license_id: 1, // Assuming 'Public Domain' in licenses table (update as needed)
        source_url: `https://archive.org/details/${identifier}`,
        extra_info: metadata,
      };

      const files: FileRecord[] = [];
      if (meta.files && Array.isArray(meta.files)) {
        for (const f of meta.files) {
          if (
            f.format &&
            (f.format.toUpperCase() === "PDF" ||
              f.format.toUpperCase() === "TEXT")
          ) {
            files.push({
              file_url: `https://archive.org/download/${identifier}/${f.name}`,
              format: f.format,
              size: f.size ? parseInt(f.size, 10) : undefined,
              notes: "",
            });
          }
        }
      }
      await this.saveItem(itemRecord, files);
      Logger.info(`Internet Archive: Processed item ${identifier}`);
    } catch (error) {
      Logger.error(
        `Internet Archive: Error processing item ${identifier}:`,
        error
      );
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
