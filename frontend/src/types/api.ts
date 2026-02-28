export interface ApiResponse<T> {
  data: T;
  disclaimer?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  disclaimer?: string;
}

export interface ErrorResponse {
  detail: string;
  code?: string;
}
