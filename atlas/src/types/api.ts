export interface ApiResponse<T> {
  data: T;
  disclaimer?: string;
}

export interface ErrorResponse {
  detail: string;
  code?: string;
}
