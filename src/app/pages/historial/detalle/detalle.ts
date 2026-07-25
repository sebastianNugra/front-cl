import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OperacionService } from '../../../core/services/operacion.service';
import { HistorialResponse, getOperadorSymbol } from '../../../models/operacion.model';

@Component({
    selector: 'app-detalle',
    standalone: true,
    templateUrl: './detalle.html',
    styleUrl: './detalle.scss',
})
export class Detalle implements OnInit {
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly operacionService = inject(OperacionService);

    operacion = signal<HistorialResponse | null>(null);
    cargando = signal(true);

    getOperadorSymbol = getOperadorSymbol;

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
                this.router.navigate(['/historial']);
            },
        });
    }

    volver(): void {
        this.router.navigate(['/historial']);
    }
}
