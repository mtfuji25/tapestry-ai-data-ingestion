// src/ingestors/PublicDomainFilmsIngestor.ts
import { BaseIngestor, ItemRecord, FileRecord } from "../utils/BaseIngestor";
import { Logger } from "../utils/Logger";
import axios, { AxiosResponse } from "axios";
import * as cheerio from "cheerio";

export class PublicDomainFilmsIngestor extends BaseIngestor {
  public sourceName = "Public Domain Films (Wikipedia)";

  async fetchAll(): Promise<void> {
    // Example: Wikipedia page for films in the public domain in the US.
    const pageTitle = "List_of_films_in_the_public_domain_in_the_United_States";
    const url = `https://en.wikipedia.org/w/api.php?action=parse&page=${pageTitle}&format=json&origin=*`;
    Logger.info(
      `Public Domain Films: Fetching data from Wikipedia page ${pageTitle}`
    );
    try {
      const res: AxiosResponse = await axios.get(url);
      const data = res.data;
      if (!data.parse || !data.parse.text) {
        Logger.warn("Public Domain Films: Unable to parse page content");
        return;
      }
      const html = data.parse.text["*"];
      const $ = cheerio.load(html);
      // Assume films are listed in a table; adjust selectors as needed.
      $("table.wikitable tbody tr").each(async (index, element) => {
        const cells = $(element).find("td");
        if (cells.length < 2) return; // Skip header rows.
        const title = $(cells[0]).text().trim();
        const year = $(cells[1]).text().trim();
        // Build a unique source_item_id based on title and year.
        const source_item_id = `${title}-${year}`;
        const itemRecord: ItemRecord = {
          source_id: 0,
          source_item_id,
          title,
          description: `Film released in ${year}`,
          creator_override: null, // Director info might be in another cell (extend mapping as needed)
          publication_date: year ? `${year}-01-01` : null,
          type_id: 5, // Assuming a media type for films
          license_id: 1, // Public Domain
          source_url: `https://en.wikipedia.org/wiki/${pageTitle}`,
          extra_info: { raw: $(element).html() },
        };

        // Films usually don't have file URLs in this context.
        await this.saveItem(itemRecord, []);
        Logger.info(`Public Domain Films: Processed film "${title}" (${year})`);
      });
    } catch (error) {
      Logger.error("Public Domain Films: Error fetching data", error);
    }
  }
}
