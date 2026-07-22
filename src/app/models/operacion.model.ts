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

const OPERADOR_SYMBOLS: Record<TipoOperacion, string> = {
    SUMA: '+',
    RESTA: '-',
    MULTIPLICACION: '×',
    DIVISION: '÷',
};

const OPERACION_NAMES: Record<TipoOperacion, string> = {
    SUMA: 'Suma',
    RESTA: 'Resta',
    MULTIPLICACION: 'Multiplicación',
    DIVISION: 'División',
};

export function getOperadorSymbol(tipo: string): string {
    return OPERADOR_SYMBOLS[tipo as TipoOperacion] ?? tipo;
}

export function getOperacionNombre(tipo: string): string {
    return OPERACION_NAMES[tipo as TipoOperacion] ?? tipo;
}