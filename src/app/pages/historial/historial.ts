import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { OperacionService } from '../../core/services/operacion.service';
import { HistorialResponse, getOperadorSymbol, getOperacionNombre } from '../../models/operacion.model';

@Component({
    selector: 'app-historial',
    standalone: true,
    templateUrl: './historial.html',
    styleUrl: './historial.scss',
})
export class Historial implements OnInit {
    private readonly operacionService = inject(OperacionService);
    private readonly router = inject(Router);

    data = signal<HistorialResponse[]>([]);
    totalElements = signal(0);
    totalPages = signal(0);
    pageSize = signal(10);
    pageIndex = signal(0);
    cargando = signal(false);

    showConfirmDialog = signal(false);
    selectedId = signal<number | null>(null);
    deleteMensaje = signal('');

    getOperadorSymbol = getOperadorSymbol;
    getOperacionNombre = getOperacionNombre;

    ngOnInit(): void {
        this.cargarHistorial();
    }

    cargarHistorial(): void {
        this.cargando.set(true);
        this.operacionService.getHistorial(this.pageIndex(), this.pageSize()).subscribe({
            next: (res) => {
                this.data.set(res.content);
                this.totalElements.set(res.totalElements);
                this.totalPages.set(res.totalPages);
                this.cargando.set(false);
            },
            error: () => {
                this.cargando.set(false);
            },
        });
    }

    nextPage(): void {
        if (this.pageIndex() < this.totalPages() - 1) {
            this.pageIndex.update((i) => i + 1);
            this.cargarHistorial();
        }
    }

    prevPage(): void {
        if (this.pageIndex() > 0) {
            this.pageIndex.update((i) => i - 1);
            this.cargarHistorial();
        }
    }

    verDetalle(id: number): void {
        this.router.navigate(['/historial', id]);
    }

    confirmarEliminar(operacion: HistorialResponse): void {
        this.selectedId.set(operacion.id);
        this.deleteMensaje.set(
            `¿Eliminar ${operacion.valor1} ${getOperadorSymbol(operacion.tipo)} ${operacion.valor2} = ${operacion.resultado}?`
        );
        this.showConfirmDialog.set(true);
    }

    confirmDelete(): void {
        const id = this.selectedId();
        if (id === null) return;

        this.showConfirmDialog.set(false);
        this.operacionService.eliminarOperacion(id).subscribe({
            next: () => {
                this.selectedId.set(null);
                this.cargarHistorial();
            },
            error: () => {
                this.selectedId.set(null);
            },
        });
    }

    cancelDelete(): void {
        this.showConfirmDialog.set(false);
        this.selectedId.set(null);
    }

    getTipoBadgeClass(tipo: string): string {
        const map: Record<string, string> = {
            SUMA: 'bg-green-900/60 text-green-300',
            RESTA: 'bg-red-900/60 text-red-300',
            MULTIPLICACION: 'bg-blue-900/60 text-blue-300',
            DIVISION: 'bg-orange-900/60 text-orange-300',
        };
        return map[tipo] || 'bg-gray-700 text-gray-300';
    }
}
