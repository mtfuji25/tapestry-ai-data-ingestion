// src/ingestors/NationalArchivesIngestor.ts
import { AxiosResponse } from "axios";
import { BaseIngestor, ItemRecord, FileRecord } from "../utils/BaseIngestor";
import { Logger } from "../utils/Logger";

export class NationalArchivesIngestor extends BaseIngestor {
  public sourceName = "National Archives";

  async fetchAll(): Promise<void> {
    let page = 1;
    const baseUrl =
      "https://catalog.archives.gov/api/v1/?q=hasDigitalContent:true";
    while (true) {
      const url = `${baseUrl}&page=${page}`;
      Logger.info(`National Archives: Fetching page ${page}`);
      try {
        const res: AxiosResponse = await this.http.get(url);
        const data = res.data;
        if (data.results && Array.isArray(data.results)) {
          if (data.results.length === 0) {
            Logger.info(
              "National Archives: No more results, ending pagination."
            );
            break;
          }
          for (const result of data.results) {
            await this.processResult(result);
          }
        } else {
          Logger.warn("National Archives: Unexpected response structure.");
          break;
        }
        page++;
        await this.delay(1000);
      } catch (error) {
        Logger.error("National Archives: Error fetching page", error);
        break;
      }
    }
  }

  async processResult(result: any): Promise<void> {
    // Map the API response fields to our schema.
    const itemRecord: ItemRecord = {
      source_id: 0,
      source_item_id: result.id || "",
      title: result.title || "Untitled",
      description: result.description || null,
      creator_override: result.creator
        ? Array.isArray(result.creator)
          ? result.creator.join(", ")
          : result.creator
        : null,
      publication_date: result.date ? result.date.split(" ")[0] : null,
      type_id: 4, // Assuming media_types for National Archives items (adjust as necessary)
      license_id: 1, // Likely public domain
      source_url: result.url || "",
      extra_info: result,
    };

    const files: FileRecord[] = [];
    if (result.objects && Array.isArray(result.objects)) {
      // Each object in the objects array might represent a digital file.
      for (const obj of result.objects) {
        if (obj && obj.link) {
          files.push({
            file_url: obj.link,
            format: obj.format || null,
            size: obj.size ? parseInt(obj.size, 10) : undefined,
            notes: obj.description || "",
          });
        }
      }
    }
    await this.saveItem(itemRecord, files);
    Logger.info(`National Archives: Processed record ${result.id}`);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
