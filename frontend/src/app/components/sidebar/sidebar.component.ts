import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { filter } from 'rxjs/operators';
import { NotificationService, Notification } from '../../services/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Overlay for mobile when sidebar is open -->
    <div class="sidebar-overlay" *ngIf="isOpen" (click)="toggleSidebar()"></div>

    <aside class="sidebar" [class.open]="isOpen">
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

      <div class="sidebar-nav">
<!-- Rest of the sidebar HTML remains the same... -->
        <p class="nav-section-title">Menu Principal</p>
        
        <a routerLink="/admin/dashboard" class="nav-item" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
          <i class="ph ph-squares-four nav-icon"></i>
          <span class="nav-label">Dashboard</span>
        </a>

        <!-- Gestion des Produits -->
        <a routerLink="/admin/products" class="nav-item" routerLinkActive="active" [routerLinkActiveOptions]="{exact: false}">
          <i class="ph ph-package nav-icon"></i>
          <span class="nav-label">Produits</span>
        </a>

        <!-- Gestion des Retours -->
        <a routerLink="/admin/returns" class="nav-item" routerLinkActive="active" [routerLinkActiveOptions]="{exact: false}">
          <i class="ph ph-arrow-u-up-left nav-icon"></i>
          <span class="nav-label">Retours</span>
        </a>

        <!-- Non Conformités -->
        <a routerLink="/admin/non-conformites" class="nav-item" routerLinkActive="active" [routerLinkActiveOptions]="{exact: false}">
          <i class="ph ph-warning-circle nav-icon"></i>
          <span class="nav-label">Non-Conformités</span>
        </a>

        <!-- Historique des Retours -->
        <a routerLink="/admin/historique" class="nav-item" routerLinkActive="active" [routerLinkActiveOptions]="{exact: false}">
          <i class="ph ph-clock-clockwise nav-icon"></i>
          <span class="nav-label">Historique</span>
        </a>

        <!-- Utilisateurs (Uniquement pour ADMIN) -->
        <ng-container *ngIf="userRole === 'ADMIN'">
          <p class="nav-section-title mt-4">Administration</p>
          <a routerLink="/admin/users" class="nav-item" routerLinkActive="active" [routerLinkActiveOptions]="{exact: false}">
            <i class="ph ph-users nav-icon"></i>
            <span class="nav-label">Utilisateurs</span>
          </a>
        </ng-container>
      </div>

      <div class="sidebar-footer">
        <div class="user-profile">
          <div class="avatar">
            <i class="ph ph-user"></i>
          </div>
          <div class="user-info">
            <span class="user-name">{{ userName || 'Chargement...' }}</span>
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

    .notif-wrapper { position: relative; }
    .header-icon-btn {
      background: none; border: none; color: var(--text-muted);
      font-size: 1.4rem; cursor: pointer; padding: 6px;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.2s; border-radius: 8px; position: relative;
    }
    .header-icon-btn:hover { color: white; background: var(--hover-bg); }
    .header-icon-btn.has-unread { color: #3b82f6; }
    
    .notif-badge {
      position: absolute; top: 4px; right: 4px;
      background: #ef4444; color: white; font-size: 0.65rem;
      min-width: 14px; height: 14px; border-radius: 7px;
      display: flex; align-items: center; justify-content: center;
      font-weight: bold; border: 2px solid var(--sidebar-bg);
    }

    .notif-dropdown {
      position: absolute; top: 45px; left: 0; width: 300px;
      background: #111827; border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      z-index: 1000; overflow: hidden; animation: slideDown 0.2s ease-out;
    }
    @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }

    .notif-header {
      padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.05);
      display: flex; justify-content: space-between; align-items: center;
      font-size: 0.85rem; font-weight: bold; color: white;
    }
    .notif-header button {
      background: none; border: none; color: #3b82f6; font-size: 0.75rem; cursor: pointer;
    }

    .notif-body { max-height: 350px; overflow-y: auto; }
    .notif-empty { padding: 40px 20px; text-align: center; color: var(--text-muted); }
    .notif-empty i { font-size: 2rem; margin-bottom: 8px; }

    .notif-item {
      padding: 12px 16px; display: flex; gap: 12px; cursor: pointer;
      border-bottom: 1px solid rgba(255,255,255,0.03); transition: background 0.2s;
    }
    .notif-item:hover { background: rgba(255,255,255,0.03); }
    .notif-item.unread { background: rgba(59,130,246,0.05); }
    
    .notif-icon {
      width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center; font-size: 1.1rem;
    }
    .notif-icon.info    { background: rgba(59,130,246,0.1); color: #3b82f6; }
    .notif-icon.success { background: rgba(34,197,94,0.1);  color: #22c55e; }
    .notif-icon.warning { background: rgba(249,115,22,0.1); color: #f97316; }
    .notif-icon.error   { background: rgba(239,68,68,0.1);  color: #ef4444; }

    .notif-content { flex: 1; min-width: 0; }
    .notif-title { font-weight: 600; font-size: 0.85rem; color: white; margin-bottom: 2px; }
    .notif-message { font-size: 0.78rem; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .notif-date { font-size: 0.7rem; color: var(--text-muted); margin-top: 4px; display: block; }

    .notif-footer { padding: 8px; text-align: center; border-top: 1px solid rgba(255,255,255,0.05); }
    .notif-footer button { background: none; border: none; color: var(--text-muted); font-size: 0.75rem; cursor: pointer; }
    .notif-footer button:hover { color: #ef4444; }

      --active-bg: rgba(249, 115, 22, 0.1);
      --accent-color: #f97316;
    }

    * {
      box-sizing: border-box;
      font-family: 'Inter', sans-serif;
    }

    /* Overlay for Mobile */
    .sidebar-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      backdrop-filter: blur(2px);
      z-index: 1040;
      display: none;
    }

    /* Sidebar Container */
    .sidebar {
      position: fixed;
      top: 0;
      left: 0;
      height: 100vh;
      width: var(--sidebar-width);
      background: var(--sidebar-bg);
      border-right: 1px solid var(--sidebar-border);
      display: flex;
      flex-direction: column;
      z-index: 1050;
      transition: transform 0.3s ease;
      box-shadow: 4px 0 24px rgba(0,0,0,0.15);
    }

    /* Header */
    .sidebar-header {
      height: 76px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      border-bottom: 1px solid var(--sidebar-border);
      flex-shrink: 0;
    }
    
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .brand-blocks {
      display: flex;
      gap: 4px;
    }
    .block-a, .block-b {
      display: block;
      background: white;
      border-radius: 3px;
    }
    .block-a { width: 14px; height: 24px; }
    .block-b { width: 14px; height: 14px; align-self: flex-end; }
    .brand-name {
      color: white;
      font-size: 1.15rem;
      font-weight: 700;
      letter-spacing: -0.3px;
    }

    .close-btn {
      background: transparent;
      border: none;
      color: var(--text-main);
      font-size: 1.5rem;
      cursor: pointer;
      display: none; /* hidden on desktop */
    }

    /* Navigation */
    .sidebar-nav {
      flex: 1;
      padding: 24px 16px;
      overflow-y: auto;
    }

    /* Scrollbar styling */
    .sidebar-nav::-webkit-scrollbar { width: 4px; }
    .sidebar-nav::-webkit-scrollbar-track { background: transparent; }
    .sidebar-nav::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }

    .nav-section-title {
      font-size: 0.65rem;
      text-transform: uppercase;
      font-weight: 700;
      color: var(--text-muted);
      letter-spacing: 1.2px;
      margin: 0 0 12px 12px;
    }

    .mt-4 { margin-top: 24px; }

    /* Nav Item */
    .nav-item {
      display: flex;
      align-items: center;
      padding: 12px 14px;
      border-radius: 10px;
      color: var(--text-main);
      text-decoration: none;
      font-size: 0.92rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      margin-bottom: 4px;
      position: relative;
    }

    .nav-item:hover {
      background: var(--hover-bg);
      color: white;
    }

    /* Active State styling */
    .nav-item.active {
      background: var(--active-bg);
      color: var(--accent-color);
      font-weight: 600;
    }

    .nav-item.active::before {
      content: '';
      position: absolute;
      left: -16px;
      top: 50%;
      transform: translateY(-50%);
      height: 60%;
      width: 4px;
      background: var(--accent-color);
      border-radius: 0 4px 4px 0;
    }

    .nav-icon {
      font-size: 1.25rem;
      margin-right: 12px;
      color: inherit;
    }

    .dropdown-icon {
      margin-left: auto;
      font-size: 0.9rem;
      transition: transform 0.3s ease;
      color: var(--text-muted);
    }

    .active-group .dropdown-icon {
      transform: rotate(180deg);
    }
    
    .active-group {
      background: rgba(0,0,0,0.2) !important;
    }

    /* Submenu */
    .submenu {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.3s ease;
      background: rgba(0,0,0,0.15);
      border-radius: 0 0 10px 10px;
      margin-top: -4px;
      margin-bottom: 4px;
    }

    .submenu.expanded {
      max-height: 200px;
    }

    .submenu-item {
      display: flex;
      align-items: center;
      padding: 10px 14px 10px 48px;
      color: var(--text-muted);
      text-decoration: none;
      font-size: 0.85rem;
      font-weight: 500;
      transition: all 0.2s;
      position: relative;
    }

    /* Submenu Active line */
    .submenu-item::before {
      content: '';
      position: absolute;
      left: 24px;
      top: 50%;
      transform: translateY(-50%);
      width: 6px;
      height: 6px;
      border-radius: 50%;
      border: 1px solid var(--text-muted);
      transition: all 0.2s;
    }

    .submenu-item:hover {
      color: white;
    }

    .submenu-item:hover::before {
      border-color: white;
    }

    .submenu-item.active {
      color: white;
      font-weight: 600;
    }

    .submenu-item.active::before {
      background: var(--accent-color);
      border-color: var(--accent-color);
    }

    /* Footer / User Area */
    .sidebar-footer {
      padding: 20px;
      border-top: 1px solid var(--sidebar-border);
      background: rgba(0,0,0,0.1);
    }

    .user-profile {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }

    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #2563eb, #1e40af);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      color: white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }

    .user-info {
      display: flex;
      flex-direction: column;
    }

    .user-name {
      font-size: 0.9rem;
      font-weight: 600;
      color: white;
    }

    .user-role {
      font-size: 0.7rem;
      font-weight: 700;
      color: var(--accent-color);
      letter-spacing: 0.5px;
    }

    .logout-btn {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      background: rgba(2ef, 68, 68, 0.1);
      color: #ef4444;
      border: 1px solid rgba(239, 68, 68, 0.2);
      padding: 10px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 600;
      transition: all 0.2s;
    }

    .logout-btn:hover {
      background: #ef4444;
      color: white;
    }

    .theme-toggle-btn {
      background: transparent;
      border: 1px solid var(--sidebar-border);
      color: rgba(255,255,255,0.85);
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-left: auto;
      margin-right: 12px;
    }
    .theme-toggle-btn:hover {
      background: rgba(255,255,255,0.1);
      transform: rotate(15deg);
    }
    
    @media (max-width: 991px) {
      .theme-toggle-btn {
        display: none; /* hidden on mobile sidebar because it is in topbar */
      }
    }

    /* Responsive configuration */
    @media (max-width: 991px) {
      .sidebar {
        transform: translateX(-100%);
      }
      
      .sidebar.open {
        transform: translateX(0);
      }
      
      .sidebar-overlay {
        display: block; /* managed by ngIf realistically */
      }

      .close-btn {
        display: block;
      }
    }
  `]
})
export class SidebarComponent implements OnInit {
  @Input() isOpen = false;
  @Output() toggle = new EventEmitter<void>();

  openGroup: string | null = null;
  isLightMode = false;
  userName = '';
  userRole = '';
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

    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.userName = user.nom;
        this.userRole = (user.role || '').trim().toUpperCase();
      }
    });

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.checkActiveRoute();
    });
    this.checkActiveRoute();
    this.notifSub = this.notifService.getNotifications().subscribe(notifs => {
      this.notifications = notifs;
      this.unreadCount = this.notifService.unreadCount;
    });

    // Close notifications when clicking outside
    document.addEventListener('click', () => {
      this.showNotifications = false;
    });
  }

  checkActiveRoute() {
    const url = this.router.url;
    if (url.includes('/admin/products')) {
      this.openGroup = 'products';
    } else if (url.includes('/admin/returns')) {
      this.openGroup = 'returns';
    } else if (url.includes('/admin/users')) {
      this.openGroup = 'users';
    } else {
      this.openGroup = null;
    }
  }

  toggleGroup(group: string) {
    this.openGroup = this.openGroup === group ? null : group;
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

  ngOnDestroy() {
    this.notifSub?.unsubscribe();
  }
}

