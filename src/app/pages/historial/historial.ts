import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { OperacionService } from '../../core/services/operacion.service';
import { HistorialResponse } from '../../models/operacion.model';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';

@Component({
    selector: 'app-historial',
    standalone: true,
    imports: [
        MatTableModule,
        MatPaginatorModule,
        MatButtonModule,
        MatIconModule,
        MatDialogModule,
        MatSnackBarModule,
    ],
    templateUrl: './historial.html',
    styleUrl: './historial.scss',
})
export class Historial implements OnInit {
    private readonly operacionService = inject(OperacionService);
    private readonly router = inject(Router);
    private readonly dialog = inject(MatDialog);
    private readonly snackBar = inject(MatSnackBar);

    displayedColumns = ['operacion', 'resultado', 'fecha', 'acciones'];
    data = signal<HistorialResponse[]>([]);
    totalElements = signal(0);
    pageSize = signal(10);
    pageIndex = signal(0);
    cargando = signal(false);

    ngOnInit(): void {
        this.cargarHistorial();
    }

    cargarHistorial(): void {
        this.cargando.set(true);
        this.operacionService.getHistorial(this.pageIndex(), this.pageSize()).subscribe({
            next: (res) => {
                this.data.set(res.content);
                this.totalElements.set(res.totalElements);
                this.cargando.set(false);
            },
            error: () => {
                this.snackBar.open('Error al cargar historial', 'Cerrar', { duration: 3000 });
                this.cargando.set(false);
            },
        });
    }

    onPageChange(event: PageEvent): void {
        this.pageIndex.set(event.pageIndex);
        this.pageSize.set(event.pageSize);
        this.cargarHistorial();
    }

    verDetalle(id: number): void {
        this.router.navigate(['/historial', id]);
    }

    confirmarEliminar(operacion: HistorialResponse): void {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                titulo: 'Eliminar operación',
                mensaje: `¿Eliminar ${operacion.valor1} ${operacion.tipo} ${operacion.valor2} = ${operacion.resultado}?`,
            },
        });

        dialogRef.afterClosed().subscribe((confirmado) => {
            if (confirmado) {
                this.eliminar(operacion.id);
            }
        });
    }

    private eliminar(id: number): void {
        this.operacionService.eliminarOperacion(id).subscribe({
            next: () => {
                this.snackBar.open('Operación eliminada', 'Cerrar', { duration: 2000 });
                this.cargarHistorial();
            },
            error: () => {
                this.snackBar.open('Error al eliminar', 'Cerrar', { duration: 3000 });
            },
        });
    }

    getOperacionTexto(op: HistorialResponse): string {
        const symbols: Record<string, string> = {
            SUMA: '+',
            RESTA: '-',
            MULTIPLICACION: '×',
            DIVISION: '÷',
        };
        return `${op.valor1} ${symbols[op.tipo] || op.tipo} ${op.valor2}`;
    }
}