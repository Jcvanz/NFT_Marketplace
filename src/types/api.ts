export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, string[] | string>;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}