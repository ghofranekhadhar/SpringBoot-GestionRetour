import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../services/api.service';
import { RetourProduit } from '../models/retour-produit.model';

@Component({
  selector: 'app-retour-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="header">
      <h2>Liste des Retours</h2>
      <a routerLink="/retours/nouveau" class="btn btn-primary">Nouveau Retour</a>
    </div>
    
    <div class="card" *ngIf="retours.length > 0; else noData">
      <table class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Produit</th>
            <th>Motif</th>
            <th>Date</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let retour of retours">
            <td>{{retour.id}}</td>
            <td>{{retour.produit.nom}}</td>
            <td>{{retour.motif}}</td>
            <td>{{retour.dateRetour | date:'short'}}</td>
            <td>
              <span class="badge" [ngClass]="{'badge-pending': retour.statut === 'En attente', 'badge-success': retour.statut === 'Validé', 'badge-danger': retour.statut === 'Rejeté'}">
                {{retour.statut}}
              </span>
            </td>
            <td>
              <button *ngIf="retour.statut === 'En attente'" class="btn btn-sm btn-success" (click)="valider(retour.id)">Valider</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <ng-template #noData>
      <div class="empty-state">
        <p>Aucun retour trouvé.</p>
      </div>
    </ng-template>
  `,
  styles: [`
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
  `]
})
export class RetourListComponent implements OnInit {
  retours: RetourProduit[] = [];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.chargerRetours();
  }

  chargerRetours() {
    this.api.getRetours().subscribe({
      next: (data) => this.retours = data,
      error: (err) => console.error('Erreur chargement:', err)
    });
  }

  valider(id: number | undefined) {
    if (!id) return;
    // On utilise l'employé ID 1 par défaut pour la démo
    const employeId = 1;
    this.api.validerRetour(id, employeId).subscribe({
      next: () => {
        this.chargerRetours(); // Recharger la liste après validation
      },
      error: (err) => console.error('Erreur lors de la validation:', err)
    });
  }
}
