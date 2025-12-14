export interface PaginatedResult<T> {
    resultList: T[];
    totalRecords: number;
    pageIndex: number;
    pageSize: number;
  }
  
  export interface GetAllResponse<T> {
    content: PaginatedResult<T> | any;
    message: string;
    statusCode: number;
  }
  