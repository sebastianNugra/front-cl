import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
    OperacionRequest,
    OperacionResponse,
    HistorialResponse,
    PageResponse,
} from '../../models/operacion.model';

@Injectable({ providedIn: 'root' })
export class OperacionService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = environment.apiUrl;

    calcular(request: OperacionRequest): Observable<OperacionResponse> {
        return this.http.post<OperacionResponse>(this.baseUrl, request);
    }

    getHistorial(page = 0, size = 10): Observable<PageResponse<HistorialResponse>> {
        const params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());
        return this.http.get<PageResponse<HistorialResponse>>(`${this.baseUrl}/historial`, { params });
    }

    getOperacion(id: number): Observable<HistorialResponse> {
        return this.http.get<HistorialResponse>(`${this.baseUrl}/${id}`);
    }

    eliminarOperacion(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${id}`);
    }

    actualizarOperacion(id: number, request: OperacionRequest): Observable<OperacionResponse> {
        return this.http.put<OperacionResponse>(`${this.baseUrl}/${id}`, request);
    }
}