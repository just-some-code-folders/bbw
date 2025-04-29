export interface InfinityPaginationResultType<T> {
  data: T[];
  hasNextPage: boolean;
  total: number; // Added total field
}
