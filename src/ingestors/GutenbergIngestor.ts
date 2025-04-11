// src/ingestors/GutenbergIngestor.ts
import { AxiosResponse } from 'axios';
import { BaseIngestor, ItemRecord, FileRecord } from '../utils/BaseIngestor';
import { Logger } from '../utils/Logger';

export class GutenbergIngestor extends BaseIngestor {
  public sourceName = "Project Gutenberg";

  /**
   * fetchAll downloads the Gutenberg catalog JSON and processes each record.
   * In production, consider scheduling periodic full updates, as the catalog is updated daily.
   */
  async fetchAll(): Promise<void> {
    // For example, assume the catalog is hosted at a given URL.
    const catalogUrl = "https://example.com/gutenberg-catalog.json";
    try {
      Logger.info(`Gutenberg: Fetching catalog from ${catalogUrl}`);
      const res: AxiosResponse = await this.http.get(catalogUrl);
      const catalog = res.data;
      if (!Array.isArray(catalog.books)) {
        Logger.warn("Gutenberg: Catalog structure unexpected; expecting 'books' array.");
        return;
      }
      for (const book of catalog.books) {
        await this.processBook(book);
      }
    } catch (error) {
      Logger.error("Gutenberg: Error fetching catalog", error);
    }
  }

  async processBook(book: any): Promise<void> {
    // Map the catalog entry to our schema. Gutenberg entries vary; adjust as needed.
    const itemRecord: ItemRecord = {
      source_id: 0, // Set by saveItem (via lookup into sources)
      source_item_id: book.id, // e.g., "12345"
      title: book.title || "Untitled",
      description: book.description || null,
      creator_override: book.author || null,
      publication_date: book.publication_year ? `${book.publication_year}-01-01` : null,
      type_id: 1,    // e.g. media_types
