export interface ApiResponse<T = unknown> {
  status: string;
  data?: T;
  results?: number;
}
