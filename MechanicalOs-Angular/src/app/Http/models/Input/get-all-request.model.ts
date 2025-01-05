export interface GetAllRequest {
    pageSize: number;
    pageIndex: number;
    sort?: string; //ordenar por coluna
    direction?: string; // asc or desc
  }
  