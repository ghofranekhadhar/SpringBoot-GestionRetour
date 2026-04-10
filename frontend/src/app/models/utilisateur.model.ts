export interface Utilisateur {
  id?: number;
  nom: string;
  email: string;
  password?: string;
  role: 'ADMIN' | 'EMPLOYE' | 'QUALITE' | 'CLIENT' | '';
}
