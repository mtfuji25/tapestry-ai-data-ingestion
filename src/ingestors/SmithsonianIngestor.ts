// src/ingestors/SmithsonianIngestor.ts
import { AxiosResponse } from "axios";
import { BaseIngestor, ItemRecord, FileRecord } from "../utils/BaseIngestor";
import { Logger } from "../utils/Logger";

export class SmithsonianIngestor extends BaseIngestor {
  public sourceName = "Smithsonian Open Access";

  async fetchAll(): Promise<void> {
    const apiKey = process.env.SMITHSONIAN_API_KEY;
    if (!apiKey) {
      Logger.error("Smithsonian API key not set in environment variables.");
      return;
    }
    let url = `https://edan.si.edu/openaccess/api/v1.0/search?q=collection:national&api_key=${apiKey}`;
    while (url) {
      Logger.info(`Smithsonian: Fetching data from ${url}`);
      try {
        const res: AxiosResponse = await this.http.get(url);
        const data = res.data;
        if (
          data.response &&
          data.response.rows &&
          Array.isArray(data.response.rows)
        ) {
          for (const row of data.response.rows) {
            await this.processRow(row);
          }
        } else {
          Logger.warn("Smithsonian: No rows found in the response.");
        }
        if (data.response && data.response.cursor) {
          url = `https://edan.si.edu/openaccess/api/v1.0/search?q=collection:national&cursor=${data.response.cursor}&api_key=${apiKey}`;
        } else {
          url = null;
        }
        await this.delay(1000);
      } catch (error) {
        Logger.error("Smithsonian: Error fetching data", error);
        break;
      }
    }
  }

  async processRow(row: any): Promise<void> {
    const itemRecord: ItemRecord = {
      source_id: 0,
      source_item_id: row.id,
      title: row.title || "Untitled",
      description: row.description || null,
      creator_override: row.creator || row.physdesc || null,
      publication_date: row.date ? `${row.date.split("-")[0]}-01-01` : null,
      type_id: 3, // Assume a media type record for Smithsonian (adjust as needed)
      license_id: 1, // Typically, Smithsonian works are in the public domain
      source_url: row.view_url || "",
      extra_info: row,
    };
    const files: FileRecord[] = [];
    if (row.image && row.image.url) {
      files.push({
        file_url: row.image.url,
        format: row.image.format || "JPEG",
        notes: "",
      });
    }
    await this.saveItem(itemRecord, files);
    Logger.info(`Smithsonian: Processed item ${row.id}`);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
