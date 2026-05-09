import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { filter } from 'rxjs/operators';
import { NotificationService, Notification } from '../../services/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Overlay mobile -->
    <div class="sidebar-overlay" *ngIf="isOpen" (click)="toggleSidebar()"></div>

    <aside class="sidebar" [class.open]="isOpen">
      <!-- Header / Brand -->
      <div class="sidebar-header">
        <a href="javascript:window.location.reload()" class="brand" style="text-decoration:none;">
          <div class="brand-blocks">
            <span class="block-a"></span>
            <span class="block-b"></span>
          </div>
          <span class="brand-name">RetourTrack</span>
        </a>
        <div style="display:flex; align-items:center; gap:8px;">
          <!-- Notification Bell -->
          <div class="notif-wrapper">
            <button class="header-icon-btn" (click)="toggleNotifications($event)" [class.has-unread]="unreadCount > 0">
              <i class="ph ph-bell"></i>
              <span class="notif-badge" *ngIf="unreadCount > 0">{{ unreadCount }}</span>
            </button>
            
            <!-- Notif Dropdown -->
            <div class="notif-dropdown" *ngIf="showNotifications" (click)="$event.stopPropagation()">
              <div class="notif-header">
                <span>Notifications</span>
                <button (click)="markAllAsRead()">Tout marquer lu</button>
              </div>
              <div class="notif-body">
                <div *ngIf="notifications.length === 0" class="notif-empty">
                  <i class="ph ph-bell-slash"></i>
                  <p>Aucune notification</p>
                </div>
                <div class="notif-item" *ngFor="let n of notifications" [class.unread]="!n.isRead" (click)="onNotifClick(n)">
                  <div class="notif-icon" [ngClass]="n.type">
                    <i class="ph" [ngClass]="getNotifIcon(n.type)"></i>
                  </div>
                  <div class="notif-content">
                    <p class="notif-title">{{ n.title }}</p>
                    <p class="notif-message">{{ n.message }}</p>
                    <span class="notif-date">{{ n.date | date:'shortTime' }}</span>
                  </div>
                </div>
              </div>
              <div class="notif-footer" *ngIf="notifications.length > 0">
                <button (click)="clearAll()">Tout effacer</button>
              </div>
            </div>
          </div>

          <button class="theme-toggle-btn" (click)="toggleTheme()" title="Basculer le thème">
            <i class="ph" [ngClass]="isLightMode ? 'ph-moon' : 'ph-sun'"></i>
          </button>
        </div>
        <button class="close-btn d-lg-none" (click)="toggleSidebar()">
          <i class="ph ph-x"></i>
        </button>
      </div>

      <!-- Role Badge -->
      <div class="role-badge-wrapper">
        <span class="role-chip" [ngClass]="getRoleChipClass()">
          <i class="ph" [ngClass]="getRoleIcon()"></i>
          {{ getRoleLabel() }}
        </span>
      </div>

      <!-- Navigation -->
      <div class="sidebar-nav">
        <p class="nav-section-title">Menu Principal</p>

        <a [routerLink]="userRole === 'QUALITE' ? '/admin/dashboard' : '/user/dashboard'" class="nav-item" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
          <i class="ph ph-squares-four nav-icon"></i>
          <span class="nav-label">Tableau de bord</span>
        </a>

        <a routerLink="/user/produits" class="nav-item" routerLinkActive="active">
          <i class="ph ph-package nav-icon"></i>
          <span class="nav-label">Catalogue Produits</span>
        </a>

        <p class="nav-section-title mt-4">{{ userRole === 'EMPLOYE' ? 'Gestion des Retours' : 'Mes Retours' }}</p>

        <a routerLink="/user/mes-retours" class="nav-item" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
          <i class="ph ph-arrow-u-up-left nav-icon"></i>
          <span class="nav-label">{{ userRole === 'EMPLOYE' ? 'Liste des Retours' : 'Mes Retours' }}</span>
          <span class="nav-badge" *ngIf="pendingCount > 0">{{ pendingCount }}</span>
        </a>

        <a routerLink="/user/nouveau-retour" class="nav-item" routerLinkActive="active">
          <i class="ph ph-plus-circle nav-icon"></i>
          <span class="nav-label">{{ userRole === 'EMPLOYE' ? 'Enregistrer un retour' : 'Nouveau Retour' }}</span>
        </a>

        <!-- Section Qualité (visible pour QUALITE et EMPLOYE) -->
        <ng-container *ngIf="userRole === 'QUALITE' || userRole === 'EMPLOYE'">
          <p class="nav-section-title mt-4">Gestion Qualité</p>
          <a *ngIf="userRole === 'QUALITE'" routerLink="/admin/returns" class="nav-item" routerLinkActive="active">
            <i class="ph ph-check-square nav-icon"></i>
            <span class="nav-label">Valider les Retours</span>
          </a>
          <a routerLink="/admin/non-conformites" class="nav-item" routerLinkActive="active">
            <i class="ph ph-warning nav-icon"></i>
            <span class="nav-label">Non-Conformités</span>
          </a>
          <a *ngIf="userRole === 'QUALITE'" routerLink="/admin/historique" class="nav-item" routerLinkActive="active">
            <i class="ph ph-clock-clockwise nav-icon"></i>
            <span class="nav-label">Historique</span>
          </a>
        </ng-container>
      </div>

      <!-- Footer / User Profile -->
      <div class="sidebar-footer">
        <div class="user-profile">
          <div class="avatar">
            <i class="ph ph-user"></i>
          </div>
          <div class="user-info">
            <span class="user-name">{{ userName || 'Employé' }}</span>
            <span class="user-role">{{ userRole }}</span>
          </div>
        </div>
        <button class="logout-btn" (click)="onLogout()">
          <i class="ph ph-sign-out"></i>
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  `,
  styles: [`
    :host {
      --sidebar-width: 270px;
      --sidebar-bg: #060d1f;
      --sidebar-border: rgba(255,255,255,0.06);
      --text-main: rgba(255,255,255,0.85);
      --text-muted: rgba(255,255,255,0.45);
      --hover-bg: rgba(255,255,255,0.04);
      --active-bg: rgba(249, 115, 22, 0.1);
      --accent-color: #f97316;
    }

    /* Notification UI */
    .notif-wrapper { position: relative; }
    .header-icon-btn {
      background: none; border: none; color: var(--text-muted);
      font-size: 1.3rem; cursor: pointer; padding: 6px;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.2s; border-radius: 8px; position: relative;
    }
    .header-icon-btn:hover { color: white; background: var(--hover-bg); }
    .header-icon-btn.has-unread { color: #3b82f6; }
    
    .notif-badge {
      position: absolute; top: 4px; right: 4px;
      background: #ef4444; color: white; font-size: 0.6rem;
      min-width: 13px; height: 13px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-weight: bold; border: 1.5px solid var(--sidebar-bg);
    }

    .notif-dropdown {
      position: absolute; top: 45px; left: -100px; width: 280px;
      background: #111827; border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      z-index: 1000; overflow: hidden; animation: slideDown 0.2s ease-out;
    }
    @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }

    .notif-header {
      padding: 10px 14px; border-bottom: 1px solid rgba(255,255,255,0.05);
      display: flex; justify-content: space-between; align-items: center;
      font-size: 0.8rem; font-weight: bold; color: white;
    }
    .notif-header button { background: none; border: none; color: #3b82f6; font-size: 0.7rem; cursor: pointer; }

    .notif-body { max-height: 300px; overflow-y: auto; }
    .notif-empty { padding: 30px 20px; text-align: center; color: var(--text-muted); }
    .notif-empty i { font-size: 1.8rem; margin-bottom: 6px; }

    .notif-item {
      padding: 10px 14px; display: flex; gap: 10px; cursor: pointer;
      border-bottom: 1px solid rgba(255,255,255,0.03); transition: background 0.2s;
    }
    .notif-item:hover { background: rgba(255,255,255,0.03); }
    .notif-item.unread { background: rgba(59,130,246,0.05); }
    
    .notif-icon {
      width: 32px; height: 32px; border-radius: 8px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center; font-size: 1rem;
    }
    .notif-icon.info    { background: rgba(59,130,246,0.1); color: #3b82f6; }
    .notif-icon.success { background: rgba(34,197,94,0.1);  color: #22c55e; }
    .notif-icon.warning { background: rgba(249,115,22,0.1); color: #f97316; }
    .notif-icon.error   { background: rgba(239,68,68,0.1);  color: #ef4444; }

    .notif-content { flex: 1; min-width: 0; }
    .notif-title { font-weight: 600; font-size: 0.8rem; color: white; margin-bottom: 1px; }
    .notif-message { font-size: 0.75rem; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .notif-date { font-size: 0.65rem; color: var(--text-muted); margin-top: 2px; display: block; }

    .notif-footer { padding: 6px; text-align: center; border-top: 1px solid rgba(255,255,255,0.05); }
    .notif-footer button { background: none; border: none; color: var(--text-muted); font-size: 0.7rem; cursor: pointer; }

    /* Original Sidebar Styles */
    .sidebar {
      position: fixed; top: 0; left: 0; bottom: 0;
      width: var(--sidebar-width); background: var(--sidebar-bg);
      border-right: 1px solid var(--sidebar-border);
      display: flex; flex-direction: column; z-index: 1000;
      transition: all 0.3s ease;
    }

    .sidebar-header {
      padding: 24px; display: flex; align-items: center; gap: 12px;
    }

    .brand {
      display: flex; align-items: center; gap: 12px;
    }
    .brand-blocks {
      display: flex; gap: 4px;
    }
    .block-a, .block-b {
      display: block;
      background: white;
      border-radius: 3px;
    }
    .block-a { width: 14px; height: 24px; }
    .block-b { width: 14px; height: 14px; align-self: flex-end; }
    .brand-name {
      font-size: 1.25rem; font-weight: 800;
      background: linear-gradient(to right, #fff, rgba(255,255,255,0.6));
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      letter-spacing: -0.5px;
    }

    .role-badge-wrapper { padding: 0 24px 16px; }
    .role-chip {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 6px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 700;
    }
    .role-client { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
    .role-employe { background: rgba(34, 197, 94, 0.1); color: #22c55e; }
    .role-qualite { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }

    .sidebar-nav { flex: 1; padding: 0 16px; overflow-y: auto; }
    .nav-section-title {
      padding: 0 12px; margin-bottom: 8px; font-size: 0.7rem;
      font-weight: 700; color: var(--text-muted); text-transform: uppercase;
      letter-spacing: 1px;
    }
    .nav-item {
      display: flex; align-items: center; gap: 12px; padding: 12px;
      border-radius: 10px; color: var(--text-main); text-decoration: none;
      font-size: 0.9rem; font-weight: 500; transition: all 0.2s; margin-bottom: 2px;
    }
    .nav-item:hover { background: var(--hover-bg); color: white; }
    .nav-item.active { background: var(--active-bg); color: var(--accent-color); font-weight: 600; }
    .nav-icon { font-size: 1.2rem; }
    .nav-badge {
      margin-left: auto; background: #f97316; color: white;
      font-size: 0.7rem; font-weight: 700; padding: 2px 8px; border-radius: 10px;
    }

    .sidebar-footer { padding: 16px; border-top: 1px solid var(--sidebar-border); }
    .user-profile { display: flex; align-items: center; gap: 12px; padding: 12px; margin-bottom: 12px; }
    .avatar {
      width: 40px; height: 40px; border-radius: 12px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      display: flex; align-items: center; justify-content: center; font-size: 1.2rem;
      color: white; box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }
    .user-info { display: flex; flex-direction: column; }
    .user-name { font-size: 0.9rem; font-weight: 600; color: white; }
    .user-role { font-size: 0.7rem; font-weight: 700; color: var(--accent-color); letter-spacing: 0.5px; }

    .logout-btn {
      width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;
      background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2);
      padding: 10px; border-radius: 8px; cursor: pointer; font-size: 0.85rem; font-weight: 600; transition: all 0.2s;
    }
    .logout-btn:hover { background: #ef4444; color: white; }

    .theme-toggle-btn {
      background: transparent; border: 1px solid var(--sidebar-border);
      color: rgba(255,255,255,0.85); width: 32px; height: 32px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center; font-size: 1rem; cursor: pointer;
      transition: all 0.3s ease; margin-left: auto; margin-right: 10px;
    }
    .theme-toggle-btn:hover { background: rgba(255,255,255,0.1); transform: rotate(15deg); }

    .close-btn { background: transparent; border: none; color: var(--text-main); font-size: 1.4rem; cursor: pointer; display: none; }

    @media (max-width: 991px) {
      .sidebar { transform: translateX(-100%); }
      .sidebar.open { transform: translateX(0); }
      .close-btn { display: block; }
      .theme-toggle-btn { display: none; }
    }
  `]
})
export class UserSidebarComponent implements OnInit, OnDestroy {
  @Input() isOpen = false;
  @Output() toggle = new EventEmitter<void>();

  isLightMode = false;
  userName = '';
  userRole = '';
  pendingCount = 0;
  notifications: Notification[] = [];
  unreadCount = 0;
  showNotifications = false;
  private notifSub?: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router,
    private themeService: ThemeService,
    private notifService: NotificationService
  ) {}

  ngOnInit() {
    this.themeService.isLightMode$.subscribe((isLight: boolean) => {
      this.isLightMode = isLight;
    });

    this.authService.currentUser$.subscribe(u => {
      if (u) {
        this.userRole = (u.role || '').trim().toUpperCase();
        this.userName = u.nom;
      }
    });

    this.notifSub = this.notifService.getNotifications().subscribe(notifs => {
      this.notifications = notifs;
      this.unreadCount = this.notifService.unreadCount;
    });

    // Close notifications when clicking outside
    document.addEventListener('click', this.closeNotifDropdown.bind(this));
  }

  private closeNotifDropdown() {
    this.showNotifications = false;
  }

  toggleNotifications(event: Event) {
    event.stopPropagation();
    this.showNotifications = !this.showNotifications;
  }

  markAllAsRead() {
    this.notifService.markAllAsRead();
  }

  clearAll() {
    this.notifService.clearAll();
  }

  onNotifClick(n: Notification) {
    this.notifService.markAsRead(n.id);
    if (n.route) {
      this.router.navigate([n.route]);
    }
    this.showNotifications = false;
  }

  getNotifIcon(type: string): string {
    switch (type) {
      case 'success': return 'ph-check-circle';
      case 'warning': return 'ph-warning-circle';
      case 'error':   return 'ph-x-circle';
      default:        return 'ph-info';
    }
  }

  getRoleChipClass() {
    if (this.userRole === 'CLIENT') return 'role-client';
    if (this.userRole === 'EMPLOYE') return 'role-employe';
    if (this.userRole === 'QUALITE') return 'role-qualite';
    return '';
  }

  getRoleIcon() {
    if (this.userRole === 'CLIENT') return 'ph-user';
    if (this.userRole === 'EMPLOYE') return 'ph-identification-card';
    if (this.userRole === 'QUALITE') return 'ph-shield-check';
    return 'ph-user';
  }

  getRoleLabel() {
    if (this.userRole === 'CLIENT') return 'CLIENT';
    if (this.userRole === 'EMPLOYE') return 'EMPLOYÉ';
    if (this.userRole === 'QUALITE') return 'SERVICE QUALITÉ';
    return this.userRole;
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  toggleSidebar() {
    this.toggle.emit();
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  ngOnDestroy() {
    this.notifSub?.unsubscribe();
    document.removeEventListener('click', this.closeNotifDropdown.bind(this));
  }
}
