import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Breadcrumb } from '../../../components/breadcrumb/breadcrumb';
import { RetourService } from '../../../services/retour.service';
import { AuthService } from '../../../services/auth.service';
import { RetourProduit } from '../../../models/retour.model';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-returns-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, Breadcrumb],
  template: `
    <div class="admin-page fade-in">
      <app-breadcrumb></app-breadcrumb>

      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Gestion des Retours</h1>
          <p class="page-subtitle">Examinez, validez ou rejetez les demandes de retour produits.</p>
        </div>
        <div>
          <span class="pending-badge" *ngIf="pendingCount > 0">
            <i class="ph ph-warning-circle"></i>
            {{ pendingCount }} en attente de traitement
          </span>
        </div>
      </div>

      <!-- Filter & Search Container -->
      <div style="display:flex; flex-direction:column; gap:16px; margin-bottom:24px; width:100%;">
        
        <!-- Ligne 1: Recherche (Taille normale) -->
        <div class="search-box" style="position:relative; width:400px; max-width:100%;">
          <i class="ph ph-magnifying-glass" style="position:absolute; left:16px; top:50%; transform:translateY(-50%); color:#94a3b8; font-size:1.1rem;"></i>
          <input type="text" placeholder="Rechercher produit, motif…"
                 class="form-control" style="width:100%; padding:12px 16px 12px 44px; margin:0; background:var(--card-bg); border-radius:12px;"
                 [(ngModel)]="searchQuery" (ngModelChange)="applyFilters()" />
        </div>

        <!-- Ligne 2: Filtres à gauche, Tri à droite -->
        <div style="display:flex; justify-content:space-between; align-items:center; gap:16px; flex-wrap:wrap; width:100%;">
          <div class="stats-row" style="display:flex; gap:12px; margin:0;">
            <div class="stat-chip" [class.active]="activeFilter==='ALL'" (click)="setFilter('ALL')">
              <i class="ph ph-list-numbers"></i>
              <span>Tous</span>
              <strong>{{ retours.length }}</strong>
            </div>
            <div class="stat-chip" [class.active-w]="activeFilter==='PENDING'" (click)="setFilter('PENDING')">
              <i class="ph ph-hourglass"></i>
              <span>En attente</span>
              <strong>{{ countBy('PENDING') }}</strong>
            </div>
            <div class="stat-chip" [class.active-s]="activeFilter==='VALID'" (click)="setFilter('VALID')">
              <i class="ph ph-check-circle"></i>
              <span>Validés</span>
              <strong>{{ countBy('VALID') }}</strong>
            </div>
            <div class="stat-chip" [class.active-d]="activeFilter==='REJECT'" (click)="setFilter('REJECT')">
              <i class="ph ph-x-circle"></i>
              <span>Rejetés</span>
              <strong>{{ countBy('REJECT') }}</strong>
            </div>
          </div>

          <button class="form-control" (click)="toggleSort()" style="margin:0; cursor:pointer; width:auto; display:flex; align-items:center; gap:8px; background:var(--card-bg); border-radius:12px; padding:12px 20px;">
            <i class="ph" [ngClass]="sortOrder === 'DESC' ? 'ph-sort-descending' : 'ph-sort-ascending'"></i>
            {{ sortOrder === 'DESC' ? 'Récents' : 'Anciens' }}
          </button>
        </div>
      </div>

      <!-- Main Table Card -->
      <div class="widget-card">
        <div class="widget-header">
          <h3 class="widget-title">
            <i class="ph ph-arrow-u-up-left" style="margin-right:8px;color:#fb923c;"></i>
            Liste des retours
          </h3>
        </div>

        <div class="widget-body p-0">
          <!-- Loading -->
          <div *ngIf="isLoading" style="padding:40px;text-align:center;color:var(--text-secondary);">
            <p style="margin-top:12px;">Chargement des retours…</p>
          </div>

          <div *ngIf="!isLoading" class="table-container">
            <table class="admin-table">
              <thead>
                <tr>
                  <th style="width:80px;">ID</th>
                  <th>Produit</th>
                  <th>Motif</th>
                  <th style="width:120px;">Date</th>
                  <th style="width:160px;">Statut</th>
                  <th style="width:180px;text-align:center;">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let ret of filteredRetours" class="table-row-hover">
                  <td>
                    <span style="font-family:monospace;font-size:0.82rem;color:var(--text-secondary);">
                      #{{ ret.id }}
                    </span>
                  </td>
                  <td>
                    <div style="display:flex;align-items:center;gap:10px;">
                      <div class="prod-avatar"><i class="ph ph-package"></i></div>
                      <span style="font-weight:600;">{{ ret.produit?.nom || 'Produit inconnu' }}</span>
                    </div>
                  </td>
                  <td class="motif-cell" [title]="ret.motif">
                    {{ ret.motif && ret.motif.length > 35 ? (ret.motif | slice:0:35) + '…' : ret.motif }}
                  </td>
                  <td style="font-size:0.84rem;color:var(--text-secondary);">
                    {{ ret.dateRetour | date:'dd/MM/yyyy' }}
                  </td>
                  <td>
                    <span class="badge" [ngClass]="getStatusClass(ret.statut)">
                      <i class="ph" [ngClass]="getStatusIcon(ret.statut)"></i>
                      {{ getStatusLabel(ret.statut) }}
                    </span>
                  </td>
                  <td>
                    <div class="action-btns" style="justify-content:center;gap:6px;">
                      <ng-container *ngIf="isPending(ret.statut)">
                        <button class="action-btn validate-icon-btn" (click)="openConfirm(ret, 'VALIDER')">
                          <i class="ph ph-check-circle"></i>
                          <span class="btn-tooltip">Valider</span>
                        </button>
                        <button class="action-btn reject-icon-btn" (click)="openConfirm(ret, 'REJETER')">
                          <i class="ph ph-x-circle"></i>
                          <span class="btn-tooltip">Rejeter</span>
                        </button>
                      </ng-container>
                      <button *ngIf="!isPending(ret.statut)" class="action-btn" title="Voir les détails" (click)="openDetail(ret)">
                        <i class="ph ph-eye"></i>
                      </button>
                    </div>
                  </td>
                </tr>

                <tr *ngIf="filteredRetours.length === 0">
                  <td colspan="6">
                    <div class="empty-state" style="padding:50px 0;">
                      <i class="ph ph-arrow-u-up-left empty-icon"></i>
                      <p *ngIf="searchQuery">Aucun résultat pour « {{ searchQuery }} ».</p>
                      <p *ngIf="!searchQuery">Aucun retour à afficher.</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div *ngIf="!isLoading && filteredRetours.length > 0"
            style="padding:12px 20px;font-size:0.82rem;color:var(--text-secondary);border-top:1px solid var(--border-color);display:flex;align-items:center;gap:6px;">
            <i class="ph ph-list-numbers"></i>
            {{ filteredRetours.length }} résultat(s) affiché(s)
          </div>
        </div>
      </div>
    </div>

    <!-- ======================================================
         MODAL CONFIRMATION (Valider / Rejeter)
    ====================================================== -->
    <div class="modal-overlay" *ngIf="confirmModal" (click)="closeConfirm()">
      <div class="modal-container" (click)="$event.stopPropagation()">
        <div class="widget-card">
          <div class="widget-header">
            <div style="display:flex;align-items:center;gap:12px;">
              <div class="modal-icon" [ngClass]="confirmAction === 'VALIDER' ? 'icon-green' : 'icon-red'">
                <i class="ph" [ngClass]="confirmAction === 'VALIDER' ? 'ph-check-circle' : 'ph-x-circle'"></i>
              </div>
              <div>
                <h3 class="widget-title">
                  {{ confirmAction === 'VALIDER' ? 'Valider le retour' : 'Rejeter le retour' }}
                </h3>
                <p style="margin:3px 0 0;font-size:0.84rem;color:#64748b;">
                  Retour #{{ confirmModal.id }} — {{ confirmModal.produit?.nom }}
                </p>
              </div>
            </div>
            <button style="background:none;border:none;cursor:pointer;font-size:1.4rem;color:#64748b;" (click)="closeConfirm()">
              <i class="ph ph-x"></i>
            </button>
          </div>

          <div class="widget-body" style="padding:24px;">
            <!-- Alert banner -->
            <div class="confirm-alert" [ngClass]="confirmAction === 'VALIDER' ? 'alert-green' : 'alert-red'">
              <i class="ph" [ngClass]="confirmAction === 'VALIDER' ? 'ph-info' : 'ph-warning'"></i>
              <p *ngIf="confirmAction === 'VALIDER'">
                En validant ce retour, le produit sera marqué comme retourné et le stock sera mis à jour automatiquement.
              </p>
              <p *ngIf="confirmAction === 'REJETER'">
                En rejetant ce retour, la demande sera clôturée. L'employé sera notifié du refus.
              </p>
            </div>

            <!-- Retour summary -->
            <div class="retour-summary">
              <div class="summary-row">
                <span class="summary-label"><i class="ph ph-package"></i> Produit</span>
                <span class="summary-val">{{ confirmModal.produit?.nom || 'Inconnu' }}</span>
              </div>
              <div class="summary-row">
                <span class="summary-label"><i class="ph ph-chat-text"></i> Motif</span>
                <span class="summary-val">{{ confirmModal.motif }}</span>
              </div>
              <div class="summary-row">
                <span class="summary-label"><i class="ph ph-calendar"></i> Date</span>
                <span class="summary-val">{{ confirmModal.dateRetour | date:'dd MMMM yyyy' }}</span>
              </div>
            </div>

            <!-- Raison de rejet -->
            <div *ngIf="confirmAction === 'REJETER'" style="margin-top:18px;">
              <label class="form-label" style="color:#334155;">
                <i class="ph ph-note-pencil"></i>
                Motif du rejet
                <span style="font-size:0.76rem;color:#94a3b8;font-weight:400;">(optionnel)</span>
              </label>
              <textarea class="form-control modal-textarea"
                placeholder="Ex: Délai de retour dépassé, produit non concerné par la politique de retour…"
                [(ngModel)]="rejetRaison"
                rows="3">
              </textarea>
            </div>

            <!-- Actions -->
            <div class="form-actions" style="margin-top:20px;padding-top:16px;">
              <button class="primary-btn"
                [ngClass]="confirmAction === 'VALIDER' ? 'btn-green' : 'btn-red'"
                [disabled]="isProcessing"
                (click)="confirmerAction()">
                <ng-container *ngIf="!isProcessing">
                  <i class="ph" [ngClass]="confirmAction === 'VALIDER' ? 'ph-check-circle' : 'ph-x-circle'"></i>
                  {{ confirmAction === 'VALIDER' ? 'Confirmer la validation' : 'Confirmer le rejet' }}
                </ng-container>
                <ng-container *ngIf="isProcessing">
                  <span class="spinner"></span> Traitement…
                </ng-container>
              </button>
              <button class="secondary-btn" (click)="closeConfirm()" [disabled]="isProcessing">
                <i class="ph ph-arrow-left"></i> Annuler
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ======================================================
         MODAL DÉTAIL (retours déjà traités)
    ====================================================== -->
    <div class="modal-overlay" *ngIf="detailModal" (click)="closeDetail()">
      <div class="modal-container" (click)="$event.stopPropagation()">
        <div class="widget-card">
          <div class="widget-header">
            <div>
              <h3 class="widget-title">Détail du retour #{{ detailModal.id }}</h3>
              <p style="margin:4px 0 0;font-size:0.84rem;color:#64748b;">Informations complètes de la demande</p>
            </div>
            <button style="background:none;border:none;cursor:pointer;font-size:1.4rem;color:#64748b;" (click)="closeDetail()">
              <i class="ph ph-x"></i>
            </button>
          </div>
          <div class="widget-body" style="padding:24px;">
            <div class="confirm-alert" [ngClass]="getDetailBannerClass(detailModal.statut)" style="margin-bottom:20px;">
              <i class="ph" [ngClass]="getStatusIcon(detailModal.statut)" style="font-size:1.2rem;"></i>
              <strong>{{ getStatusLabel(detailModal.statut) }}</strong>
            </div>
            <div class="retour-summary">
              <div class="summary-row">
                <span class="summary-label"><i class="ph ph-package"></i> Produit</span>
                <span class="summary-val">{{ detailModal.produit?.nom || 'Inconnu' }}</span>
              </div>
              <div class="summary-row" style="align-items:flex-start;">
                <span class="summary-label"><i class="ph ph-chat-text"></i> Motif</span>
                <span class="summary-val" style="white-space:normal;">{{ detailModal.motif }}</span>
              </div>
              <div class="summary-row">
                <span class="summary-label"><i class="ph ph-calendar"></i> Date</span>
                <span class="summary-val">{{ detailModal.dateRetour | date:'dd MMMM yyyy' }}</span>
              </div>
            </div>
            <div style="margin-top:20px;padding-top:16px;border-top:1px solid #e2e8f0;">
              <button class="secondary-btn" (click)="closeDetail()" style="width:100%;justify-content:center;">
                <i class="ph ph-x"></i> Fermer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <div class="toast" *ngIf="toastMsg" [ngClass]="toastType">
      <i class="ph" [ngClass]="toastType === 'toast-success' ? 'ph-check-circle' : 'ph-x-circle'"></i>
      {{ toastMsg }}
    </div>
  `,
  styles: [`
    .stats-row {
      display: flex; align-items: center; gap: 12px;
      margin-bottom: 24px; flex-wrap: wrap;
    }
    .stat-chip {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 18px; border-radius: 12px;
      background: var(--card-bg); border: 1px solid var(--border-color);
      color: var(--text-secondary); cursor: pointer;
      transition: all 0.2s; font-size: 0.87rem; user-select: none;
      white-space: nowrap;
    }
    .stat-chip:hover { border-color: #94a3b8; color: var(--text-primary); }
    .stat-chip strong { margin-left:4px; font-size:1rem; font-weight:800; }
    .stat-chip.active   { background: rgba(59,130,246,0.1); border-color: rgba(59,130,246,0.3); color:#60a5fa; }
    .stat-chip.active-w { background: rgba(249,115,22,0.1); border-color: rgba(249,115,22,0.3); color:#fb923c; }
    .stat-chip.active-s { background: rgba(34,197,94,0.1);  border-color: rgba(34,197,94,0.3);  color:#4ade80; }
    .stat-chip.active-d { background: rgba(239,68,68,0.1);  border-color: rgba(239,68,68,0.3);  color:#f87171; }

    .pending-badge {
      display: inline-flex; align-items: center; gap: 6px;
      background: rgba(249,115,22,0.12); border: 1px solid rgba(249,115,22,0.3);
      color: #fb923c; padding: 8px 14px; border-radius: 10px;
      font-size: 0.82rem; font-weight: 600;
      animation: pulse-badge 2s ease-in-out infinite;
    }
    @keyframes pulse-badge {
      0%,100% { box-shadow: 0 0 0 0 rgba(249,115,22,0.25); }
      50%      { box-shadow: 0 0 0 7px rgba(249,115,22,0); }
    }

    .prod-avatar {
      width: 30px; height: 30px; border-radius: 8px;
      background: rgba(249,115,22,0.1); display: flex;
      align-items: center; justify-content: center;
      color: #fb923c; font-size: 0.95rem; flex-shrink: 0;
    }
    .motif-cell { color: var(--text-secondary); font-size: 0.87rem; max-width: 200px; }
    .table-row-hover { transition: background 0.2s; cursor: default; }
    .table-row-hover:hover { background: var(--border-color); }

    /* Icon-only action buttons — same base style as 👁️ */
    .validate-icon-btn {
      position: relative;
      /* inherit action-btn base: dark neutral */
    }
    .validate-icon-btn:hover {
      background: #22c55e !important;
      border-color: #22c55e !important;
      color: white !important;
      transform: translateY(-2px);
    }
    .reject-icon-btn {
      position: relative;
      /* inherit action-btn base: dark neutral */
    }
    .reject-icon-btn:hover {
      background: #ef4444 !important;
      border-color: #ef4444 !important;
      color: white !important;
      transform: translateY(-2px);
    }
    .btn-tooltip {
      position: absolute;
      bottom: calc(100% + 8px);
      left: 50%;
      transform: translateX(-50%) translateY(4px);
      background: rgba(15,23,42,0.95);
      color: white;
      font-size: 0.74rem;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 6px;
      white-space: nowrap;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.18s ease, transform 0.18s ease;
      box-shadow: 0 4px 12px rgba(0,0,0,0.25);
      z-index: 10;
    }
    .btn-tooltip::after {
      content: '';
      position: absolute;
      top: 100%; left: 50%;
      transform: translateX(-50%);
      border: 4px solid transparent;
      border-top-color: rgba(15,23,42,0.95);
    }
    .action-btn:hover .btn-tooltip {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }

    .modal-icon {
      width: 44px; height: 44px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.4rem; flex-shrink: 0;
    }
    .icon-green { background: rgba(34,197,94,0.15); color: #22c55e; }
    .icon-red   { background: rgba(239,68,68,0.15);  color: #ef4444; }

    .confirm-alert {
      display: flex; align-items: flex-start; gap: 12px;
      padding: 14px 16px; border-radius: 10px; margin-bottom: 18px;
    }
    .confirm-alert i { font-size: 1.2rem; flex-shrink: 0; margin-top: 1px; }
    .confirm-alert p, .confirm-alert strong { margin: 0; font-size: 0.87rem; line-height: 1.5; }
    .alert-green  { background: rgba(34,197,94,0.08);  border:1px solid rgba(34,197,94,0.2);  color: #166534; }
    .alert-red    { background: rgba(239,68,68,0.08);  border:1px solid rgba(239,68,68,0.2);  color: #991b1b; }
    .alert-orange { background: rgba(249,115,22,0.08); border:1px solid rgba(249,115,22,0.2); color: #9a3412; }

    .retour-summary { display: flex; flex-direction: column; gap: 10px; }
    .summary-row {
      display: flex; align-items: center; gap: 12px;
      padding: 10px 14px; border-radius: 8px;
      background: #f8fafc; border: 1px solid #e2e8f0;
    }
    .summary-label {
      display: flex; align-items: center; gap: 6px;
      font-size: 0.75rem; font-weight: 700; color: #64748b;
      text-transform: uppercase; letter-spacing: 0.3px;
      min-width: 80px; flex-shrink: 0;
    }
    .summary-val { font-size: 0.9rem; font-weight: 500; color: #0f172a; }

    .modal-textarea {
      background: #f1f5f9 !important; border: 1.5px solid #e2e8f0 !important;
      color: #0f172a !important; resize: vertical;
      backdrop-filter: none !important;
    }
    .modal-textarea:focus {
      border-color: #3b82f6 !important; background: #fff !important;
      box-shadow: 0 0 0 3px rgba(59,130,246,0.12) !important;
      transform: none !important;
    }

    .btn-green { background: linear-gradient(90deg,#16a34a,#22c55e) !important; box-shadow: 0 4px 14px rgba(34,197,94,0.3) !important; }
    .btn-green:hover:not(:disabled) { box-shadow: 0 6px 20px rgba(34,197,94,0.45) !important; }
    .btn-red   { background: linear-gradient(90deg,#dc2626,#ef4444) !important; box-shadow: 0 4px 14px rgba(239,68,68,0.3) !important; }
    .btn-red:hover:not(:disabled)   { box-shadow: 0 6px 20px rgba(239,68,68,0.45) !important; }

    .spinner {
      width: 15px; height: 15px; border-radius: 50%;
      border: 2px solid rgba(255,255,255,0.35); border-top-color: white;
      animation: spin 0.8s linear infinite; display: inline-block;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .toast {
      position: fixed; bottom: 32px; right: 32px;
      display: flex; align-items: center; gap: 10px;
      padding: 14px 22px; border-radius: 12px;
      font-size: 0.9rem; font-weight: 600;
      box-shadow: 0 8px 32px rgba(0,0,0,0.25); z-index: 9999;
      animation: slideInToast 0.3s cubic-bezier(0.16,1,0.3,1) forwards;
    }
    .toast-success { background: #15803d; color: white; border: 1px solid rgba(34,197,94,0.4); }
    .toast-error   { background: #991b1b; color: white; border: 1px solid rgba(239,68,68,0.4); }
    @keyframes slideInToast {
      from { opacity:0; transform:translateX(30px); }
      to   { opacity:1; transform:translateX(0); }
    }
  `],
  styleUrls: ['../../admin-shared.css']
})
export class ReturnsList implements OnInit {
  retours: RetourProduit[] = [];
  filteredRetours: RetourProduit[] = [];
  isLoading = true;
  isProcessing = false;

  searchQuery = '';
  activeFilter = 'ALL';
  sortOrder: 'DESC' | 'ASC' = 'DESC';

  confirmModal: RetourProduit | null = null;
  confirmAction: 'VALIDER' | 'REJETER' | null = null;
  rejetRaison = '';

  detailModal: RetourProduit | null = null;

  toastMsg = '';
  toastType = 'toast-success';
  private toastTimer: any;

  get pendingCount(): number {
    return this.retours.filter(r => this.isPending(r.statut)).length;
  }

  constructor(
    private retourService: RetourService,
    private authService: AuthService,
    private notifService: NotificationService
  ) {}

  ngOnInit(): void { this.chargerRetours(); }

  chargerRetours(): void {
    this.isLoading = true;
    this.retourService.getRetours().subscribe({
      next: (data) => {
        this.retours = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement retours', err);
        this.isLoading = false;
      }
    });
  }

  setFilter(f: string): void { this.activeFilter = f; this.applyFilters(); }

  toggleSort(): void {
    this.sortOrder = this.sortOrder === 'DESC' ? 'ASC' : 'DESC';
    this.applyFilters();
  }

  applyFilters(): void {
    let list = [...this.retours];
    if (this.activeFilter === 'PENDING') list = list.filter(r => this.isPending(r.statut));
    if (this.activeFilter === 'VALID')   list = list.filter(r => this.isValid(r.statut));
    if (this.activeFilter === 'REJECT')  list = list.filter(r => this.isReject(r.statut));
    const q = this.searchQuery.toLowerCase().trim();
    if (q) {
      list = list.filter(r =>
        (r.produit?.nom || '').toLowerCase().includes(q) ||
        (r.motif || '').toLowerCase().includes(q)
      );
    }
    
    list.sort((a, b) => {
      const dateA = a.dateRetour ? new Date(a.dateRetour).getTime() : 0;
      const dateB = b.dateRetour ? new Date(b.dateRetour).getTime() : 0;
      if (dateA !== dateB) {
        return this.sortOrder === 'DESC' ? dateB - dateA : dateA - dateB;
      }
      return this.sortOrder === 'DESC' ? (b.id || 0) - (a.id || 0) : (a.id || 0) - (b.id || 0);
    });

    this.filteredRetours = list;
  }

  countBy(f: string): number {
    if (f === 'PENDING') return this.retours.filter(r => this.isPending(r.statut)).length;
    if (f === 'VALID')   return this.retours.filter(r => this.isValid(r.statut)).length;
    if (f === 'REJECT')  return this.retours.filter(r => this.isReject(r.statut)).length;
    return 0;
  }

  isPending(s: string): boolean {
    const u = (s || '').toUpperCase();
    return u.includes('ATTENTE') || u.includes('PENDING') || u === 'EN_ATTENTE';
  }
  isValid(s: string):  boolean { return (s || '').toUpperCase().includes('VALID'); }
  isReject(s: string): boolean {
    const u = (s || '').toUpperCase();
    return u.includes('REJET') || u.includes('REFUS');
  }

  getStatusClass(s: string): string {
    if (this.isValid(s))   return 'badge-green';
    if (this.isReject(s))  return 'badge-red';
    if (this.isPending(s)) return 'badge-orange';
    return 'badge-blue';
  }
  getStatusIcon(s: string): string {
    if (this.isValid(s))  return 'ph-check-circle';
    if (this.isReject(s)) return 'ph-x-circle';
    return 'ph-hourglass';
  }
  getStatusLabel(s: string): string {
    if (this.isValid(s))   return 'Validé';
    if (this.isReject(s))  return 'Rejeté';
    if (this.isPending(s)) return 'En attente';
    return s;
  }
  getDetailBannerClass(s: string): string {
    if (this.isValid(s))  return 'alert-green';
    if (this.isReject(s)) return 'alert-red';
    return 'alert-orange';
  }

  openConfirm(ret: RetourProduit, action: 'VALIDER' | 'REJETER'): void {
    this.confirmModal = ret;
    this.confirmAction = action;
    this.rejetRaison = '';
  }
  closeConfirm(): void {
    if (this.isProcessing) return;
    this.confirmModal = null;
    this.confirmAction = null;
  }

  confirmerAction(): void {
    if (!this.confirmModal || !this.confirmAction) return;
    const id = this.confirmModal.id!;
    const adminId = this.authService.currentUser?.id || 1;
    this.isProcessing = true;

    const obs = this.confirmAction === 'VALIDER'
      ? this.retourService.validerRetour(id, adminId)
      : this.retourService.rejeterRetour(id, adminId);

    obs.subscribe({
      next: () => {
        const isValide = this.confirmAction === 'VALIDER';
        const msg = isValide ? 'Retour validé avec succès !' : 'Retour rejeté.';
        
        this.notifService.addNotification({
          title: isValide ? 'Retour Validé' : 'Retour Rejeté',
          message: isValide ? `Le retour #${id} a été validé.` : `Le retour #${id} a été refusé.`,
          type: isValide ? 'success' : 'warning'
        });

        this.isProcessing = false;
        this.closeConfirm();
        this.chargerRetours();
        this.showToast(msg, 'toast-success');
      },
      error: (err) => {
        console.error('Erreur action', err);
        this.isProcessing = false;
        this.showToast('Erreur lors du traitement. Réessayez.', 'toast-error');
      }
    });
  }

  openDetail(ret: RetourProduit): void { this.detailModal = ret; }
  closeDetail(): void { this.detailModal = null; }

  showToast(msg: string, type: string): void {
    this.toastMsg = msg;
    this.toastType = type;
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => { this.toastMsg = ''; }, 3500);
  }
}
