// src/ingestors/PublicDomainReviewIngestor.ts
import { AxiosResponse } from "axios";
import * as cheerio from "cheerio";
import { BaseIngestor, ItemRecord, FileRecord } from "../utils/BaseIngestor";
import { Logger } from "../utils/Logger";

export class PublicDomainReviewIngestor extends BaseIngestor {
  public sourceName = "Public Domain Review";

  /**
   * Fetch featured items from the Public Domain Review homepage.
   */
  async fetchAll(): Promise<void> {
    const url = "https://publicdomainreview.org/";
    Logger.info(`Public Domain Review: Fetching homepage from ${url}`);
    try {
      const res: AxiosResponse = await this.http.get(url);
      const html = res.data;
      const $ = cheerio.load(html);

      // Assume featured articles are found in a container with class 'featured-articles'
      const articles = $(".featured-articles article");

      if (articles.length === 0) {
        Logger.warn("Public Domain Review: No featured articles found.");
        return;
      }

      articles.each(async (index, elem) => {
        const article = $(elem);
        const title = article.find("h2").text().trim() || "Untitled";
        const link = article.find("a").attr("href") || url;
        const description = article.find("p.summary").text().trim() || null;

        // Map to our ItemRecord
        const itemRecord: ItemRecord = {
          source_id: 0,
          source_item_id: link, // using the article URL as a unique id
          title,
          description,
          creator_override: null,
          publication_date: null,
          type_id: 1, // For 'Text' content
          license_id: 1, // Set as Public Domain by default
          source_url: link,
          extra_info: { source: "Public Domain Review", raw: html },
        };

        // PDR may have images (e.g., cover images for articles)
        const files: FileRecord[] = [];
        const imageUrl = article.find("img").attr("src");
        if (imageUrl) {
          files.push({
            file_url: imageUrl,
            format: "JPEG", // or infer from URL if possible
            notes: "Article thumbnail",
          });
        }
        await this.saveItem(itemRecord, files);
        Logger.info(`Public Domain Review: Processed article "${title}"`);
      });
    } catch (error) {
      Logger.error("Public Domain Review: Error fetching homepage", error);
    }
  }
}
