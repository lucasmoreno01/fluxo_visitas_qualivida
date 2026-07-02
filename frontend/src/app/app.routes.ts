import { Routes } from '@angular/router';
import { LoginPage } from './features/auth/pages/login/login-page';
import { AdminVisitsPage } from './features/admin/pages/visits/admin-visits-page';
import { ProfessionalAgendaPage } from './features/professional/pages/agenda/professional-agenda-page';
import { adminGuard, professionalGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginPage,
  },
  {
    path: 'profissional/agenda',
    component: ProfessionalAgendaPage,
    canActivate: [professionalGuard],
  },
  {
    path: 'admin/visitas',
    component: AdminVisitsPage,
    canActivate: [adminGuard],
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
