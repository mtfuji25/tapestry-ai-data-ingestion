// src/ingestors/CreativeCommonsIngestor.ts
import { AxiosResponse } from "axios";
import { BaseIngestor, ItemRecord, FileRecord } from "../utils/BaseIngestor";
import { Logger } from "../utils/Logger";

export class CreativeCommonsIngestor extends BaseIngestor {
  public sourceName = "Creative Commons Search";

  async fetchAll(): Promise<void> {
    // Base URL for Creative Commons API (or Openverse)
    const baseUrl = "https://api.creativecommons.engineering/v1";
    // Starting query – adjust parameters as necessary.
    let url = `${baseUrl}/search?q=public+domain&license=cc0`;

    while (url) {
      Logger.info(`Creative Commons: Fetching data from ${url}`);
      try {
        const response: AxiosResponse = await this.http.get(url, {
          headers: { Accept: "application/json" },
        });
        const data = response.data;
        if (data.results && Array.isArray(data.results)) {
          for (const result of data.results) {
            await this.processResult(result);
          }
        } else {
          Logger.warn("Creative Commons: No results found.");
        }
        // For simplicity, assume a 'next' field for pagination.
        url = data.next || null;
        await this.delay(500);
      } catch (error) {
        Logger.error("Creative Commons: Error fetching data", error);
        break;
      }
    }
  }

  async processResult(result: any): Promise<void> {
    const itemRecord: ItemRecord = {
      source_id: 0,
      source_item_id: result.id || result.url, // Use unique identifier from the API response
      title: result.title || "Untitled",
      description: result.description || null,
      creator_override: result.creator || null,
      publication_date: result.upload_date
        ? result.upload_date.split("T")[0]
        : null,
      type_id: 2, // For example, media_types record 'Image'
      license_id: 2, // Assuming a license record for 'CC0' or appropriate CC license
      source_url: result.url,
      extra_info: result,
    };

    const files: FileRecord[] = [];
    if (result.image_url) {
      files.push({
        file_url: result.image_url,
        format: "JPEG", // Example: deduce format from URL, adjust if needed.
        notes: "Primary image",
      });
    }
    await this.saveItem(itemRecord, files);
    Logger.info(
      `Creative Commons: Processed item ${itemRecord.source_item_id}`
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
