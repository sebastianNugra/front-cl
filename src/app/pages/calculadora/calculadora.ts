import { Component, signal, computed, inject, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { OperacionService } from '../../core/services/operacion.service';
import { TipoOperacion, getOperadorSymbol } from '../../models/operacion.model';

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
    lastKeyPressed = signal('');

    readonly operaciones: { tipo: TipoOperacion; icon: string; key: string }[] = [
        { tipo: 'SUMA', icon: 'add', key: '+' },
        { tipo: 'RESTA', icon: 'remove', key: '-' },
        { tipo: 'MULTIPLICACION', icon: 'close', key: '*' },
        { tipo: 'DIVISION', icon: 'percent', key: '/' },
    ];

    private readonly operationKeys: Record<string, TipoOperacion> = {
        '+': 'SUMA',
        '-': 'RESTA',
        '*': 'MULTIPLICACION',
        '/': 'DIVISION',
    };

    displayExpression = computed(() => {
        const v1 = this.valor1();
        const op = this.operacionSeleccionada();
        const v2 = this.valor2();

        if (!v1) return '0';
        if (!op) return v1;
        if (!v2) return `${v1} ${getOperadorSymbol(op)}`;

        return `${v1} ${getOperadorSymbol(op)} ${v2}`;
    });

    seleccionarOperacion(tipo: TipoOperacion): void {
        this.operacionSeleccionada.set(tipo);
    }

    agregarDigito(digito: string): void {
        const target = this.operacionSeleccionada()
            ? this.valor2
            : this.valor1;

        target.update((valor) => valor + digito);
    }

    agregarPunto(): void {
        const target = this.operacionSeleccionada()
            ? this.valor2
            : this.valor1;

        if (!target().includes('.')) {
            target.update((valor) => valor + '.');
        }
    }

    borrarUltimo(): void {
        if (!this.operacionSeleccionada()) {
            this.valor1.update((valor) => valor.slice(0, -1));
            return;
        }

        if (!this.valor2()) {
            this.operacionSeleccionada.set(null);
            return;
        }

        this.valor2.update((valor) => valor.slice(0, -1));
    }

    limpiar(): void {
        this.valor1.set('');
        this.valor2.set('');
        this.operacionSeleccionada.set(null);
        this.resultado.set(null);
    }

    calcular(): void {
        const valor1 = parseFloat(this.valor1());
        const valor2 = parseFloat(this.valor2());
        const tipo = this.operacionSeleccionada();

        if (isNaN(valor1) || isNaN(valor2) || !tipo) {
            this.snackBar.open('Completa todos los campos', 'Cerrar', {
                duration: 2000,
            });
            return;
        }

        this.cargando.set(true);

        this.operacionService
            .calcular({
                valor1,
                valor2,
                tipo,
            })
            .subscribe({
                next: ({ resultado }) => {
                    this.resultado.set(resultado);
                    this.cargando.set(false);
                },
                error: ({ error }) => {
                    this.snackBar.open(
                        error?.message || 'Error al calcular',
                        'Cerrar',
                        { duration: 3000 }
                    );

                    this.cargando.set(false);
                },
            });
    }

    @HostListener('document:keydown', ['$event'])
    onKeydown(event: KeyboardEvent): void {
        const { key } = event;

        if (/^\d$/.test(key)) {
            this.agregarDigito(key);
            return this.flashKey(key);
        }

        if (key === '.') {
            this.agregarPunto();
            return this.flashKey(key);
        }

        const operation = this.operationKeys[key];

        if (operation) {
            if (key === '/') {
                event.preventDefault();
            }

            this.seleccionarOperacion(operation);
            return this.flashKey(key);
        }

        switch (key) {
            case 'Enter':
            case '=':
                return this.calcular();

            case 'Escape':
                return this.limpiar();

            case 'Backspace':
                return this.borrarUltimo();
        }
    }

    private flashKey(key: string): void {
        this.lastKeyPressed.set(key);

        setTimeout(() => {
            this.lastKeyPressed.set('');
        }, 150);
    }
}