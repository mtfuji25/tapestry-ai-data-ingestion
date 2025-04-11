// db/schema.ts
export interface Source {
  source_id: number;
  name: string;
  description?: string;
  api_endpoint?: string;
  website_url?: string;
  auth_details?: any; // JSON object holding authentication details
  rate_limit_config?: any; // JSON object with rate limit settings
  active: boolean;
}

export interface MediaType {
  type_id: number;
  name: string; // e.g., "Text", "Image", "Audio", "Video", "Film"
  description?: string;
}

export interface License {
  license_id: number;
  name: string; // e.g., "Public Domain", "CC BY 4.0", "CC0"
  description?: string;
  reference_url?: string;
}

export interface Creator {
  creator_id: number;
  name: string;
  additional_info?: string;
}

export interface Subject {
  subject_id: number;
  subject: string;
}

export interface Item {
  item_id: number;
  source_id: number;
  source_item_id: string;
  title: string;
  description?: string;
  creator_override?: string;
  publication_date?: string; // Stored as a string in YYYY-MM-DD format
  type_id: number;
  license_id: number;
  source_url: string;
  extra_info?: any;
  inserted_at?: Date;
  updated_at?: Date;
}

export interface File {
  file_id: number;
  item_id: number;
  file_url: string;
  format?: string;
  size?: number;
  notes?: string;
}

// Optional join table types:
export interface ItemCreator {
  item_id: number;
  creator_id: number;
}

export interface ItemSubject {
  item_id: number;
  subject_id: number;
}
