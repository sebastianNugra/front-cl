import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./pages/calculadora/calculadora').then((m) => m.Calculadora),
    },
    {
        path: 'historial',
        loadComponent: () =>
            import('./pages/historial/historial').then((m) => m.Historial),
    },
    {
        path: 'historial/:id',
        loadComponent: () =>
            import('./pages/historial/detalle/detalle').then((m) => m.Detalle),
    },
    { path: '**', redirectTo: '' },
];