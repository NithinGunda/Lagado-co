export interface Category {
  id?: number | string;
  name: string;
  slug?: string;
  description?: string;
  image_url?: string;
  parent_id?: number | null;
  sort_order?: number;
  is_active?: boolean;
  deleted_at?: string | null;
  created_at?: string;
  updated_at?: string;
  children?: Category[];
}

export interface PagedResult<T> {
  data: T[];
  total: number;
  per_page?: number;
  current_page?: number;
}
