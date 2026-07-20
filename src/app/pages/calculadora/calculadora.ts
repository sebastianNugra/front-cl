import { Component, signal, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OperacionService } from '../../core/services/operacion.service';
import { TipoOperacion } from '../../models/operacion.model';

@Component({
    selector: 'app-calculadora',
    standalone: true,
    imports: [FormsModule, MatButtonModule, MatIconModule, MatTooltipModule],
    templateUrl: './calculadora.html',
    styleUrl: './calculadora.scss',
})
export class Calculadora {
    private readonly operacionService = inject(OperacionService);
    private readonly snackBar = inject(MatSnackBar);

    valor1 = signal('');
    valor2 = signal('');
    operacionSeleccionada = signal<TipoOperacion | null>(null);
    resultado = signal<number | null>(null);
    cargando = signal(false);
    displayExpression = computed(() => {
        const v1 = this.valor1();
        const op = this.operacionSeleccionada();
        const v2 = this.valor2();
        if (!v1) return '0';
        if (!op) return v1;
        if (!v2) return `${v1} ${this.getOperadorSymbol(op)}`;
        return `${v1} ${this.getOperadorSymbol(op)} ${v2}`;
    });

    readonly operaciones: { tipo: TipoOperacion; icon: string; label: string }[] = [
        { tipo: 'SUMA', icon: 'add', label: '+' },
        { tipo: 'RESTA', icon: 'remove', label: '-' },
        { tipo: 'MULTIPLICACION', icon: 'close', label: '×' },
        { tipo: 'DIVISION', icon: 'percent', label: '÷' },
    ];

    getOperadorSymbol(tipo: TipoOperacion): string {
        const map: Record<TipoOperacion, string> = {
            SUMA: '+',
            RESTA: '-',
            MULTIPLICACION: '×',
            DIVISION: '÷',
        };
        return map[tipo];
    }

    seleccionarOperacion(tipo: TipoOperacion): void {
        this.operacionSeleccionada.set(tipo);
        if (this.valor1() && !this.valor2()) {
            // Focus on valor2 input after selecting operation
        }
    }

    agregarDigito(digito: string): void {
        if (!this.operacionSeleccionada()) {
            this.valor1.update((v) => v + digito);
        } else {
            this.valor2.update((v) => v + digito);
        }
    }

    agregarPunto(): void {
        if (!this.operacionSeleccionada()) {
            if (!this.valor1().includes('.')) {
                this.valor1.update((v) => v + '.');
            }
        } else {
            if (!this.valor2().includes('.')) {
                this.valor2.update((v) => v + '.');
            }
        }
    }

    limpiar(): void {
        this.valor1.set('');
        this.valor2.set('');
        this.operacionSeleccionada.set(null);
        this.resultado.set(null);
    }

    calcular(): void {
        const v1 = parseFloat(this.valor1());
        const v2 = parseFloat(this.valor2());
        const tipo = this.operacionSeleccionada();

        if (isNaN(v1) || isNaN(v2) || !tipo) {
            this.snackBar.open('Completa todos los campos', 'Cerrar', { duration: 2000 });
            return;
        }

        this.cargando.set(true);
        this.operacionService.calcular({ valor1: v1, valor2: v2, tipo }).subscribe({
            next: (res) => {
                this.resultado.set(res.resultado);
                this.cargando.set(false);
            },
            error: (err) => {
                const msg = err.error?.message || 'Error al calcular';
                this.snackBar.open(msg, 'Cerrar', { duration: 3000 });
                this.cargando.set(false);
            },
        });
    }
}