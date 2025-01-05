import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { OperationResult, Result } from './models/operation-result.model';
import { GetAllRequest } from './models/Input/get-all-request.model';
import { GetAllResponse } from './models/Output/get-all-response.model';

@Injectable({
    providedIn: 'root'
})
export class BaseService<T> {
    constructor(
        protected http: HttpClient,
        @Inject(String) private baseUrl: string
    ) { }

    //Buscar todos os modulos - Futuramente vamos tratar as permissoes
    getModules(): Observable<GetAllResponse<T>> {
        return this.http.get<GetAllResponse<T>>(`${this.baseUrl}/GetModules`);
    }

    // POST: Buscar todos os registros com paginação
    getAll(request: GetAllRequest): Observable<GetAllResponse<T>> {
        return this.http.post<GetAllResponse<T>>(`${this.baseUrl}/GetAll`, request);
    }

    // GET: Buscar por ID
    findById(id: number | string): Observable<Result<T>> {
        return this.http.get<Result<T>>(`${this.baseUrl}/${id}`);
    }

    findByFilter(filter: Record<string, any>): Observable<Result<T[]>> {
        const term = filter.term || '';
        const url = `${this.baseUrl}/Search/${term}`;
        return this.http.get<Result<T[]>>(url);
      }
      

    // POST: Salvar ou atualizar um registro
    save(entity: T): Observable<Result<T>> {
        return this.http.post<Result<T>>(`${this.baseUrl}`, entity);
    }

    // DELETE: Excluir um registro por ID
    delete(id: number | string): Observable<OperationResult<string>> {
        return this.http.delete<OperationResult<string>>(`${this.baseUrl}/${id}`);
    }
}
