import { Produit } from './produit.model';
import { Utilisateur } from './utilisateur.model';

export interface RetourProduit {
  id?: number;
  produit: Produit;
  client?: Utilisateur;
  motif: string;
  dateRetour?: string;
  statut?: string;
}
