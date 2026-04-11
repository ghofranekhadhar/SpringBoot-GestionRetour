import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="page">

      <!-- ======= LEFT PANEL ======= -->
      <div class="left-panel">
        <div class="shape shape-circle-1"></div>
        <div class="shape shape-circle-2"></div>
        <div class="shape shape-circle-3"></div>
        <div class="shape shape-ring-1"></div>
        <div class="shape shape-ring-2"></div>
        <div class="shape shape-ring-3"></div>
        <div class="shape shape-line-1"></div>
        <div class="shape shape-line-2"></div>

        <div class="left-content">
          <div class="brand">
            <div class="brand-blocks">
              <span class="block-a"></span>
              <span class="block-b"></span>
            </div>
            <span class="brand-name">RetourTrack</span>
          </div>

          <div class="welcome-body">
            <h1 class="welcome-title">Rejoignez-<br>nous !</h1>
            <div class="accent-line"></div>
            <p class="welcome-desc">
              Créez votre compte en quelques secondes et accédez
              à la plateforme complète de gestion des retours produits.
            </p>
            <a routerLink="/login" class="learn-btn">Déjà inscrit ?</a>
          </div>
        </div>
      </div>

      <!-- ======= RIGHT PANEL ======= -->
      <div class="right-panel">
        <div class="form-card">
          <h2 class="form-title">Inscription</h2>
          <div class="title-underline"></div>

          <div *ngIf="error" class="error-banner">
            <span>⚠️</span> {{ error }}
          </div>
          <div *ngIf="success" class="success-banner">
            <span>✅</span> Compte créé ! Redirection…
          </div>

          <form (ngSubmit)="onSubmit()" #signupForm="ngForm" class="form" *ngIf="!success">

            <!-- Nom -->
            <div class="field">
              <label class="label">Nom complet</label>
              <input
                type="text"
                name="nom"
                [(ngModel)]="nom"
                required
                minlength="2"
                #nomRef="ngModel"
                class="input"
                placeholder="Jean Dupont"
              />
              <div *ngIf="nomRef.invalid && nomRef.touched" class="field-err">Minimum 2 caractères.</div>
            </div>

            <!-- Email -->
            <div class="field">
              <label class="label">Adresse e-mail</label>
              <input
                type="email"
                name="email"
                [(ngModel)]="email"
                required
                email
                #emailRef="ngModel"
                class="input"
                placeholder="vous@exemple.com"
              />
              <div *ngIf="emailRef.invalid && emailRef.touched" class="field-err">Email invalide.</div>
            </div>

            <!-- Password -->
            <div class="field">
              <label class="label">Mot de passe</label>
              <div class="input-row">
                <input
                  [type]="showPwd ? 'text' : 'password'"
                  name="password"
                  [(ngModel)]="password"
                  required
                  minlength="6"
                  #pwdRef="ngModel"
                  class="input"
                  placeholder="6 caractères minimum"
                />
                <button type="button" class="eye" (click)="showPwd = !showPwd">
                  {{ showPwd ? '🙈' : '👁️' }}
                </button>
              </div>
              <!-- Strength bar -->
              <div class="strength-bar" *ngIf="password.length > 0">
                <div class="strength-track">
                  <div class="strength-fill" [class]="strengthClass" [style.width]="strengthWidth"></div>
                </div>
                <span class="strength-label" [class]="strengthClass">{{ strengthLabel }}</span>
              </div>
              <div *ngIf="pwdRef.invalid && pwdRef.touched" class="field-err">6 caractères minimum.</div>
            </div>

            <!-- Confirm -->
            <div class="field">
              <label class="label">Confirmer le mot de passe</label>
              <div class="input-row">
                <input
                  [type]="showConfirm ? 'text' : 'password'"
                  name="confirm"
                  [(ngModel)]="confirm"
                  required
                  class="input"
                  [class.mismatch]="confirm.length > 0 && confirm !== password"
                  placeholder="Répétez le mot de passe"
                />
                <button type="button" class="eye" (click)="showConfirm = !showConfirm">
                  {{ showConfirm ? '🙈' : '👁️' }}
                </button>
              </div>
              <div *ngIf="confirm.length > 0 && confirm !== password" class="field-err">
                Les mots de passe ne correspondent pas.
              </div>
            </div>

            <button
              type="submit"
              class="submit-btn"
              [disabled]="signupForm.invalid || loading || confirm !== password || confirm.length === 0"
            >
              <span *ngIf="loading" class="spinner"></span>
              {{ loading ? 'Création…' : 'Créer mon compte' }}
            </button>
          </form>

          <div class="switch-row">
            Déjà un compte ?
            <a routerLink="/login" class="switch-link">Se connecter</a>
          </div>
          <a routerLink="/" class="back">← Retour à l'accueil</a>
        </div>
      </div>

    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

    * { box-sizing: border-box; margin: 0; padding: 0; }

    .page {
      font-family: 'Inter', sans-serif;
      min-height: 100vh;
      display: flex;
    }

    /* ============ LEFT ============ */
    .left-panel {
      flex: 1.1;
      background: linear-gradient(145deg, #060d1f 0%, #0d1f3c 35%, #1e3c72 70%, #2a5298 100%);
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: stretch;
    }
    .shape { position: absolute; }

    .shape-circle-1 {
      width: 280px; height: 280px; border-radius: 50%;
      background: rgba(96,165,250,0.08);
      bottom: -60px; right: -60px;
      animation: pulse 6s ease-in-out infinite;
    }
    .shape-circle-2 {
      width: 200px; height: 200px; border-radius: 50%;
      background: rgba(59,130,246,0.1);
      top: 40px; left: -70px;
      animation: pulse 8s ease-in-out infinite reverse;
    }
    .shape-circle-3 {
      width: 120px; height: 120px; border-radius: 50%;
      background: rgba(147,197,253,0.07);
      top: 30%; right: 8%;
      animation: pulse 10s ease-in-out infinite 2s;
    }
    .shape-ring-1 {
      width: 380px; height: 380px; border-radius: 50%;
      border: 2px solid rgba(96,165,250,0.14);
      top: 50%; left: 15%; transform: translateY(-50%);
      animation: spin-slow 30s linear infinite;
    }
    .shape-ring-2 {
      width: 240px; height: 240px; border-radius: 50%;
      border: 1.5px solid rgba(147,197,253,0.1);
      bottom: 10%; right: 5%;
      animation: spin-slow 22s linear infinite reverse;
    }
    .shape-ring-3 {
      width: 160px; height: 160px; border-radius: 50%;
      border: 1px solid rgba(219,234,254,0.12);
      top: 15%; right: 20%;
      animation: spin-slow 18s linear infinite;
    }
    .shape-line-1 {
      width: 3px; height: 120px;
      background: linear-gradient(to bottom, transparent, rgba(96,165,250,0.35), transparent);
      top: 25%; left: 40%;
      animation: float-y 5s ease-in-out infinite;
    }
    .shape-line-2 {
      width: 3px; height: 80px;
      background: linear-gradient(to bottom, transparent, rgba(147,197,253,0.25), transparent);
      top: 55%; left: 55%;
      animation: float-y 7s ease-in-out infinite 1.5s;
    }

    @keyframes pulse {
      0%,100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.08); opacity: 0.7; }
    }
    @keyframes spin-slow { to { transform: rotate(360deg); } }
    @keyframes float-y {
      0%,100% { transform: translateY(0); }
      50% { transform: translateY(-16px); }
    }

    .left-content {
      position: relative; z-index: 2;
      display: flex; flex-direction: column;
      padding: 44px 50px; width: 100%;
    }

    .brand { display: flex; align-items: center; gap: 12px; margin-bottom: auto; }
    .brand-blocks { display: flex; gap: 4px; }
    .block-a, .block-b { display: block; background: white; border-radius: 3px; }
    .block-a { width: 14px; height: 24px; }
    .block-b { width: 14px; height: 14px; align-self: flex-end; }
    .brand-name { color: white; font-size: 1.15rem; font-weight: 700; }

    .welcome-body { padding-bottom: 60px; }
    .welcome-title {
      font-size: 3.8rem; font-weight: 900; color: white;
      line-height: 1.05; letter-spacing: -2px; margin-bottom: 18px;
    }
    .accent-line {
      width: 50px; height: 3px;
      background: linear-gradient(90deg, #f97316, #ef4444);
      border-radius: 2px; margin-bottom: 24px;
    }
    .welcome-desc {
      color: rgba(255,255,255,0.55); font-size: 0.95rem;
      line-height: 1.75; max-width: 340px; margin-bottom: 36px;
    }
    .learn-btn {
      display: inline-block;
      background: linear-gradient(90deg, #2563eb, #1e3c72);
      color: white; font-weight: 700; font-size: 0.95rem;
      padding: 12px 30px; border-radius: 30px; text-decoration: none;
      box-shadow: 0 4px 20px rgba(37,99,235,0.35);
      transition: all 0.3s;
    }
    .learn-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 28px rgba(37,99,235,0.5);
    }

    /* ============ RIGHT ============ */
    .right-panel {
      flex: 0 0 430px;
      background: linear-gradient(160deg, #0a1628 0%, #0d1f3c 100%);
      display: flex; align-items: center; justify-content: center;
      padding: 30px 30px;
    }
    .form-card {
      width: 100%; max-width: 370px;
      background: rgba(255,255,255,0.05);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 20px; padding: 36px 34px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.5);
      animation: slideIn 0.5s cubic-bezier(0.16,1,0.3,1) forwards;
    }
    @keyframes slideIn {
      from { opacity: 0; transform: translateX(20px); }
      to   { opacity: 1; transform: translateX(0); }
    }

    .form-title {
      font-size: 1.75rem; font-weight: 800; color: white;
      text-align: center; margin-bottom: 10px; letter-spacing: -0.4px;
    }
    .title-underline {
      width: 40px; height: 3px;
      background: linear-gradient(90deg, #f97316, #ef4444);
      border-radius: 2px; margin: 0 auto 24px;
    }

    .error-banner {
      display: flex; align-items: center; gap: 8px;
      background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.35);
      color: #fca5a5; padding: 10px 14px; border-radius: 10px;
      font-size: 0.85rem; margin-bottom: 16px;
      animation: shake 0.4s ease;
    }
    .success-banner {
      display: flex; align-items: center; gap: 8px;
      background: rgba(34,197,94,0.15); border: 1px solid rgba(34,197,94,0.35);
      color: #86efac; padding: 12px 16px; border-radius: 10px;
      font-size: 0.9rem; margin-bottom: 16px;
    }
    @keyframes shake {
      0%,100% { transform: translateX(0); }
      20%,60%  { transform: translateX(-5px); }
      40%,80%  { transform: translateX(5px); }
    }

    .form { display: flex; flex-direction: column; gap: 15px; }
    .field { display: flex; flex-direction: column; gap: 5px; }
    .label { font-size: 0.82rem; font-weight: 600; color: rgba(255,255,255,0.7); }
    .input-row { position: relative; display: flex; align-items: center; }

    .input {
      width: 100%;
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 10px; color: white;
      font-family: 'Inter', sans-serif; font-size: 0.92rem;
      padding: 11px 14px; outline: none; transition: all 0.25s;
    }
    .input::placeholder { color: rgba(255,255,255,0.28); }
    .input:focus {
      border-color: #3b82f6;
      background: rgba(255,255,255,0.12);
      box-shadow: 0 0 0 3px rgba(59,130,246,0.2);
    }
    .input.mismatch {
      border-color: rgba(239,68,68,0.6);
      box-shadow: 0 0 0 3px rgba(239,68,68,0.15);
    }

    .eye {
      position: absolute; right: 10px;
      background: none; border: none; font-size: 0.95rem;
      cursor: pointer; opacity: 0.7; transition: opacity 0.2s;
    }
    .eye:hover { opacity: 1; }
    .field-err { font-size: 0.74rem; color: #fca5a5; }

    /* Strength */
    .strength-bar { display: flex; align-items: center; gap: 8px; margin-top: 3px; }
    .strength-track { flex: 1; height: 4px; background: rgba(255,255,255,0.1); border-radius: 99px; overflow: hidden; }
    .strength-fill { height: 100%; border-radius: 99px; transition: width 0.4s, background 0.4s; }
    .strength-fill.weak    { background: #ef4444; }
    .strength-fill.medium  { background: #f59e0b; }
    .strength-fill.strong  { background: #22c55e; }
    .strength-label { font-size: 0.72rem; font-weight: 600; min-width: 45px; }
    .strength-label.weak   { color: #ef4444; }
    .strength-label.medium { color: #f59e0b; }
    .strength-label.strong { color: #22c55e; }

    .submit-btn {
      display: flex; align-items: center; justify-content: center; gap: 10px;
      width: 100%; padding: 13px; margin-top: 6px;
      background: linear-gradient(90deg, #f97316, #ef4444);
      color: white; font-size: 1rem; font-weight: 700;
      font-family: 'Inter', sans-serif; border: none; border-radius: 10px;
      cursor: pointer; letter-spacing: 0.2px;
      box-shadow: 0 4px 18px rgba(239,68,68,0.35);
      transition: all 0.25s;
    }
    .submit-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 26px rgba(239,68,68,0.5);
    }
    .submit-btn:disabled { opacity: 0.45; cursor: not-allowed; }

    .spinner {
      width: 16px; height: 16px;
      border: 2px solid rgba(255,255,255,0.25);
      border-top-color: white; border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .switch-row {
      text-align: center; font-size: 0.87rem;
      color: rgba(255,255,255,0.4); margin-top: 22px;
    }
    .switch-link {
      color: #f97316; font-weight: 600;
      text-decoration: none; margin-left: 5px; transition: color 0.2s;
    }
    .switch-link:hover { color: #fb923c; }

    .back {
      display: block; text-align: center; margin-top: 13px;
      font-size: 0.81rem; color: rgba(255,255,255,0.25);
      text-decoration: none; transition: color 0.2s;
    }
    .back:hover { color: rgba(255,255,255,0.55); }

    @media (max-width: 768px) {
      .page { flex-direction: column; }
      .left-panel { min-height: 230px; flex: none; }
      .welcome-title { font-size: 2.6rem; }
      .right-panel { flex: none; padding: 30px 20px 40px; }
    }
  `]
})
export class SignupComponent {
  nom = '';
  email = '';
  password = '';
  confirm = '';
  showPwd = false;
  showConfirm = false;
  loading = false;
  error = '';
  success = false;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private notifService: NotificationService
  ) {}

  get strengthClass(): string {
    const l = this.password.length;
    if (l === 0) return '';
    if (l < 6) return 'weak';
    if (l < 10) return 'medium';
    return 'strong';
  }
  get strengthWidth(): string {
    const l = this.password.length;
    if (l === 0) return '0%';
    if (l < 6) return '33%';
    if (l < 10) return '66%';
    return '100%';
  }
  get strengthLabel(): string {
    const l = this.password.length;
    if (l === 0) return '';
    if (l < 6) return 'Faible';
    if (l < 10) return 'Moyen';
    return 'Fort';
  }

  onSubmit() {
    if (this.password !== this.confirm) {
      this.error = 'Les mots de passe ne correspondent pas.';
      return;
    }
    this.loading = true;
    this.error = '';
    this.authService.register(this.nom, this.email, this.password).subscribe({
      next: (response) => {
        this.success = true;
        this.loading = false;
        
        // Notification de bienvenue
        this.notifService.addNotification({
          title: 'Bienvenue !',
          message: `Ravi de vous voir, ${this.nom}. Votre compte est prêt.`,
          type: 'success'
        });

        setTimeout(() => {
          if (response && response.role === 'ADMIN') {
            this.router.navigate(['/admin/dashboard']);
          } else {
            this.router.navigate(['/user/dashboard']);
          }
        }, 1500);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.status === 409
          ? 'Un compte avec cet email existe déjà.'
          : 'Une erreur est survenue. Veuillez réessayer.';
      }
    });
  }
}
