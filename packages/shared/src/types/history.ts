export type HistoryStatus = 'processing' | 'completed' | 'error';

export type HistoryType = 'professional' | 'color_change' | 'with_model' | 'with_model_user';

export interface HistoryMetadata {
  studio_id?: string;
  aspect_ratio?: string;
  model?: string;
  user_photo_filename?: string;
  user_photo_storage_id?: string;
  ring_type?: string;
  color?: string;
  main_stone?: string;
  secondary_stones?: string;
  paved_stones?: string;
}

export interface HistoryEntry {
  id: string;
  type: HistoryType;
  status: HistoryStatus;
  created_at: string | number;
  completed_at: string | number | null;
  original_filename: string;
  original_storage_id?: string | null;
  generated_filename: string | null;
  generated_storage_id?: string | null;
  prompt: string;
  error?: string;
  metadata?: HistoryMetadata;
}

export interface HistoryResponse {
  history: HistoryEntry[];
}

export interface HistoryStatusResponse {
  jobs: Array<{
    id: string;
    status: HistoryStatus;
    progress: number;
    result?: {
      filename: string;
      prompt: string;
    };
    error?: string;
  }>;
}

// Types for input/update (used by server)
export interface HistoryEntryInput {
  type: HistoryType;
  original_filename: string;
  original_storage_id: string | null;
  prompt: string;
  metadata?: HistoryMetadata;
}

export interface HistoryEntryUpdate {
  status?: HistoryStatus;
  generated_filename?: string | null;
  generated_storage_id?: string | null;
  error?: string;
  completed_at?: number | null;
}
