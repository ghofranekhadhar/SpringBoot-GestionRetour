import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RetourService } from '../../services/retour.service';
import { RetourProduit } from '../../models/retour.model';
import { UserBreadcrumb } from '../../components/user-breadcrumb/user-breadcrumb';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, UserBreadcrumb],
  template: `
    <div class="user-page fade-in">
      <app-user-breadcrumb></app-user-breadcrumb>

      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Bonjour, {{ userName }} 👋</h1>
          <p class="page-subtitle">Voici un aperçu des activités de retours produits.</p>
        </div>
      </div>

      <!-- Metrics -->
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-icon blue"><i class="ph ph-arrow-u-up-left"></i></div>
          <div class="metric-content">
            <span class="metric-label">Total Retours</span>
            <span class="metric-value">{{ totalRetours }}</span>
          </div>
          <div class="metric-trend neutral"><i class="ph ph-list-numbers"></i> Tous statuts</div>
        </div>

        <div class="metric-card">
          <div class="metric-icon orange"><i class="ph ph-clock"></i></div>
          <div class="metric-content">
            <span class="metric-label">En Attente</span>
            <span class="metric-value">{{ retoursEnAttente }}</span>
          </div>
          <div class="metric-trend warning"><i class="ph ph-hourglass"></i> À traiter</div>
        </div>

        <div class="metric-card">
          <div class="metric-icon green"><i class="ph ph-check-circle"></i></div>
          <div class="metric-content">
            <span class="metric-label">Validés</span>
            <span class="metric-value">{{ retoursValides }}</span>
          </div>
          <div class="metric-trend positive"><i class="ph ph-check"></i> Traités</div>
        </div>

        <div class="metric-card">
          <div class="metric-icon red"><i class="ph ph-x-circle"></i></div>
          <div class="metric-content">
            <span class="metric-label">Rejetés</span>
            <span class="metric-value">{{ retoursRejetes }}</span>
          </div>
          <div class="metric-trend negative"><i class="ph ph-x"></i> Refusés</div>
        </div>
      </div>

      <!-- Main Grid -->
      <div style="display:flex; gap:24px; margin-top:24px; flex-wrap:wrap;">
        <!-- Recent Activities -->
        <div class="widget-card" style="flex:1; min-width:400px;">
          <div class="widget-header">
            <h3 class="widget-title">
              <i class="ph ph-clock-counter-clockwise" style="margin-right:8px;color:#60a5fa;"></i>
              {{ userRole === 'EMPLOYE' ? 'Derniers retours du système' : 'Mes retours récents' }}
            </h3>
            <button class="text-link" (click)="goToRetours()" style="background:none;border:none;color:#60a5fa;cursor:pointer;font-size:0.85rem;font-weight:600;">
              Voir tout <i class="ph ph-arrow-right"></i>
            </button>
          </div>
          <div class="widget-body">
            <div class="empty-state" *ngIf="recentRetours.length === 0" style="padding: 40px 0; text-align:center;">
              <i class="ph ph-tray empty-icon" style="font-size: 2.5rem; opacity: 0.2; color:var(--text-secondary);"></i>
              <p style="margin-top: 10px; color: var(--text-secondary);">Aucun retour enregistré.</p>
            </div>

            <div class="activity-list" *ngIf="recentRetours.length > 0">
               <div class="activity-item" *ngFor="let r of recentRetours" style="display:flex; align-items:center; gap:16px; padding:12px 0; border-bottom:1px solid rgba(255,255,255,0.05);">
                  <div class="activity-icon" [ngClass]="getStatusClass(r.statut)" style="width:40px; height:40px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:1.2rem;">
                    <i class="ph" [ngClass]="getStatusIcon(r.statut)"></i>
                  </div>
                  <div class="activity-content" style="flex:1;">
                    <div class="activity-header" style="display:flex; justify-content:space-between; align-items:center;">
                      <strong style="font-size:0.9rem; color:var(--text-primary);">{{ r.produit?.nom }}</strong>
                      <span class="activity-time" style="font-size:0.75rem; color:var(--text-secondary);">{{ r.dateRetour | date:'dd/MM/yyyy' }}</span>
                    </div>
                    <div class="activity-desc" style="font-size:0.8rem; color:var(--text-secondary); margin-top:2px;">
                      <span *ngIf="userRole === 'EMPLOYE'" style="color:#60a5fa; font-weight:600;">{{ r.client?.nom || 'Client' }} - </span>
                      {{ r.motif | slice:0:60 }}{{ (r.motif || '').length > 60 ? '...' : '' }}
                    </div>
                  </div>
                  <div class="activity-status">
                    <span class="badge" [ngClass]="getStatusClass(r.statut)" style="padding:4px 10px; font-size:0.7rem;">{{ getStatusLabel(r.statut) }}</span>
                  </div>
               </div>
            </div>
          </div>
        </div>

        <!-- Sidebar stats/actions -->
        <div style="display:flex; flex-direction:column; gap:24px; width:320px;">
          <!-- Quick Stats -->
          <div class="widget-card">
            <div class="widget-header">
              <h3 class="widget-title"><i class="ph ph-chart-pie" style="margin-right:8px;color:#a78bfa;"></i>Répartition</h3>
            </div>
            <div class="widget-body" style="padding:20px;">
              <div class="chart-bars" *ngIf="totalRetours > 0">
                <div class="bar-item" style="margin-bottom:12px;">
                  <div style="display:flex; justify-content:space-between; margin-bottom:6px; font-size:0.8rem;">
                    <span>En attente</span>
                    <strong>{{ retoursEnAttente }}</strong>
                  </div>
                  <div class="bar-track" style="height:6px; background:rgba(255,255,255,0.05); border-radius:10px;">
                    <div class="bar-fill orange" [style.width.%]="(retoursEnAttente/totalRetours)*100" style="height:100%; border-radius:10px;"></div>
                  </div>
                </div>
                <div class="bar-item">
                  <div style="display:flex; justify-content:space-between; margin-bottom:6px; font-size:0.8rem;">
                    <span>Traités</span>
                    <strong>{{ retoursValides + retoursRejetes }}</strong>
                  </div>
                  <div class="bar-track" style="height:6px; background:rgba(255,255,255,0.05); border-radius:10px;">
                    <div class="bar-fill green" [style.width.%]="((retoursValides + retoursRejetes)/totalRetours)*100" style="height:100%; border-radius:10px;"></div>
                  </div>
                </div>
              </div>

              <!-- SVG Donut -->
              <div style="display:flex; justify-content:center; margin-top:20px;">
                <svg viewBox="0 0 100 100" width="100" height="100">
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgba(255,255,255,0.05)" stroke-width="10"/>
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#3b82f6" stroke-width="10" 
                          [attr.stroke-dasharray]="251.2" 
                          [attr.stroke-dashoffset]="251.2 - (251.2 * (totalRetours > 0 ? 1 : 0))"
                          transform="rotate(-90 50 50)"/>
                  <text x="50" y="50" text-anchor="middle" dominant-baseline="middle" fill="white" font-size="16" font-weight="800">{{ totalRetours }}</text>
                  <text x="50" y="65" text-anchor="middle" dominant-baseline="middle" fill="rgba(255,255,255,0.5)" font-size="8">TOTAL</text>
                </svg>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="widget-card">
            <div class="widget-header">
              <h3 class="widget-title"><i class="ph ph-lightning" style="margin-right:8px;color:#fb923c;"></i>Actions</h3>
            </div>
            <div class="widget-body" style="padding:16px; display:flex; flex-direction:column; gap:12px;">
              <button class="action-tile" (click)="router.navigate(['/user/nouveau-retour'])" style="display:flex; align-items:center; gap:12px; width:100%; padding:12px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:12px; color:white; cursor:pointer; text-align:left;">
                 <div style="width:36px; height:36px; border-radius:10px; background:rgba(59,130,246,0.15); color:#60a5fa; display:flex; align-items:center; justify-content:center; font-size:1.2rem;">
                    <i class="ph ph-plus-circle"></i>
                 </div>
                 <div style="flex:1;">
                    <div style="font-size:0.85rem; font-weight:700;">{{ userRole === 'EMPLOYE' ? 'Enregistrer un retour' : 'Nouveau retour' }}</div>
                    <div style="font-size:0.75rem; color:var(--text-secondary);">Pour un client</div>
                 </div>
                 <i class="ph ph-caret-right" style="color:var(--text-secondary);"></i>
              </button>
              
              <button class="action-tile" (click)="goToRetours()" style="display:flex; align-items:center; gap:12px; width:100%; padding:12px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:12px; color:white; cursor:pointer; text-align:left;">
                 <div style="width:36px; height:36px; border-radius:10px; background:rgba(167,139,250,0.15); color:#a78bfa; display:flex; align-items:center; justify-content:center; font-size:1.2rem;">
                    <i class="ph ph-list-bullets"></i>
                 </div>
                 <div style="flex:1;">
                    <div style="font-size:0.85rem; font-weight:700;">{{ userRole === 'EMPLOYE' ? 'Tous les retours' : 'Mes retours' }}</div>
                    <div style="font-size:0.75rem; color:var(--text-secondary);">Consulter la liste</div>
                 </div>
                 <i class="ph ph-caret-right" style="color:var(--text-secondary);"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .activity-icon.badge-orange { background: rgba(249,115,22,0.15); color: #fb923c; }
    .activity-icon.badge-green  { background: rgba(34,197,94,0.15);  color: #4ade80; }
    .activity-icon.badge-red    { background: rgba(239,68,68,0.15);  color: #f87171; }
    .activity-icon.badge-blue   { background: rgba(59,130,246,0.15); color: #60a5fa; }
    
    .bar-fill.orange { background: #fb923c; }
    .bar-fill.green  { background: #4ade80; }
    .bar-fill.red    { background: #f87171; }
    
    .action-tile:hover {
      background: rgba(255,255,255,0.06) !important;
      border-color: rgba(59,130,246,0.3) !important;
    }
  `],
  styleUrls: ['../user-shared.css']
})
export class UserDashboard implements OnInit {
  userName = '';
  userRole = '';
  totalRetours = 0;
  retoursEnAttente = 0;
  retoursValides = 0;
  retoursRejetes = 0;
  recentRetours: RetourProduit[] = [];

  constructor(
    private authService: AuthService,
    private retourService: RetourService,
    public router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUser;
    if (user) {
      this.userName = user.nom;
      this.userRole = (user.role || '').trim().toUpperCase();
    }
    
    this.authService.currentUser$.subscribe(u => {
      if (u) {
        this.userName = u.nom;
        this.userRole = (u.role || '').trim().toUpperCase();
      }
    });

    const isClient = user?.role === 'CLIENT';
    const source$ = isClient ? this.retourService.getMyRetours() : this.retourService.getRetours();

    source$.subscribe({
      next: (data) => {
        this.totalRetours = data.length;
        this.retoursEnAttente = data.filter(r => { const s = (r.statut || '').toUpperCase(); return s.includes('ATTENTE') || s.includes('PENDING'); }).length;
        this.retoursValides   = data.filter(r => { const s = (r.statut || '').toUpperCase(); return s.includes('VALID'); }).length;
        this.retoursRejetes   = data.filter(r => { const s = (r.statut || '').toUpperCase(); return s.includes('REJET') || s.includes('REFUS'); }).length;
        
        // Trier par date décroissante pour le dashboard
        this.recentRetours = [...data]
          .sort((a,b) => new Date(b.dateRetour || 0).getTime() - new Date(a.dateRetour || 0).getTime())
          .slice(0, 5);
      },
      error: (err) => console.error('Erreur dashboard', err)
    });
  }

  getStatusClass(statut: string): string {
    const s = (statut || '').toUpperCase();
    if (s.includes('VALID')) return 'badge-green';
    if (s.includes('REJET') || s.includes('REFUS')) return 'badge-red';
    if (s.includes('ATTENTE') || s.includes('PENDING')) return 'badge-orange';
    return 'badge-blue';
  }

  getStatusIcon(statut: string): string {
    const s = (statut || '').toUpperCase();
    if (s.includes('VALID')) return 'ph-check-circle';
    if (s.includes('REJET') || s.includes('REFUS')) return 'ph-x-circle';
    return 'ph-hourglass';
  }

  getStatusLabel(statut: string): string {
    const s = (statut || '').toUpperCase();
    if (s.includes('VALID')) return 'Validé';
    if (s.includes('REJET') || s.includes('REFUS')) return 'Rejeté';
    return 'En attente';
  }

  goToRetours(): void {
    this.router.navigate(['/user/mes-retours']);
  }
}
