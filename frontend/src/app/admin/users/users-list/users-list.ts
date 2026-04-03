import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Breadcrumb } from '../../../components/breadcrumb/breadcrumb';
import { UserForm } from '../user-form/user-form';
import { Utilisateur } from '../../../models/utilisateur.model';
import { UtilisateurService } from '../../../services/utilisateur.service';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, FormsModule, Breadcrumb, UserForm],
  template: `
    <div class="admin-page fade-in">
      <app-breadcrumb></app-breadcrumb>
      
      <div class="page-header">
        <div>
          <h1 class="page-title">Gestion des Utilisateurs</h1>
          <p class="page-subtitle">Administrez les accès et rôles de votre équipe.</p>
        </div>
        <button (click)="openModal()" class="primary-btn">
          <i class="ph ph-user-plus"></i>
          Ajouter un Utilisateur
        </button>
      </div>

      <!-- Filter & Search Container -->
      <div style="display:flex; flex-direction:column; gap:16px; margin-bottom:24px; width:100%;">
        
        <!-- Ligne 1: Recherche (Taille normale) -->
        <div class="search-box" style="position:relative; width:400px; max-width:100%;">
          <i class="ph ph-magnifying-glass" style="position:absolute; left:16px; top:50%; transform:translateY(-50%); color:#94a3b8; font-size:1.1rem;"></i>
          <input type="text" placeholder="Rechercher utilisateur..."
                 class="form-control" style="width:100%; padding:12px 16px 12px 44px; margin:0; background:var(--card-bg); border-radius:12px;"
                 [(ngModel)]="searchTerm" />
        </div>

        <!-- Ligne 2: Filtres à gauche, Tri à droite -->
        <div style="display:flex; justify-content:space-between; align-items:center; gap:16px; flex-wrap:wrap; width:100%;">
          <div class="stats-row" style="display:flex; gap:12px; margin:0;">
            <div class="stat-chip" [class.active]="roleFilter==='ALL'" (click)="setRoleFilter('ALL')">
              <i class="ph ph-users"></i>
              <span>Tous</span>
              <strong>{{ utilisateurs.length }}</strong>
            </div>
            <div class="stat-chip" [class.active-b]="roleFilter==='ADMIN'" (click)="setRoleFilter('ADMIN')">
              <i class="ph ph-shield-star"></i>
              <span>Administrateurs</span>
              <strong>{{ countBy('ADMIN') }}</strong>
            </div>
            <div class="stat-chip" [class.active-g]="roleFilter==='EMPLOYE'" (click)="setRoleFilter('EMPLOYE')">
              <i class="ph ph-user"></i>
              <span>Employés</span>
              <strong>{{ countBy('EMPLOYE') }}</strong>
            </div>
          </div>

          <button class="form-control" (click)="toggleSort()" style="margin:0; cursor:pointer; width:auto; display:flex; align-items:center; gap:8px; background:var(--card-bg); border-radius:12px; padding:12px 20px;">
            <i class="ph" [ngClass]="sortOrder === 'DESC' ? 'ph-sort-descending' : 'ph-sort-ascending'"></i>
            {{ sortOrder === 'DESC' ? 'Récents' : 'Anciens' }}
          </button>
        </div>
      </div>

      <div class="widget-card">
        <div class="widget-header">
          <h3 class="widget-title">Membres de l'équipe</h3>
        </div>
        
        <div class="widget-body p-0">
          <div class="table-container">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Nom Complet</th>
                  <th>Adresse E-mail</th>
                  <th>Rôle</th>
                  <th style="width: 100px;">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let u of filteredUtilisateurs">
                  <td style="font-weight: 600;">
                    <div style="display:flex; align-items:center; gap:10px;">
                      <div style="width:32px; height:32px; border-radius:50%; background:var(--border-color); display:flex; align-items:center; justify-content:center; color:#60a5fa;">
                        <i class="ph ph-user"></i>
                      </div>
                      {{ u.nom }}
                    </div>
                  </td>
                  <td>{{ u.email }}</td>
                  <td>
                    <span class="badge" [ngClass]="u.role === 'ADMIN' ? 'badge-blue' : 'badge-green'">
                      {{ u.role }}
                    </span>
                  </td>
                  <td>
                    <div class="action-btns">
                      <button class="action-btn" title="Modifier" (click)="openModal(u)"><i class="ph ph-pencil-simple"></i></button>
                      <button class="action-btn delete" title="Supprimer" *ngIf="u.role !== 'ADMIN'" (click)="supprimerUtilisateur(u.id!)"><i class="ph ph-trash"></i></button>
                    </div>
                  </td>
                </tr>

                <tr *ngIf="filteredUtilisateurs.length === 0 && !isLoading">
                  <td colspan="4">
                    <div class="empty-state" style="padding: 40px 0;">
                      <i class="ph ph-users empty-icon"></i>
                      <p>Aucun utilisateur trouvé.</p>
                    </div>
                  </td>
                </tr>
                <tr *ngIf="isLoading">
                   <td colspan="4" style="text-align: center; padding: 40px 0; color: var(--text-secondary);">
                     Chargement des utilisateurs en cours...
                   </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    
    <app-user-form 
      *ngIf="showAddModal" 
      [userToEdit]="selectedUser"
      (close)="fermerModal()"
      (saved)="onUtilisateurSauvegarde()">
    </app-user-form>
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
    .stat-chip.active-b { background: rgba(168,85,247,0.1); border-color: rgba(168,85,247,0.3); color:#c084fc; }
    .stat-chip.active-g { background: rgba(34,197,94,0.1);  border-color: rgba(34,197,94,0.3);  color:#4ade80; }
  `],
  styleUrls: ['../../admin-shared.css']
})
export class UsersList implements OnInit {
  showAddModal = false;
  utilisateurs: Utilisateur[] = [];
  isLoading = true;
  selectedUser: Utilisateur | null = null;
  searchTerm = '';
  roleFilter = 'ALL';
  sortOrder: 'DESC' | 'ASC' = 'DESC';

  constructor(private utilisateurService: UtilisateurService) {}

  get filteredUtilisateurs(): Utilisateur[] {
    let list = this.utilisateurs;
    
    if (this.roleFilter !== 'ALL') {
      list = list.filter(u => u.role === this.roleFilter);
    }
    
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      list = list.filter(u => 
        u.nom.toLowerCase().includes(term) || 
        u.email.toLowerCase().includes(term)
      );
    }
    return [...list].sort((a, b) => {
      const dA = a.id || 0;
      const dB = b.id || 0;
      return this.sortOrder === 'DESC' ? (dB - dA) : (dA - dB);
    });
  }

  setRoleFilter(role: string): void {
    this.roleFilter = role;
  }

  toggleSort(): void {
    this.sortOrder = this.sortOrder === 'DESC' ? 'ASC' : 'DESC';
  }

  countBy(role: string): number {
    return this.utilisateurs.filter(u => u.role === role).length;
  }

  ngOnInit(): void {
    this.chargerUtilisateurs();
  }

  chargerUtilisateurs(): void {
    this.isLoading = true;
    this.utilisateurService.getUtilisateurs().subscribe({
      next: (data) => {
        this.utilisateurs = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des utilisateurs', err);
        this.isLoading = false;
      }
    });
  }

  supprimerUtilisateur(id: number): void {
    if (confirm('Voulez-vous vraiment supprimer cet utilisateur ?')) {
      this.utilisateurService.deleteUtilisateur(id).subscribe({
        next: () => this.chargerUtilisateurs(),
        error: (err) => console.error('Erreur lors de la suppression', err)
      });
    }
  }

  openModal(user?: Utilisateur): void {
    this.selectedUser = user || null;
    this.showAddModal = true;
    document.body.style.overflow = 'hidden';
  }

  fermerModal(): void {
    this.showAddModal = false;
    this.selectedUser = null;
    document.body.style.overflow = 'auto';
  }

  onUtilisateurSauvegarde(): void {
    this.chargerUtilisateurs();
  }
}
