import { Routes } from '@angular/router';
import { RetourListComponent } from './retour-list/retour-list.component';
import { RetourFormComponent } from './retour-form/retour-form.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { HomeComponent } from './home/home.component';
import { authGuard } from './guards/auth.guard';

// Admin Components
import { Dashboard } from './admin/dashboard/dashboard';
import { ProductsList } from './admin/products/products-list/products-list';
import { ReturnsList } from './admin/returns/returns-list/returns-list';
import { UsersList } from './admin/users/users-list/users-list';
import { NonConformiteList } from './admin/non-conformites/non-conformite-list';
import { HistoriqueList } from './admin/historique/historique-list';

// User Components
import { UserDashboard } from './user/dashboard/user-dashboard';
import { UserProducts } from './user/products/user-products';
import { UserRetours } from './user/retours/user-retours';
import { NouveauRetour } from './user/nouveau-retour/nouveau-retour';

export const routes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },

  // Legacy routes (kept for backward compatibility)
  { path: 'retours', component: RetourListComponent, canActivate: [authGuard] },
  { path: 'retours/nouveau', component: RetourFormComponent, canActivate: [authGuard] },

  // ── Routes Admin ──
  {
    path: 'admin',
    canActivate: [authGuard],
    data: { role: 'ADMIN' },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: Dashboard },
      { path: 'products', component: ProductsList },
      { path: 'returns', component: ReturnsList },
      { path: 'returns/validate', component: ReturnsList },
      { path: 'non-conformites', component: NonConformiteList },
      { path: 'historique', component: HistoriqueList },
      { path: 'users', component: UsersList }
    ]
  },

  // ── Routes User (Employé / Qualité) ──
  {
    path: 'user',
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard',     component: UserDashboard },
      { path: 'produits',      component: UserProducts  },
      { path: 'mes-retours',   component: UserRetours   },
      { path: 'nouveau-retour', component: NouveauRetour }
    ]
  },

  { path: '**', redirectTo: '' }
];
