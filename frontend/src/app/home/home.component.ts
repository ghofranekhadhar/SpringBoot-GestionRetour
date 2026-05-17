import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  faqs = [
    {
      question: 'Comment RetourTrack sécurise-t-il les données ?',
      answer: 'Nous utilisons des tokens JWT (JSON Web Tokens) avec un hachage robuste (BCrypt) pour les mots de passe. Les rôles (Admin, Employé) garantissent un accès cloisonné aux données sensibles.',
      open: false
    },
    {
      question: 'Peut-on gérer plusieurs motifs de retour ?',
      answer: 'Absolument. La plateforme gère aussi bien les retours classiques (changement d\'avis, erreur de taille) que les non-conformités (défauts de fabrication, erreurs d\'étiquetage) avec des flux distincts.',
      open: false
    },
    {
      question: 'Le stock est-il mis à jour en temps réel ?',
      answer: 'Oui. Lorsqu\'un retour est validé par un administrateur et que le produit est remis en inventaire, le stock est automatiquement ajusté sans aucune intervention manuelle.',
      open: false
    },
    {
      question: 'Puis-je suivre l\'historique d\'un produit ?',
      answer: 'Oui, chaque action (déclaration, vérification, validation) est tracée avec la date, l\'heure et l\'utilisateur responsable, vous offrant une traçabilité totale.',
      open: false
    }
  ];

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
    const user = this.authService.currentUser;
    if (user) {
      if (user.role === 'ADMIN') {
        this.router.navigate(['/admin/dashboard']);
      } else {
        this.router.navigate(['/user/dashboard']);
      }
    }
  }

  toggleFaq(index: number) {
    this.faqs[index].open = !this.faqs[index].open;
  }
}
