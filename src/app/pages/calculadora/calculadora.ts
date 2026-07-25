import { Component, signal, computed, inject, HostListener } from '@angular/core';
import { OperacionService } from '../../core/services/operacion.service';
import { TipoOperacion, getOperadorSymbol } from '../../models/operacion.model';

interface ButtonDef {
    label: string;
    action: 'digit' | 'operator' | 'decimal' | 'equals' | 'clear' | 'clearEntry' | 'backspace';
    value: string;
    colSpan?: number;
    style: string;
}

@Component({
    selector: 'app-calculadora',
    standalone: true,
    templateUrl: './calculadora.html',
    styleUrl: './calculadora.scss',
})
export class Calculadora {
    private readonly operacionService = inject(OperacionService);

    valor1 = signal('');
    valor2 = signal('');
    operacionSeleccionada = signal<TipoOperacion | null>(null);
    resultado = signal<number | null>(null);
    cargando = signal(false);
    errorMsg = signal('');

    readonly buttons: ButtonDef[] = [
        { label: 'AC',  action: 'clear',       value: '',   style: 'bg-red-900/60 hover:bg-red-800/80 text-red-300' },
        { label: 'CE',  action: 'clearEntry',  value: '',   style: 'bg-orange-900/60 hover:bg-orange-800/80 text-orange-300' },
        { label: '⌫',  action: 'backspace',   value: '',   style: 'bg-gray-700/60 hover:bg-gray-600/80 text-gray-300' },
        { label: '÷',   action: 'operator',    value: 'DIVISION', style: 'bg-accent-cyan/80 hover:bg-accent-cyan text-white font-bold' },

        { label: '7',  action: 'digit',  value: '7',  style: 'bg-gray-700/60 hover:bg-gray-600/80 text-white' },
        { label: '8',  action: 'digit',  value: '8',  style: 'bg-gray-700/60 hover:bg-gray-600/80 text-white' },
        { label: '9',  action: 'digit',  value: '9',  style: 'bg-gray-700/60 hover:bg-gray-600/80 text-white' },
        { label: '×',  action: 'operator', value: 'MULTIPLICACION', style: 'bg-accent-cyan/80 hover:bg-accent-cyan text-white font-bold' },

        { label: '4',  action: 'digit',  value: '4',  style: 'bg-gray-700/60 hover:bg-gray-600/80 text-white' },
        { label: '5',  action: 'digit',  value: '5',  style: 'bg-gray-700/60 hover:bg-gray-600/80 text-white' },
        { label: '6',  action: 'digit',  value: '6',  style: 'bg-gray-700/60 hover:bg-gray-600/80 text-white' },
        { label: '-',  action: 'operator', value: 'RESTA', style: 'bg-accent-cyan/80 hover:bg-accent-cyan text-white font-bold' },

        { label: '1',  action: 'digit',  value: '1',  style: 'bg-gray-700/60 hover:bg-gray-600/80 text-white' },
        { label: '2',  action: 'digit',  value: '2',  style: 'bg-gray-700/60 hover:bg-gray-600/80 text-white' },
        { label: '3',  action: 'digit',  value: '3',  style: 'bg-gray-700/60 hover:bg-gray-600/80 text-white' },
        { label: '+',  action: 'operator', value: 'SUMA', style: 'bg-accent-cyan/80 hover:bg-accent-cyan text-white font-bold' },

        { label: '0',  action: 'digit',  value: '0',  style: 'bg-gray-700/60 hover:bg-gray-600/80 text-white', colSpan: 2 },
        { label: '.',  action: 'decimal', value: '.', style: 'bg-gray-700/60 hover:bg-gray-600/80 text-white' },
        { label: '=',  action: 'equals',  value: '',   style: 'bg-accent-purple/80 hover:bg-accent-purple text-white font-bold' },
    ];

    displayExpression = computed(() => {
        const v1 = this.valor1();
        const op = this.operacionSeleccionada();
        const v2 = this.valor2();
        if (!v1) return '';
        if (!op) return v1;
        if (!v2) return `${v1} ${getOperadorSymbol(op)}`;
        return `${v1} ${getOperadorSymbol(op)} ${v2}`;
    });

    displayResult = computed(() => {
        const r = this.resultado();
        if (r === null) return null;
        if (Number.isInteger(r)) return String(r);
        return parseFloat(r.toFixed(8)).toString();
    });

    onButtonPress(button: ButtonDef): void {
        switch (button.action) {
            case 'digit':
                this.agregarDigito(button.value);
                break;
            case 'operator':
                this.seleccionarOperacion(button.value as TipoOperacion);
                break;
            case 'decimal':
                this.agregarPunto();
                break;
            case 'equals':
                this.calcular();
                break;
            case 'clear':
                this.limpiar();
                break;
            case 'clearEntry':
                this.limpiarEntrada();
                break;
            case 'backspace':
                this.borrarUltimo();
                break;
        }
    }

    agregarDigito(digito: string): void {
        this.errorMsg.set('');

        if (this.resultado() !== null) {
            this.valor1.set(String(this.displayResult()));
            this.resultado.set(null);
            this.valor2.set('');
            this.operacionSeleccionada.set(null);
        }

        const target = this.operacionSeleccionada() ? this.valor2 : this.valor1;

        if (target() === '0' && digito === '0') return;
        if (target() === '0' && digito !== '0') {
            target.set(digito);
        } else {
            target.update((v) => v + digito);
        }
    }

    agregarPunto(): void {
        this.errorMsg.set('');

        if (this.resultado() !== null) {
            this.valor1.set(String(this.displayResult()));
            this.resultado.set(null);
            this.valor2.set('');
            this.operacionSeleccionada.set(null);
        }

        const target = this.operacionSeleccionada() ? this.valor2 : this.valor1;
        if (target().includes('.')) return;

        if (target() === '') {
            target.set('0.');
        } else {
            target.update((v) => v + '.');
        }
    }

    seleccionarOperacion(tipo: TipoOperacion): void {
        this.errorMsg.set('');
        if (this.valor1()) {
            this.operacionSeleccionada.set(tipo);
        }
    }

    borrarUltimo(): void {
        this.errorMsg.set('');

        if (this.resultado() !== null) {
            this.resultado.set(null);
            return;
        }

        if (this.valor2()) {
            this.valor2.update((v) => v.slice(0, -1));
        } else if (this.operacionSeleccionada()) {
            this.operacionSeleccionada.set(null);
        } else if (this.valor1()) {
            this.valor1.update((v) => v.slice(0, -1));
        }
    }

    limpiar(): void {
        this.valor1.set('');
        this.valor2.set('');
        this.operacionSeleccionada.set(null);
        this.resultado.set(null);
        this.errorMsg.set('');
        this.cargando.set(false);
    }

    limpiarEntrada(): void {
        this.errorMsg.set('');

        if (this.resultado() !== null) {
            this.limpiar();
            return;
        }

        if (this.valor2()) {
            this.valor2.set('');
        } else if (this.operacionSeleccionada()) {
            this.operacionSeleccionada.set(null);
        } else {
            this.valor1.set('');
        }
    }

    calcular(): void {
        const v1 = parseFloat(this.valor1());
        const v2 = parseFloat(this.valor2());
        const tipo = this.operacionSeleccionada();

        if (isNaN(v1) || isNaN(v2) || !tipo) {
            this.errorMsg.set('Completa la operación');
            return;
        }

        this.cargando.set(true);
        this.errorMsg.set('');

        this.operacionService
            .calcular({ valor1: v1, valor2: v2, tipo })
            .subscribe({
                next: ({ resultado }) => {
                    this.resultado.set(resultado);
                    this.cargando.set(false);
                },
                error: (err) => {
                    this.errorMsg.set(err.error?.message || 'Error al calcular');
                    this.cargando.set(false);
                },
            });
    }

    @HostListener('document:keydown', ['$event'])
    onKeydown(event: KeyboardEvent): void {
        const { key } = event;

        if (/^\d$/.test(key)) {
            return this.agregarDigito(key);
        }

        if (key === '.') {
            return this.agregarPunto();
        }

        const opMap: Record<string, TipoOperacion> = {
            '+': 'SUMA',
            '-': 'RESTA',
            '*': 'MULTIPLICACION',
            '/': 'DIVISION',
        };

        if (opMap[key]) {
            if (key === '/') event.preventDefault();
            return this.seleccionarOperacion(opMap[key]);
        }

        switch (key) {
            case 'Enter':
            case '=':
                event.preventDefault();
                return this.calcular();
            case 'Escape':
                return this.limpiar();
            case 'Backspace':
                return this.borrarUltimo();
        }
    }
}
