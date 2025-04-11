// src/ingestors/LibraryOfCongressIngestor.ts
import { AxiosResponse } from "axios";
import { BaseIngestor, ItemRecord, FileRecord } from "../utils/BaseIngestor";
import { Logger } from "../utils/Logger";

export class LibraryOfCongressIngestor extends BaseIngestor {
  public sourceName = "Library of Congress";

  async fetchAll(): Promise<void> {
    // Base URL for LoC search returning JSON.
    let baseUrl = "https://www.loc.gov/search/?q=public+domain&fo=json";
    let page = 1;
    while (true) {
      const url = `${baseUrl}&page=${page}`;
      Logger.info(`Library of Congress: Fetching page ${page} from ${url}`);
      try {
        const res: AxiosResponse = await this.http.get(url);
        const data = res.data;
        if (data.results && Array.isArray(data.results)) {
          if (data.results.length === 0) {
            Logger.info("Library of Congress: No results; ending pagination.");
            break;
          }
          for (const result of data.results) {
            await this.processResult(result);
          }
        } else {
          Logger.warn("Library of Congress: Unexpected response structure.");
          break;
        }
        page++;
        await this.delay(1000);
      } catch (error) {
        Logger.error("Library of Congress: Error during fetch", error);
        break;
      }
    }
  }

  async processResult(result: any): Promise<void> {
    const itemRecord: ItemRecord = {
      source_id: 0,
      source_item_id: result.id || result.id,
      title: result.title || "Untitled",
      description: result.description || null,
      creator_override: result.creator
        ? Array.isArray(result.creator)
          ? result.creator.join(", ")
          : result.creator
        : null,
      publication_date: result.date ? result.date.split(" ")[0] : null,
      type_id: 4, // Assume a media type record for LoC items (adjust as necessary)
      license_id: 1, // Often public domain
      source_url: result.url || "",
      extra_info: result,
    };
    const files: FileRecord[] = [];
    if (result.files && Array.isArray(result.files)) {
      for (const file of result.files) {
        if (file.link) {
          files.push({
            file_url: file.link,
            format: file.format || null,
            size: file.size ? parseInt(file.size, 10) : undefined,
            notes: "",
          });
        }
      }
    }
    await this.saveItem(itemRecord, files);
    Logger.info(`Library of Congress: Processed record ${result.id}`);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
