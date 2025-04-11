// src/utils/BaseIngestor.ts
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { Client, Pool } from 'pg';
import { Logger } from './Logger';

// Define interfaces for our normalized records (could also import from db/schema.ts)
export interface ItemRecord {
  source_id: number;         // Will be set by the BaseIngestor using reference lookup.
  source_item_id: string;    // Unique identifier from the external source.
  title: string;
  description?: string;
  creator_override?: string;
  publication_date?: string; // YYYY-MM-DD or null
  type_id: number;
  license_id: number;
  source_url: string;        // Public URL for reference.
  extra_info?: any;          // Unstructured metadata.
}

export interface FileRecord {
  file_url: string;          // Absolute URL.
  format?: string;           // E.g., PDF, JPEG.
  size?: number;             // In bytes.
  notes?: string;
}

export abstract class BaseIngestor {
  // HTTP client instance
  protected http: AxiosInstance;
  // PostgreSQL client or pool
  protected dbPool: Pool;

  constructor(dbPool: Pool, proxyUrl?: string) {
    this.dbPool = dbPool;
    // Create an Axios instance for HTTP calls.
    this.http = axios.create({
      timeout: 15000 // Set timeout as needed.
    });
    // Set proxy if provided.
    if (proxyUrl) {
      this.setProxy(proxyUrl);
    }
  }

  /**
   * Sets the HTTP proxy for Axios requests.
   * Expects proxyUrl in the format "host:port" or "host:port:username:password".
   */
  setProxy(proxyUrl: string): void {
    const parts = proxyUrl.split(':');
    if (parts.length < 2) {
      throw new Error("Invalid proxy URL format. Expected host:port or host:port:username:password");
    }
    const [host, port, username, password] = parts;
    this.http.defaults.proxy = {
      host,
      port: parseInt(port, 10),
      auth: username && password ? { username, password } : undefined,
    };
    Logger.info(`Proxy set to ${host}:${port}`);
  }

  /**
   * An abstract method that each subclass must implement to fetch data
   * from its specific source.
   */
  public abstract fetchAll(): Promise<void>;

  /**
   * Saves an item and its associated files into the database using upsert logic.
   * Assumes that reference tables (sources, media_types, licenses) are already populated.
   */
  async saveItem(item: ItemRecord, files: FileRecord[]): Promise<void> {
    const client = await this.dbPool.connect();
    try {
      await client.query('BEGIN');
      // Use UPSERT on items table.
      const insertItemText = `
        INSERT INTO items (source_id, source_item_id, title, description, creator_override, publication_date, type_id, license_id, source_url, extra_info)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (source_id, source_item_id)
        DO UPDATE SET title = EXCLUDED.title,
                      description = EXCLUDED.description,
                      creator_override = EXCLUDED.creator_override,
                      publication_date = EXCLUDED.publication_date,
                      type_id = EXCLUDED.type_id,
                      license_id = EXCLUDED.license_id,
                      source_url = EXCLUDED.source_url,
                      extra_info = EXCLUDED.extra_info,
                      updated_at = NOW()
        RETURNING item_id;
      `;
      const values = [
        item.source_id,
        item.source_item_id,
        item.title,
        item.description || null,
        item.creator_override || null,
        item.publication_date || null,
        item.type_id,
        item.license_id,
        item.source_url,
        item.extra_info ? JSON.stringify(item.extra_info) : null
      ];
      const res = await client.query(insertItemText, values);
      const itemId = res.rows[0].item_id;
      Logger.info(`Saved item ${item.title} with item_id ${itemId}`);

      // Upsert each file record.
      const insertFileText = `
        INSERT INTO files (item_id, file_url, format, size, notes)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT DO NOTHING;
      `;
      for (const file of files) {
        const fileValues = [itemId, file.file_url, file.format || null, file.size || null, file.notes || null];
        await client.query(insertFileText, fileValues);
      }
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      Logger.error("Error saving item:", error);
      throw error;
    } finally {
      client.release();
    }
  }
}
