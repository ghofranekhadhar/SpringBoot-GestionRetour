import { Utilisateur } from './utilisateur.model';
import { RetourProduit } from './retour-produit.model';

export interface HistoriqueRetour {
  id?: number;
  retour: RetourProduit;
  action: string; // 'CREATION' | 'VALIDATION' | 'REJET' | 'MODIFICATION'
  employe?: Utilisateur;
  date?: string;
}
