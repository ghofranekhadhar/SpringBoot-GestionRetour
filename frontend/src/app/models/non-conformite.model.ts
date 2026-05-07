import { Produit } from './produit.model';

export interface NonConformite {
  id?: number;
  description: string;
  gravite: 'FAIBLE' | 'MOYENNE' | 'CRITIQUE' | string;
  date?: string;
  produit: Produit;
}
