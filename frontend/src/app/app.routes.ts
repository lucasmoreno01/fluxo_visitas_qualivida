import { Routes } from '@angular/router';
import { LoginPage } from './features/auth/pages/login/login-page';
import { AdminVisitsPage } from './features/admin/pages/visits/admin-visits-page';
import { ProfessionalAgendaPage } from './features/professional/pages/agenda/professional-agenda-page';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginPage,
  },
  {
    path: 'profissional/agenda',
    component: ProfessionalAgendaPage,
  },
  {
    path: 'admin/visitas',
    component: AdminVisitsPage,
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
