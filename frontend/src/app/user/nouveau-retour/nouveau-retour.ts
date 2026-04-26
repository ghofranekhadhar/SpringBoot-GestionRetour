import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RetourService } from '../../services/retour.service';
import { ProduitService } from '../../services/produit.service';
import { AuthService } from '../../services/auth.service';
import { NonConformiteService } from '../../services/non-conformite.service';
import { UtilisateurService } from '../../services/utilisateur.service';
import { RetourProduit } from '../../models/retour.model';
import { Produit } from '../../models/produit.model';
import { Utilisateur } from '../../models/utilisateur.model';
import { UserBreadcrumb } from '../../components/user-breadcrumb/user-breadcrumb';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-nouveau-retour',
  standalone: true,
  imports: [CommonModule, FormsModule, UserBreadcrumb],
  template: `
    <div class="user-page fade-in">
      <app-user-breadcrumb></app-user-breadcrumb>

      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Nouveau Retour</h1>
          <p class="page-subtitle">Complétez le formulaire ci-dessous pour déclarer un retour produit.</p>
        </div>
      </div>

      <div class="form-layout">
        <!-- Form Card -->
        <div class="widget-card form-main">
          <div class="widget-header">
            <h3 class="widget-title">
              <i class="ph ph-clipboard-text" style="margin-right:8px;color:#60a5fa;"></i>
              Informations du retour
            </h3>
          </div>
          <div class="widget-body">
            <!-- Success message -->
            <div class="alert-success" *ngIf="successMessage">
              <i class="ph ph-check-circle"></i>
              <div>
                <strong>Retour soumis avec succès !</strong>
                <p>{{ successMessage }}</p>
              </div>
            </div>

            <!-- Error message -->
            <div class="alert-error" *ngIf="errorMessage">
              <i class="ph ph-warning-circle"></i>
              <div>
                <strong>Erreur</strong>
                <p>{{ errorMessage }}</p>
              </div>
            </div>

            <form class="user-form" (ngSubmit)="onSubmit()" #retourForm="ngForm" *ngIf="!successMessage">
              <!-- Product Select -->
              <div class="form-group">
                <label class="form-label">
                  <i class="ph ph-package"></i>
                  Produit concerné <span style="color:#ef4444;">*</span>
                </label>
                <div class="input-icon-wrapper">
                  <i class="ph ph-package"></i>
                  <select
                    class="form-control"
                    [(ngModel)]="retour.produit"
                    name="produit"
                    required
                    [disabled]="isLoadingProduits"
                  >
                    <option [ngValue]="null" disabled>
                      {{ isLoadingProduits ? 'Chargement...' : '-- Sélectionner un produit --' }}
                    </option>
                    <option *ngFor="let p of produits" [ngValue]="p">{{ p.nom }}</option>
                  </select>
                </div>
                <span class="field-hint" *ngIf="retour.produit">
                  <i class="ph ph-info"></i>
                  Stock disponible : {{ retour.produit.quantiteEnStock || 0 }} unité(s)
                </span>
              </div>

              <!-- Client Select (Only for Employee) -->
              <div class="form-group" *ngIf="userRole === 'EMPLOYE'">
                <label class="form-label">
                  <i class="ph ph-user"></i>
                  Client concerné <span style="color:#ef4444;">*</span>
                </label>
                <div class="input-icon-wrapper">
                  <i class="ph ph-user"></i>
                  <select
                    class="form-control"
                    [(ngModel)]="selectedClient"
                    name="client"
                    required
                  >
                    <option [ngValue]="null" disabled>
                      -- Sélectionner un client --
                    </option>
                    <option *ngFor="let c of clients" [ngValue]="c">
                      {{ c.nom }} ({{ c.email }})
                    </option>
                  </select>
                </div>
                <span class="field-hint">
                  <i class="ph ph-info"></i>
                  En tant qu'employé, vous devez sélectionner le client qui effectue le retour.
                </span>
              </div>

              <!-- Product Info preview -->
              <div class="product-preview" *ngIf="retour.produit">
                <div class="pp-icon"><i class="ph ph-package"></i></div>
                <div class="pp-info">
                  <strong>{{ retour.produit.nom }}</strong>
                  <span>{{ retour.produit.description || 'Aucune description' }}</span>
                </div>
                <div class="pp-price">{{ retour.produit.prix | currency:'EUR':'symbol':'1.2-2' }}</div>
              </div>

              <!-- Motif -->
              <div class="form-group">
                <label class="form-label">
                  <i class="ph ph-chat-text"></i>
                  Motif du retour <span style="color:#ef4444;">*</span>
                </label>
                <textarea
                  class="form-control"
                  style="resize:vertical;min-height:120px;"
                  placeholder="Décrivez précisément la raison du retour (défaut constaté, non-conformité, article endommagé...)"
                  [(ngModel)]="retour.motif"
                  name="motif"
                  required
                  minlength="10"
                  #motifField="ngModel"
                ></textarea>
                <div class="field-counter">
                  <span class="field-hint" *ngIf="motifField.invalid && motifField.touched" style="color:#f87171;">
                    <i class="ph ph-warning"></i> Le motif doit contenir au moins 10 caractères.
                  </span>
                  <span style="margin-left:auto;font-size:0.76rem;color:var(--text-secondary);">
                    {{ (retour.motif || '').length }} / 500
                  </span>
                </div>
              </div>

              <!-- Déclarer une Non-Conformité -->
              <div class="form-group checkbox-group" style="margin-top: 16px; display: flex; align-items: flex-start; gap: 10px;">
                <input type="checkbox" id="declareNc" [(ngModel)]="declareNonConformite" name="declareNc" style="margin-top: 4px;">
                <div>
                  <label for="declareNc" style="font-weight: 600; cursor: pointer;">Signaler une Non-Conformité (Optionnel)</label>
                  <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px;">
                    Cochez cette case si le motif du retour est lié à un défaut critique du produit que le service qualité doit inspecter de toute urgence.
                  </div>
                </div>
              </div>

              <!-- Form Actions -->
              <div class="form-actions">
                <button type="submit" class="primary-btn" [disabled]="isSubmitting || retourForm.invalid || (userRole === 'EMPLOYE' && !selectedClient)">
                  <span *ngIf="!isSubmitting">
                    <i class="ph ph-paper-plane-tilt"></i> Soumettre le retour
                  </span>
                  <span *ngIf="isSubmitting" style="display:flex;align-items:center;gap:8px;">
                    <span class="spinner"></span> Envoi en cours...
                  </span>
                </button>
                <button type="button" class="secondary-btn" (click)="onReset(retourForm)" [disabled]="isSubmitting">
                  <i class="ph ph-arrow-counter-clockwise"></i> Réinitialiser
                </button>
              </div>
            </form>

            <!-- After success actions -->
            <div class="post-success" *ngIf="successMessage">
              <button class="primary-btn" (click)="goToMyRetours()">
                <i class="ph ph-list-bullets"></i> Voir mes retours
              </button>
              <button class="secondary-btn" (click)="resetForm()">
                <i class="ph ph-plus"></i> Nouveau retour
              </button>
            </div>
          </div>
        </div>

        <!-- Info Sidebar -->
        <div class="form-aside">
          <!-- Guidelines -->
          <div class="widget-card">
            <div class="widget-header">
              <h3 class="widget-title">
                <i class="ph ph-lightbulb" style="margin-right:8px;color:#fb923c;"></i>
                Guide de saisie
              </h3>
            </div>
            <div class="widget-body">
              <ul class="guide-list">
                <li class="guide-item">
                  <div class="guide-num">1</div>
                  <div class="guide-text">
                    <strong>Choisissez le produit</strong>
                    <span>Sélectionnez le produit exact à retourner.</span>
                  </div>
                </li>
                <li class="guide-item">
                  <div class="guide-num">2</div>
                  <div class="guide-text">
                    <strong>Décrivez le motif</strong>
                    <span>Soyez précis : défaut, non-conformité, article endommagé...</span>
                  </div>
                </li>
                <li class="guide-item">
                  <div class="guide-num">3</div>
                  <div class="guide-text">
                    <strong>Soumettez</strong>
                    <span>Votre demande sera traitée sous 24h ouvrées.</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <!-- Statuses info -->
          <div class="widget-card" style="margin-top:16px;">
            <div class="widget-header">
              <h3 class="widget-title">
                <i class="ph ph-info" style="margin-right:8px;color:#60a5fa;"></i>
                Statuts possibles
              </h3>
            </div>
            <div class="widget-body">
              <div class="status-info-list">
                <div class="status-info-item">
                  <span class="badge badge-orange"><i class="ph ph-hourglass"></i> En attente</span>
                  <span>Votre demande est en cours d'examen.</span>
                </div>
                <div class="status-info-item">
                  <span class="badge badge-green"><i class="ph ph-check-circle"></i> Validé</span>
                  <span>Le retour a été approuvé.</span>
                </div>
                <div class="status-info-item">
                  <span class="badge badge-red"><i class="ph ph-x-circle"></i> Rejeté</span>
                  <span>La demande a été refusée.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Layout */
    .form-layout {
      display: grid;
      grid-template-columns: 1fr 320px;
      gap: 24px;
      align-items: start;
    }
    @media (max-width: 900px) {
      .form-layout { grid-template-columns: 1fr; }
    }

    /* Alerts */
    .alert-success, .alert-error {
      display: flex; align-items: flex-start; gap: 14px;
      padding: 16px 20px; border-radius: 12px;
      margin-bottom: 24px;
    }
    .alert-success {
      background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.25); color: #166534;
    }
    .alert-success i { font-size: 1.6rem; color: #22c55e; flex-shrink: 0; margin-top: 2px; }
    .alert-error {
      background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.25); color: #991b1b;
    }

    /* Rendre le cadre des champs de saisie plus visible élégamment */
    .form-control {
      border: 1px solid rgba(255,255,255,0.15) !important;
    }
    .form-control:hover { /* Effet au survol */
      border-color: rgba(255,255,255,0.25) !important;
    }

    /* Style select dropdown pour un look professionnel */
    select.form-control {
      background-color: rgba(255,255,255,0.02) !important;
      color: var(--text-primary) !important;
    }
    select.form-control:focus {
      border-color: #60a5fa !important;
      box-shadow: 0 0 0 3px rgba(96,165,250,0.15) !important;
      background-color: rgba(96,165,250,0.05) !important;
    }
    select.form-control option {
      background-color: #f8fafc !important; /* Blanc très propre (Slate-50) */
      color: #0f172a !important; /* Texte de contraste pro */
    }
    .alert-error i { font-size: 1.6rem; color: #ef4444; flex-shrink: 0; margin-top: 2px; }
    .alert-success strong, .alert-error strong { display: block; font-size: 0.95rem; font-weight: 700; margin-bottom: 4px; }
    .alert-success p, .alert-error p { margin: 0; font-size: 0.85rem; line-height: 1.5; opacity: 0.85; }

    /* Field hint */
    .field-hint {
      display: flex; align-items: center; gap: 5px;
      font-size: 0.78rem; color: var(--text-secondary);
      margin-top: 6px;
    }
    .field-counter { display: flex; align-items: center; margin-top: 5px; }

    /* Product preview */
    .product-preview {
      display: flex; align-items: center; gap: 14px;
      padding: 14px 16px; border-radius: 12px;
      background: rgba(59,130,246,0.07);
      border: 1px solid rgba(59,130,246,0.2);
      margin: -12px 0 24px;
    }
    .pp-icon {
      width: 40px; height: 40px; border-radius: 10px;
      background: rgba(59,130,246,0.15);
      display: flex; align-items: center; justify-content: center;
      color: #60a5fa; font-size: 1.2rem; flex-shrink: 0;
    }
    .pp-info { display: flex; flex-direction: column; flex: 1; }
    .pp-info strong { font-size: 0.9rem; color: var(--text-primary); font-weight: 700; }
    .pp-info span   { font-size: 0.78rem; color: var(--text-secondary); margin-top: 2px; }
    .pp-price { font-size: 1rem; font-weight: 800; color: #60a5fa; }

    /* Spinner */
    .spinner {
      width: 16px; height: 16px; border-radius: 50%;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white;
      animation: spin 0.8s linear infinite; display: inline-block;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Post-success */
    .post-success { display: flex; gap: 14px; margin-top: 8px; }

    /* Guide list */
    .guide-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 16px; }
    .guide-item { display: flex; align-items: flex-start; gap: 12px; }
    .guide-num {
      width: 28px; height: 28px; border-radius: 50%;
      background: rgba(59,130,246,0.15);
      color: #60a5fa;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.8rem; font-weight: 800;
      flex-shrink: 0;
    }
    .guide-text { display: flex; flex-direction: column; }
    .guide-text strong { font-size: 0.88rem; color: var(--text-primary); font-weight: 700; margin-bottom: 3px; }
    .guide-text span   { font-size: 0.8rem; color: var(--text-secondary); line-height: 1.4; }

    /* Status info */
    .status-info-list { display: flex; flex-direction: column; gap: 12px; }
    .status-info-item { display: flex; align-items: center; gap: 10px; }
    .status-info-item span:last-child { font-size: 0.8rem; color: var(--text-secondary); }

    /* Select styling */
    select.form-control {
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%2394a3b8' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 14px center;
      padding-right: 40px;
      cursor: pointer;
    }
    select.form-control option { background: #1e293b; color: white; }
  `],
  styleUrls: ['../user-shared.css']
})
export class NouveauRetour implements OnInit {
  retour: Partial<RetourProduit> = { produit: null as any, motif: '' };
  produits: Produit[] = [];
  clients: Utilisateur[] = [];
  selectedClient: Utilisateur | null = null;
  isLoadingProduits = true;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';
  declareNonConformite = false;
  userRole = '';

  constructor(
    private retourService: RetourService,
    private produitService: ProduitService,
    private authService: AuthService,
    private nonConformiteService: NonConformiteService,
    private utilisateurService: UtilisateurService,
    private router: Router,
    private notifService: NotificationService
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUser;
    if (user) {
      this.userRole = (user.role || '').trim().toUpperCase();
    }
    
    // Also subscribe to changes for robustness
    this.authService.currentUser$.subscribe(u => {
      if (u) this.userRole = (u.role || '').trim().toUpperCase();
    });

    this.produitService.getProduits().subscribe({
      next: (data) => {
        this.produits = data;
        this.isLoadingProduits = false;
      },
      error: (err) => {
        console.error('Erreur chargement produits', err);
        this.isLoadingProduits = false;
      }
    });

    if (this.userRole === 'EMPLOYE') {
      this.utilisateurService.getUtilisateurs().subscribe({
        next: (users) => {
          this.clients = users.filter(u => u.role === 'CLIENT');
        },
        error: (err) => console.error('Erreur chargement clients', err)
      });
    }
  }

  onSubmit(): void {
    if (!this.retour.produit || !this.retour.motif) return;
    this.isSubmitting = true;
    this.errorMessage = '';

    const payload: RetourProduit = {
      produit: this.retour.produit,
      motif: this.retour.motif!,
      statut: 'EN_ATTENTE',
      client: this.userRole === 'EMPLOYE' ? this.selectedClient! : undefined
    };

    const employeId = this.authService.currentUser?.id;
    if (!employeId) {
      this.errorMessage = "Utilisateur non authentifié";
      this.isSubmitting = false;
      return;
    }

    this.retourService.createRetour(payload, employeId).subscribe({
      next: (res) => {
        if(this.declareNonConformite) {
           this.nonConformiteService.createNonConformite({
             description: `[Généré depuis Retour] ` + this.retour.motif,
             gravite: 'MOYENNE',
             produit: this.retour.produit!
           }).subscribe({
             next: () => {
                this.isSubmitting = false;
                this.successMessage = `Le retour a été enregistré et la fiche de non-conformité a bien été signalée.`;
                this.notifService.addNotification({
                  title: 'Retour & Non-Conformité',
                  message: 'Enregistrement complet effectué avec succès.',
                  type: 'success',
                  route: '/admin/non-conformites'
                });
             },
             error: (ncErr) => {
                console.error('Erreur non-conformite', ncErr);
                this.isSubmitting = false;
                this.successMessage = `Le retour a été enregistré mais une erreur est survenue lors du signalement de non-conformité.`;
                this.notifService.addNotification({
                  title: 'Alerte Système',
                  message: 'Retour enregistré mais erreur fiche NC.',
                  type: 'warning'
                });
             }
           });
        } else {
           this.isSubmitting = false;
           this.successMessage = `Votre retour pour « ${res.produit?.nom || 'le produit'} » a bien été enregistré et sera traité sous 24h.`;
           this.notifService.addNotification({
             title: 'Retour Enregistré',
             message: `Demande pour ${res.produit?.nom || 'le produit'} reçue.`,
             type: 'success',
             route: '/user/mes-retours'
           });
        }
      },
      error: (err) => {
        console.error('Erreur création retour', err);
        this.isSubmitting = false;
        this.errorMessage = err?.error?.message || 'Une erreur est survenue. Veuillez réessayer.';
        this.notifService.addNotification({
          title: 'Erreur Enregistrement',
          message: 'Impossible d\'enregistrer le retour.',
          type: 'error'
        });
      }
    });
  }

  onReset(form: any): void {
    form.resetForm();
    this.retour = { produit: null as any, motif: '' };
    this.selectedClient = null;
    this.declareNonConformite = false;
    this.errorMessage = '';
  }

  resetForm(): void {
    this.retour = { produit: null as any, motif: '' };
    this.selectedClient = null;
    this.declareNonConformite = false;
    this.successMessage = '';
    this.errorMessage = '';
  }

  goToMyRetours(): void {
    this.router.navigate(['/user/mes-retours']);
  }
}
