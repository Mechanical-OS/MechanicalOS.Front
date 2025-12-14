import { HttpStatusCode } from "@angular/common/http";

// Modelo genérico para OperationResult
export interface OperationResult<TMessage> {
    message: TMessage;
    statusCode: HttpStatusCode;
  }
  
  // Modelo para Result com conteúdo genérico
  export interface Result<T> extends OperationResult<string> {
    content: T;
  }
  
  // Modelo para FailOperationResult
  export interface FailOperationResult extends OperationResult<any[]> {
    // Adapte "any[]" para o tipo adequado caso você saiba a estrutura do JArray
  }
  
  // Modelo para FailResult
  export interface FailResult extends FailOperationResult {}