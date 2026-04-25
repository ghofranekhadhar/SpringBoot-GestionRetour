import { Component, Output, EventEmitter, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProduitService } from '../../../services/produit.service';
import { Produit } from '../../../models/produit.model';

@Component({
  selector: 'app-product-form',
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
                <i class="ph" [ngClass]="isEditMode ? 'ph-pencil-simple' : 'ph-package'"></i> 
                {{ isEditMode ? 'Modifier le Produit' : 'Ajouter un Produit' }}
              </h2>
              <p style="font-size:0.875rem; color:var(--text-secondary); margin:4px 0 0 0;">
                {{ isEditMode ? 'Modifiez les informations de ce produit.' : 'Renseignez les informations du nouveau produit.' }}
              </p>
            </div>
            <button type="button" (click)="closeModal()" style="background:none;border:none;color:var(--text-secondary);cursor:pointer;font-size:1.5rem;line-height:1;padding:4px;">
              <i class="ph ph-x"></i>
            </button>
          </div>

          <!-- Corps du formulaire -->
          <div class="widget-body">
            <form (ngSubmit)="onSubmit()" #productForm="ngForm">
              
              <div class="form-group">
                <label class="form-label" for="nom">Nom du produit <span style="color:#ef4444">*</span></label>
                <div class="input-icon-wrapper">
                  <i class="ph ph-package"></i>
                  <input type="text" id="nom" name="nom" class="form-control" placeholder="ex: Casque Bluetooth Noize" [(ngModel)]="produit.nom" required>
                </div>
              </div>
              
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label" for="stock">Stock initial</label>
                  <div class="input-icon-wrapper">
                    <i class="ph ph-stack"></i>
                    <input type="number" id="stock" name="quantiteEnStock" class="form-control" placeholder="0" min="0" [(ngModel)]="produit.quantiteEnStock" required>
                  </div>
                </div>
                
                <div class="form-group">
                  <label class="form-label" for="prix">Prix unitaire (€)</label>
                  <div class="input-icon-wrapper">
                    <i class="ph ph-currency-eur"></i>
                    <input type="number" id="prix" name="prix" step="0.01" class="form-control" placeholder="0.00" min="0" [(ngModel)]="produit.prix" required>
                  </div>
                </div>
              </div>
              
              <div class="form-group">
                <label class="form-label" for="description">Description (Optionnelle)</label>
                <textarea id="description" name="description" class="form-control" rows="3" placeholder="Décrivez en détail le produit ou ses spécificités techniques..." [(ngModel)]="produit.description" style="padding-left: 16px; border-radius: 12px;"></textarea>
              </div>

              <div class="form-actions">
                <button type="submit" class="primary-btn" [disabled]="!productForm.form.valid || isSubmitting">
                  <i *ngIf="!isSubmitting" class="ph" [ngClass]="isEditMode ? 'ph-check-circle' : 'ph-check-circle'"></i>
                  <i *ngIf="isSubmitting" class="ph ph-spinner ph-spin"></i>
                  {{ isSubmitting ? 'Enregistrement...' : (isEditMode ? 'Enregistrer les modifications' : 'Confirmer et Ajouter') }}
                </button>
                <button type="button" class="secondary-btn" (click)="closeModal()" [disabled]="isSubmitting">
                  <i class="ph ph-x-circle"></i> Annuler
                </button>
              </div>
              
            </form>
          </div>
        </div>
      </div> <!-- End modal-container -->
    </div> <!-- End modal-overlay -->
  `,
  styleUrls: ['../../admin-shared.css']
})
export class ProductForm implements OnInit {
  @Input() productToEdit: Produit | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  produit: Produit = {
    nom: '',
    description: '',
    prix: 0,
    quantiteEnStock: 0
  };
  
  isEditMode = false;
  isSubmitting = false;

  constructor(private produitService: ProduitService) {}

  ngOnInit() {
    if (this.productToEdit) {
      this.isEditMode = true;
      this.produit = { ...this.productToEdit };
    }
  }

  onSubmit() {
    this.isSubmitting = true;

    if (this.isEditMode && this.produit.id) {
      this.produitService.updateProduit(this.produit.id, this.produit).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.saved.emit();
          this.close.emit();
        },
        error: (err) => this.handleError(err)
      });
    } else {
      this.produitService.createProduit(this.produit).subscribe({
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
    // basic error handling
    alert('Une erreur est survenue lors de la sauvegarde.');
    this.isSubmitting = false;
  }

  
  hasData(): boolean {
    return !!(this.produit.nom || (this.produit.quantiteEnStock && this.produit.quantiteEnStock > 0) || (this.produit.prix && this.produit.prix > 0) || this.produit.description);
  }

  closeModal() {
    if (this.hasData() && !this.isEditMode) {
      if (confirm('Vous avez saisi des données. Voulez-vous vraiment annuler ?')) {
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

