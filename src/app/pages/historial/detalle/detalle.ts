import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { OperacionService } from '../../../core/services/operacion.service';
import { HistorialResponse } from '../../../models/operacion.model';

@Component({
    selector: 'app-detalle',
    standalone: true,
    imports: [MatCardModule, MatButtonModule, MatIconModule, MatSnackBarModule],
    templateUrl: './detalle.html',
    styleUrl: './detalle.scss',
})
export class Detalle implements OnInit {
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly operacionService = inject(OperacionService);
    private readonly snackBar = inject(MatSnackBar);

    operacion = signal<HistorialResponse | null>(null);
    cargando = signal(true);

    ngOnInit(): void {
        const id = Number(this.route.snapshot.paramMap.get('id'));
        if (isNaN(id)) {
            this.router.navigate(['/historial']);
            return;
        }

        this.operacionService.getOperacion(id).subscribe({
            next: (res) => {
                this.operacion.set(res);
                this.cargando.set(false);
            },
            error: () => {
                this.snackBar.open('Operación no encontrada', 'Cerrar', { duration: 3000 });
                this.router.navigate(['/historial']);
            },
        });
    }

    volver(): void {
        this.router.navigate(['/historial']);
    }

    getOperadorSymbol(tipo: string): string {
        const map: Record<string, string> = {
            SUMA: '+',
            RESTA: '-',
            MULTIPLICACION: '×',
            DIVISION: '÷',
        };
        return map[tipo] || tipo;
    }
}