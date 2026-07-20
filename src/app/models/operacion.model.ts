export type TipoOperacion = 'SUMA' | 'RESTA' | 'MULTIPLICACION' | 'DIVISION';

export interface OperacionRequest {
    valor1: number;
    valor2: number;
    tipo: TipoOperacion;
}

export interface OperacionResponse {
    id: number;
    resultado: number;
}

export interface HistorialResponse {
    id: number;
    valor1: number;
    valor2: number;
    tipo: string;
    resultado: number;
    fecha: string;
}

export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}