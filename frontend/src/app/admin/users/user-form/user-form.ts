import { Component, Output, EventEmitter, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Utilisateur } from '../../../models/utilisateur.model';
import { UtilisateurService } from '../../../services/utilisateur.service';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" (mousedown)="onOverlayClick($event)">
      <div class="modal-container">
        <div class="widget-card">

          <!-- En-tête de la modale -->
          <div class="widget-header">
            <div>
              <h2 class="widget-title">
                <i class="ph" [ngClass]="isEditMode ? 'ph-pencil-simple' : 'ph-user-plus'"></i> 
                {{ isEditMode ? 'Modifier le Collaborateur' : 'Ajouter un Collaborateur' }}
              </h2>
              <p style="font-size:0.875rem; color:var(--text-secondary); margin:4px 0 0 0;">
                {{ isEditMode ? 'Modifiez les informations de ce compte.' : 'Créez un nouveau compte avec un rôle adapté.' }}
              </p>
            </div>
            <button type="button" (click)="closeModal()" style="background:none;border:none;color:var(--text-secondary);cursor:pointer;font-size:1.5rem;line-height:1;padding:4px;">
              <i class="ph ph-x"></i>
            </button>
          </div>

          <!-- Corps du formulaire -->
          <div class="widget-body">
            <form (ngSubmit)="onSubmit()" #userForm="ngForm" autocomplete="off">
              
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">Nom complet <span style="color:#ef4444">*</span></label>
                  <div class="input-icon-wrapper">
                    <i class="ph ph-user"></i>
                    <input type="text" name="nom" class="form-control" placeholder="ex: Jean Dupont" [(ngModel)]="utilisateur.nom" required autocomplete="off">
                  </div>
                </div>
                
                <div class="form-group">
                  <label class="form-label">Adresse e-mail <span style="color:#ef4444">*</span></label>
                  <div class="input-icon-wrapper">
                    <i class="ph ph-envelope-simple"></i>
                    <input type="email" name="email" class="form-control" placeholder="collaborateur@entreprise.com" [(ngModel)]="utilisateur.email" required autocomplete="off">
                  </div>
                </div>
                
                <div class="form-group">
                  <label class="form-label">Rôle d'accès <span style="color:#ef4444">*</span></label>
                  <div class="input-icon-wrapper">
                    <i class="ph ph-shield-check"></i>
                    <select class="form-control" name="role" [(ngModel)]="utilisateur.role" required style="appearance: none; padding-right: 48px;">
                      <option value="" disabled selected>Sélectionnez un rôle</option>
                      <option value="CLIENT">Client (Dépose ses retours)</option>
                      <option value="EMPLOYE">Employé (Gère les retours)</option>
                      <option value="QUALITE">Service Qualité (Valide / Rejette)</option>
                      <option value="ADMIN">Administrateur (Accès total)</option>
                    </select>
                    <i class="ph ph-caret-down" style="left: auto; right: 16px; color: var(--text-secondary); pointer-events: none;"></i>
                  </div>
                </div>
                
                <div class="form-group">
                  <label class="form-label">{{ isEditMode ? 'Nouveau mot de passe (optionnel)' : 'Mot de passe provisoire' }} <span *ngIf="!isEditMode" style="color:#ef4444">*</span></label>
                  <div class="input-icon-wrapper">
                    <i class="ph ph-lock-key"></i>
                    <input type="password" name="password" class="form-control" placeholder="••••••••" [(ngModel)]="utilisateur.password" [required]="!isEditMode" autocomplete="new-password">
                  </div>
                </div>
              </div>

              <div class="form-actions">
                <button type="submit" class="primary-btn" [disabled]="userForm.invalid || isSubmitting">
                  <i *ngIf="!isSubmitting" class="ph" [ngClass]="isEditMode ? 'ph-check-circle' : 'ph-user-plus'"></i>
                  <i *ngIf="isSubmitting" class="ph ph-spinner ph-spin"></i>
                  {{ isSubmitting ? 'Enregistrement...' : (isEditMode ? 'Enregistrer les modifications' : 'Créer et Envoyer l\\'accès') }}
                </button>
                <button type="button" class="secondary-btn" (click)="closeModal()">
                  <i class="ph ph-x-circle"></i> Annuler
                </button>
              </div>
              
            </form>
          </div>
        </div>
      </div> <!-- End modal-container -->
    </div> <!-- End .modal-overlay -->
  `,
  styleUrls: ['../../admin-shared.css']
})
export class UserForm implements OnInit {
  @Input() userToEdit: Utilisateur | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  utilisateur: Utilisateur = {
    nom: '',
    email: '',
    password: '',
    role: ''
  };
  
  isEditMode = false;
  isSubmitting = false;

  constructor(private utilisateurService: UtilisateurService) {}

  ngOnInit() {
    if (this.userToEdit) {
      this.isEditMode = true;
      this.utilisateur = { ...this.userToEdit, password: '' };
    }
  }

  onSubmit() {
    this.isSubmitting = true;
    
    if (this.isEditMode && this.utilisateur.id) {
      this.utilisateurService.updateUtilisateur(this.utilisateur.id, this.utilisateur).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.saved.emit();
          this.close.emit();
        },
        error: (err) => this.handleError(err)
      });
    } else {
      this.utilisateurService.createUtilisateur(this.utilisateur).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.saved.emit();
          this.close.emit();
        },
        error: (err) => this.handleError(err)
      });
    }
  }
  
  private handleError(err: any) {
    console.error('Erreur :', err);
    let message = 'Une erreur est survenue lors de la sauvegarde.';
    if (err.status === 401) message = 'Non rrr-authentifié (401).';
    else if (err.status === 403) message = 'Accès refusé (403).';
    else if (err.status === 400) message = 'Données invalides (400) : ' + (err.error?.message || JSON.stringify(err.error));
    else if (err.status === 409) message = 'Conflit (409) : Cet email existe déjà.';
    else if (err.status === 500) message = 'Erreur serveur (500).';
    alert(message);
    this.isSubmitting = false;
  }
  
  hasData(): boolean {
    return !!(this.utilisateur.nom || this.utilisateur.email || this.utilisateur.role || this.utilisateur.password);
  }

  closeModal() {
    if (this.hasData() && !this.isEditMode) {
      if (confirm('Voulez-vous vraiment annuler la création de ce collaborateur ?')) {
        this.close.emit();
      }
    } else {
      this.close.emit();
    }
  }

  onOverlayClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target?.classList?.contains('modal-overlay')) {
      this.closeModal();
    }
  }
}
