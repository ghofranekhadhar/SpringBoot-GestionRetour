import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterModule, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { ThemeService } from './services/theme.service';
import { filter } from 'rxjs/operators';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { UserSidebarComponent } from './user/user-sidebar/user-sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule, SidebarComponent, UserSidebarComponent],
  template: `
    <div class="app-wrapper"
         [class.has-sidebar]="hasAdminSidebar || hasUserSidebar"
         [class.admin-bg]="hasAdminSidebar || hasUserSidebar">

      <!-- ── Admin Sidebar ── -->
      <app-sidebar
        *ngIf="hasAdminSidebar"
        [isOpen]="isSidebarOpen"
        (toggle)="toggleSidebar()">
      </app-sidebar>

      <!-- ── User Sidebar ── -->
      <app-user-sidebar
        *ngIf="hasUserSidebar"
        [isOpen]="isSidebarOpen"
        (toggle)="toggleSidebar()">
      </app-user-sidebar>

      <!-- ── Navbar (public / no sidebar) ── -->
      <nav class="navbar" *ngIf="!isAuthPage && !hasAdminSidebar && !hasUserSidebar">
        <!-- Logo gauche -->
        <div class="navbar-brand">
          <a routerLink="/" class="brand-link">
            <div class="brand-blocks">
              <span class="block-a"></span>
              <span class="block-b"></span>
            </div>
            <span class="brand-name">RetourTrack</span>
          </a>
        </div>

        <!-- Liens centrés -->
        <div class="navbar-menu">
          <a routerLink="/" class="nav-item" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">Accueil</a>
          <ng-container *ngIf="isLoggedIn">
            <a routerLink="/retours" class="nav-item" routerLinkActive="active">Mes Retours</a>
            <a routerLink="/retours/nouveau" class="nav-item" routerLinkActive="active">Nouveau Retour</a>
          </ng-container>
        </div>

        <!-- Actions droite -->
        <div class="navbar-actions">
          <ng-container *ngIf="isLoggedIn; else loginBtn">
            <span class="nav-badge">{{ userRole }}</span>
            <button (click)="logout()" class="nav-btn logout-btn">Déconnexion</button>
          </ng-container>
          <ng-template #loginBtn>
            <a routerLink="/login" class="nav-btn login-btn">Connexion</a>
          </ng-template>
        </div>
      </nav>

      <!-- ── Mobile Topbar (sidebar users) ── -->
      <header class="mobile-topbar d-lg-none" *ngIf="(hasAdminSidebar || hasUserSidebar) && !isAuthPage">
        <button class="menu-toggle" (click)="toggleSidebar()">
          <i class="ph ph-list"></i>
        </button>
        <div class="mobile-brand">
          <div class="brand-blocks">
            <span class="block-a"></span>
            <span class="block-b"></span>
          </div>
          <span class="brand-name">RetourTrack</span>
        </div>
        <div>
          <button class="theme-toggle-btn" style="margin:0;" (click)="toggleTheme()" title="Basculer le thème">
            <i class="ph" [ngClass]="isLightMode ? 'ph-moon' : 'ph-sun'"></i>
          </button>
        </div>
      </header>

      <!-- ==============================================
           CONTENU PRINCIPAL
      =============================================== -->
      <main [class.auth-page-main]="isAuthPage" class="main-content">
        <router-outlet></router-outlet>
      </main>

      <footer class="footer" *ngIf="!isAuthPage && !hasAdminSidebar && !hasUserSidebar">
        <div class="footer-inner">
          <div class="footer-brand">
            <div class="brand-blocks">
              <span class="block-a"></span>
              <span class="block-b"></span>
            </div>
            <span class="brand-name">RetourTrack</span>
          </div>
          <p class="footer-text">Système de gestion des retours produits</p>
          <p class="footer-copy">&copy; {{ currentYear }} Tous droits réservés.</p>
        </div>
      </footer>

    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

    * { box-sizing: border-box; }

    /* ── Layout ── */
    .app-wrapper {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      font-family: 'Inter', sans-serif;
      transition: padding-left 0.3s ease;
    }
    .main-content { flex: 1; }
    .auth-page-main {
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    /* Admin specific background */
    .admin-bg {
      background-color: var(--bg-admin); 
    }

    /* Has Sidebar Layout (Desktop) */
    @media (min-width: 992px) {
      .app-wrapper.has-sidebar {
        padding-left: 270px; /* var(--sidebar-width) from sidebar component */
        flex-direction: column; /* keep stack since we don't have a top nav */
      }
    }

    /* Mobile Topbar for Admin Sidebar */
    .mobile-topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 60px;
      padding: 0 16px;
      background: #060d1f; /* Force dark background */
      color: white; 
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }
    
    .menu-toggle {
      background: transparent;
      border: none;
      color: white;
      font-size: 1.5rem;
      cursor: pointer;
    }

    .mobile-brand {
      font-weight: 700;
      font-size: 1.1rem;
      display: flex;
      align-items: center;
      gap: 12px;
      color: white;
    }

    @media (min-width: 992px) {
      .d-lg-none {
        display: none !important;
      }
    }

    /* ══════════════════════════════════════════
       NAVBAR (Public / Employee)
    ══════════════════════════════════════════ */
    .navbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 56px;
      height: 76px;
      background: transparent;
      position: absolute; /* Assuming hero sections handle spacing */
      top: 0;
      left: 0;
      right: 0;
      z-index: 100;
    }

    .brand-link {
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
      flex-shrink: 0;
      color: white;
    }
    .brand-blocks {
      display: flex;
      gap: 4px;
      flex-shrink: 0;
    }
    .block-a, .block-b {
      display: block;
      background: currentColor;
      border-radius: 3px;
    }
    .block-a { width: 14px; height: 24px; }
    .block-b { width: 14px; height: 14px; align-self: flex-end; }
    .brand-name {
      font-size: 1.18rem;
      font-weight: 800;
      color: currentColor;
      letter-spacing: -0.3px;
    }

    .navbar-menu {
      display: flex;
      align-items: center;
      gap: 0;
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
    }
    .nav-item {
      position: relative;
      color: rgba(255,255,255,0.7);
      text-decoration: none;
      padding: 10px 18px;
      font-size: 0.92rem;
      font-weight: 500;
      letter-spacing: 0.2px;
      transition: color 0.2s;
      white-space: nowrap;
    }
    .nav-item::after {
      content: '';
      position: absolute;
      bottom: 5px;
      left: 18px;
      right: 18px;
      height: 2px;
      background: linear-gradient(90deg, #f97316, #ef4444);
      border-radius: 99px;
      transform: scaleX(0);
      transform-origin: left center;
      transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .nav-item:hover        { color: white; }
    .nav-item:hover::after { transform: scaleX(1); }
    .nav-item.active        { color: white; font-weight: 600; }
    .nav-item.active::after { transform: scaleX(1); }

    .navbar-actions {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-shrink: 0;
    }
    
    .theme-toggle-btn {
      background: transparent;
      border: 1px solid rgba(255,255,255,0.15);
      color: white;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-right: 8px;
    }
    .theme-toggle-btn:hover {
      background: rgba(255,255,255,0.1);
      transform: rotate(15deg);
    }

    .nav-badge {
      background: rgba(255,255,255,0.1);
      color: #bfdbfe;
      padding: 5px 14px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.1px;
      border: 1px solid rgba(255,255,255,0.15);
    }
    .nav-btn {
      display: inline-block;
      padding: 10px 26px;
      border-radius: 30px;
      font-size: 0.9rem;
      font-weight: 700;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.25s;
      font-family: 'Inter', sans-serif;
      border: none;
      letter-spacing: 0.1px;
    }
    .login-btn {
      background: white;
      color: #060d1f;
      box-shadow: 0 2px 14px rgba(0,0,0,0.22);
    }
    .login-btn:hover {
      background: #f0f6ff;
      transform: translateY(-2px);
      box-shadow: 0 6px 22px rgba(0,0,0,0.28);
    }
    .logout-btn {
      background: transparent;
      color: white;
      border: 1.5px solid rgba(255,255,255,0.15) !important;
    }
    .logout-btn:hover {
      background: rgba(255,255,255,0.1);
      border-color: rgba(255,255,255,0.4) !important;
    }

    /* ══════════════════════════════════════════
       FOOTER
    ══════════════════════════════════════════ */
    .footer {
      background: var(--bg-master);
      border-top: 1px solid var(--border-color);
      color: var(--text-secondary);
      padding: 32px 56px;
      text-align: center;
    }
    .footer-inner { max-width: 1200px; margin: 0 auto; }
    .footer-brand {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      font-size: 1rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 8px;
    }
    .footer-text { margin: 0 0 5px; font-size: 0.82rem; }
    .footer-copy  { margin: 0; font-size: 0.75rem; opacity: 0.55; }
  `]
})
export class AppComponent implements OnInit {
  isLoggedIn = false;
  userRole = '';
  isAuthPage = false;
  isUserPage = false;
  isSidebarOpen = false;
  currentUrl = '';
  currentYear = new Date().getFullYear();
  isLightMode = false;

  get hasAdminSidebar(): boolean {
    if (!this.isLoggedIn || this.isAuthPage) return false;
    // L'admin a toujours le sidebar admin
    if (this.userRole === 'ADMIN') return true;
    // Le service QUALITE a le sidebar admin sur les pages admin
    if (this.userRole === 'QUALITE' && this.isQualiteAdminPage) return true;
    return false;
  }

  get hasUserSidebar(): boolean {
    if (!this.isLoggedIn || this.isAuthPage) return false;
    if (this.userRole === 'ADMIN') return false;
    if (this.isUserPage) return true;
    
    // QUALITE utilise le admin sidebar sur les pages admin (dashboard, returns, nc, historique)
    // On ne retourne true ici que si on n'est pas sur une page admin qualite
    if (this.userRole === 'QUALITE' && !this.isQualiteAdminPage) return true;

    // EMPLOYE accède aux non-conformités avec le user sidebar
    if (this.userRole === 'EMPLOYE' && this.currentUrl.includes('/admin/non-conformites')) return true;
    return false;
  }

  get isQualiteAdminPage(): boolean {
    return this.currentUrl.includes('/admin/returns') ||
           this.currentUrl.includes('/admin/products') ||
           this.currentUrl.includes('/admin/non-conformites') ||
           this.currentUrl.includes('/admin/historique') ||
           this.currentUrl.includes('/admin/dashboard');
  }

  private readonly authRoutes = ['/login', '/signup'];
  private readonly userRoutePrefix = '/user';

  constructor(
    private authService: AuthService, 
    private router: Router,
    private themeService: ThemeService
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
      this.userRole = user ? user.role : '';
    });

    this.themeService.isLightMode$.subscribe((isLight: boolean) => {
      this.isLightMode = isLight;
    });

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const urlWithoutQuery = event.urlAfterRedirects.split('?')[0];
      this.currentUrl = urlWithoutQuery;
      this.isAuthPage = this.authRoutes.includes(urlWithoutQuery);
      this.isUserPage = urlWithoutQuery.startsWith(this.userRoutePrefix);
      if (this.isSidebarOpen) {
        this.isSidebarOpen = false;
      }
    });

    const initialUrl = this.router.url.split('?')[0];
    this.currentUrl = initialUrl;
    this.isAuthPage = this.authRoutes.includes(initialUrl);
    this.isUserPage = initialUrl.startsWith(this.userRoutePrefix);
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
