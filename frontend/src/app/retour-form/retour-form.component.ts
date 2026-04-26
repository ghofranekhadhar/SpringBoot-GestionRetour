import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { Produit } from '../models/produit.model';

@Component({
  selector: 'app-retour-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="card form-container">
      <h2>Nouveau Retour</h2>
      <form (ngSubmit)="onSubmit()" #form="ngForm">
        <div class="form-group">
          <label for="produit">Produit</label>
          <select id="produit" name="produitId" [(ngModel)]="selectedProduitId" required class="form-control">
            <option value="">-- Sélectionnez un produit --</option>
            <option *ngFor="let p of produits" [value]="p.id">{{p.nom}}</option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="motif">Motif</label>
          <textarea id="motif" name="motif" [(ngModel)]="motif" required class="form-control" rows="4"></textarea>
        </div>

        <div class="actions">
          <button type="submit" class="btn btn-primary" [disabled]="!form.valid">Soumettre</button>
          <a routerLink="/retours" class="btn btn-secondary">Annuler</a>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .form-container { max-width: 600px; margin: 0 auto; }
  `]
})
export class RetourFormComponent implements OnInit {
  produits: Produit[] = [];
  selectedProduitId: string = '';
  motif: string = '';

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit() {
    this.api.getProduits().subscribe(data => this.produits = data);
  }

  onSubmit() {
    if(!this.selectedProduitId || !this.motif) return;
    
    // Find the product to attach
    const produit = this.produits.find(p => p.id === Number(this.selectedProduitId));
    if(!produit) return;

    this.api.createRetour({
      produit: produit,
      motif: this.motif
    }).subscribe({
      next: () => this.router.navigate(['/retours']),
      error: (err) => console.error('Erreur création:', err)
    });
  }
}
