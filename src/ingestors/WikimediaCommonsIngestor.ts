// src/ingestors/WikimediaCommonsIngestor.ts
import { BaseIngestor, ItemRecord, FileRecord } from "../utils/BaseIngestor";
import { Logger } from "../utils/Logger";
import axios, { AxiosResponse } from "axios";

export class WikimediaCommonsIngestor extends BaseIngestor {
  public sourceName = "Wikimedia Commons";

  async fetchAll(): Promise<void> {
    // Using Wikimedia's action API to get pages from a specific category.
    // For example, fetch 50 files from "Category:Public domain" (adjust category as needed)
    const baseUrl = "https://commons.wikimedia.org/w/api.php";
    let params = {
      action: "query",
      list: "categorymembers",
      cmtitle: "Category:Public domain",
      cmtype: "file",
      cmlimit: "50",
      format: "json",
      origin: "*",
    };

    Logger.info(
      `Wikimedia Commons: Fetching category members from ${params.cmtitle}`
    );
    try {
      const res: AxiosResponse = await this.http.get(baseUrl, { params });
      const data = res.data;
      if (data.query && data.query.categorymembers) {
        for (const member of data.query.categorymembers) {
          await this.processMember(member);
        }
      } else {
        Logger.warn("Wikimedia Commons: No category members found.");
      }
    } catch (error) {
      Logger.error("Wikimedia Commons: Error fetching category members", error);
    }
  }

  async processMember(member: any): Promise<void> {
    // member.title might be like "File:Example.jpg"
    const fileTitle = member.title;
    // Retrieve detailed file info using action=query with prop=imageinfo
    const baseUrl = "https://commons.wikimedia.org/w/api.php";
    const params = {
      action: "query",
      titles: fileTitle,
      prop: "imageinfo",
      iiprop: "url|extmetadata",
      format: "json",
      origin: "*",
    };

    try {
      const res: AxiosResponse = await axios.get(baseUrl, { params });
      const pages = res.data.query.pages;
      const pageId = Object.keys(pages)[0];
      const page = pages[pageId];
      if (
        page.imageinfo &&
        Array.isArray(page.imageinfo) &&
        page.imageinfo.length > 0
      ) {
        const info = page.imageinfo[0];
        // Map API response fields to our schema.
        const itemRecord: ItemRecord = {
          source_id: 0,
          source_item_id: fileTitle,
          title: fileTitle.replace(/^File:/, ""),
          description:
            info.extmetadata && info.extmetadata.ImageDescription
              ? info.extmetadata.ImageDescription.value
              : null,
          creator_override:
            info.extmetadata && info.extmetadata.Artist
              ? info.extmetadata.Artist.value
              : null,
          publication_date: null, // Not always available.
          type_id: 2, // Media type "Image"
          license_id: 2, // Set based on extmetadata.License if provided; using default for now.
          source_url: `https://commons.wikimedia.org/wiki/${encodeURIComponent(
            fileTitle
          )}`,
          extra_info: info.extmetadata || {},
        };

        const files: FileRecord[] = [];
        if (info.url) {
          files.push({
            file_url: info.url,
            format: info.url.split(".").pop() || null,
            notes: "",
          });
        }
        await this.saveItem(itemRecord, files);
        Logger.info(`Wikimedia Commons: Processed file ${fileTitle}`);
      }
    } catch (error) {
      Logger.error(
        `Wikimedia Commons: Error processing member ${fileTitle}`,
        error
      );
    }
  }
}
