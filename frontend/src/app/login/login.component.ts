import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="page">

      <!-- ======= LEFT PANEL ======= -->
      <div class="left-panel">
        <!-- Abstract geometric shapes -->
        <div class="shape shape-circle-1"></div>
        <div class="shape shape-circle-2"></div>
        <div class="shape shape-circle-3"></div>
        <div class="shape shape-ring-1"></div>
        <div class="shape shape-ring-2"></div>
        <div class="shape shape-ring-3"></div>
        <div class="shape shape-line-1"></div>
        <div class="shape shape-line-2"></div>

        <!-- Content -->
        <div class="left-content">
          <div class="brand">
            <div class="brand-blocks">
              <span class="block-a"></span>
              <span class="block-b"></span>
            </div>
            <span class="brand-name">RetourTrack</span>
          </div>

          <div class="welcome-body">
            <h1 class="welcome-title">Bienvenue !</h1>
            <div class="accent-line"></div>
            <p class="welcome-desc">
              Gérez vos retours produits, non-conformités et historiques d'actions
              depuis une seule plateforme sécurisée et performante.
            </p>
            <a routerLink="/" class="learn-btn">En savoir plus</a>
          </div>
        </div>
      </div>

      <!-- ======= RIGHT PANEL ======= -->
      <div class="right-panel">
        <div class="form-card">
          <h2 class="form-title">Connexion</h2>
          <div class="title-underline"></div>

          <!-- Error -->
          <div *ngIf="error" class="error-banner">
            <span>⚠️</span> {{ error }}
          </div>

          <form (ngSubmit)="onSubmit()" #loginForm="ngForm" class="form">

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
                autocomplete="email"
              />
              <div *ngIf="emailRef.invalid && emailRef.touched" class="field-err">Email invalide.</div>
            </div>

            <div class="field">
              <label class="label">Mot de passe</label>
              <div class="input-row">
                <input
                  [type]="showPwd ? 'text' : 'password'"
                  name="password"
                  [(ngModel)]="password"
                  required
                  #pwdRef="ngModel"
                  class="input"
                  placeholder="••••••••"
                  autocomplete="current-password"
                />
                <button type="button" class="eye" (click)="showPwd = !showPwd">
                  {{ showPwd ? '🙈' : '👁️' }}
                </button>
              </div>
              <div *ngIf="pwdRef.invalid && pwdRef.touched" class="field-err">Mot de passe requis.</div>
            </div>

            <button
              type="submit"
              class="submit-btn"
              [disabled]="loginForm.invalid || loading"
            >
              <span *ngIf="loading" class="spinner"></span>
              {{ loading ? 'Connexion…' : 'Se connecter' }}
            </button>
          </form>

          <div class="switch-row">
            Pas de compte ?
            <a routerLink="/signup" class="switch-link">Créer un compte</a>
          </div>
          <a routerLink="/" class="back">← Retour à l'accueil</a>
        </div>
      </div>

    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

    * { box-sizing: border-box; margin: 0; padding: 0; }

    /* ============ PAGE ============ */
    .page {
      font-family: 'Inter', sans-serif;
      min-height: 100vh;
      display: flex;
    }

    /* ============ LEFT PANEL ============ */
    .left-panel {
      flex: 1.1;
      background: linear-gradient(145deg, #060d1f 0%, #0d1f3c 35%, #1e3c72 70%, #2a5298 100%);
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: stretch;
    }

    /* --- Geometric Shapes --- */
    .shape { position: absolute; }

    /* Solid circles */
    .shape-circle-1 {
      width: 280px; height: 280px; border-radius: 50%;
      background: rgba(96, 165, 250, 0.08);
      top: -80px; right: -60px;
      animation: pulse 6s ease-in-out infinite;
    }
    .shape-circle-2 {
      width: 200px; height: 200px; border-radius: 50%;
      background: rgba(59, 130, 246, 0.1);
      bottom: 60px; left: -70px;
      animation: pulse 8s ease-in-out infinite reverse;
    }
    .shape-circle-3 {
      width: 120px; height: 120px; border-radius: 50%;
      background: rgba(147, 197, 253, 0.07);
      top: 55%; right: 10%;
      animation: pulse 10s ease-in-out infinite 2s;
    }

    /* Rings */
    .shape-ring-1 {
      width: 380px; height: 380px; border-radius: 50%;
      border: 2px solid rgba(96, 165, 250, 0.14);
      top: 50%; left: 15%; transform: translateY(-50%);
      animation: spin-slow 30s linear infinite;
    }
    .shape-ring-2 {
      width: 240px; height: 240px; border-radius: 50%;
      border: 1.5px solid rgba(147, 197, 253, 0.1);
      top: 10%; right: 5%;
      animation: spin-slow 22s linear infinite reverse;
    }
    .shape-ring-3 {
      width: 160px; height: 160px; border-radius: 50%;
      border: 1px solid rgba(219, 234, 254, 0.12);
      bottom: 15%; right: 20%;
      animation: spin-slow 18s linear infinite;
    }

    /* Lines */
    .shape-line-1 {
      width: 3px; height: 120px;
      background: linear-gradient(to bottom, transparent, rgba(96,165,250,0.35), transparent);
      top: 20%; left: 38%;
      animation: float-y 5s ease-in-out infinite;
    }
    .shape-line-2 {
      width: 3px; height: 80px;
      background: linear-gradient(to bottom, transparent, rgba(147,197,253,0.25), transparent);
      top: 30%; left: 50%;
      animation: float-y 7s ease-in-out infinite 1.5s;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.08); opacity: 0.7; }
    }
    @keyframes spin-slow {
      to { transform: rotate(360deg); }
    }
    @keyframes spin-slow-t {
      to { transform: translateY(-50%) rotate(360deg); }
    }
    @keyframes float-y {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-16px); }
    }

    /* --- Content --- */
    .left-content {
      position: relative;
      z-index: 2;
      display: flex;
      flex-direction: column;
      padding: 44px 50px;
      width: 100%;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: auto;
    }
    .brand-blocks {
      display: flex;
      gap: 4px;
    }
    .block-a, .block-b {
      display: block;
      background: white;
      border-radius: 3px;
    }
    .block-a { width: 14px; height: 24px; }
    .block-b { width: 14px; height: 14px; align-self: flex-end; }
    .brand-name {
      color: white;
      font-size: 1.15rem;
      font-weight: 700;
      letter-spacing: -0.3px;
    }

    .welcome-body {
      padding-bottom: 60px;
    }
    .welcome-title {
      font-size: 4.2rem;
      font-weight: 900;
      color: white;
      line-height: 1.05;
      letter-spacing: -2px;
      margin-bottom: 18px;
    }
    .accent-line {
      width: 50px;
      height: 3px;
      background: linear-gradient(90deg, #60a5fa, #93c5fd);
      border-radius: 2px;
      margin-bottom: 24px;
    }
    .welcome-desc {
      color: rgba(255,255,255,0.55);
      font-size: 0.95rem;
      line-height: 1.75;
      max-width: 340px;
      margin-bottom: 36px;
    }
    .learn-btn {
      display: inline-block;
      background: linear-gradient(90deg, #f97316, #ef4444);
      color: white;
      font-weight: 700;
      font-size: 0.95rem;
      padding: 12px 30px;
      border-radius: 30px;
      text-decoration: none;
      box-shadow: 0 4px 20px rgba(239, 68, 68, 0.35);
      transition: all 0.3s;
      letter-spacing: 0.2px;
    }
    .learn-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 28px rgba(239, 68, 68, 0.5);
    }

    /* ============ RIGHT PANEL ============ */
    .right-panel {
      flex: 0 0 420px;
      background: linear-gradient(160deg, #0a1628 0%, #0d1f3c 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 30px;
    }

    .form-card {
      width: 100%;
      max-width: 360px;
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 20px;
      padding: 40px 36px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.5);
      animation: slideIn 0.5s cubic-bezier(0.16,1,0.3,1) forwards;
    }
    @keyframes slideIn {
      from { opacity: 0; transform: translateX(20px); }
      to   { opacity: 1; transform: translateX(0); }
    }

    .form-title {
      font-size: 1.8rem;
      font-weight: 800;
      color: white;
      text-align: center;
      margin-bottom: 10px;
      letter-spacing: -0.5px;
    }
    .title-underline {
      width: 40px;
      height: 3px;
      background: linear-gradient(90deg, #60a5fa, #2563eb);
      border-radius: 2px;
      margin: 0 auto 28px;
    }

    /* Error */
    .error-banner {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(239,68,68,0.15);
      border: 1px solid rgba(239,68,68,0.35);
      color: #fca5a5;
      padding: 10px 14px;
      border-radius: 10px;
      font-size: 0.85rem;
      margin-bottom: 18px;
      animation: shake 0.4s ease;
    }
    @keyframes shake {
      0%,100% { transform: translateX(0); }
      20%,60%  { transform: translateX(-5px); }
      40%,80%  { transform: translateX(5px); }
    }

    /* Form */
    .form { display: flex; flex-direction: column; gap: 18px; }

    .field { display: flex; flex-direction: column; gap: 6px; }

    .label {
      font-size: 0.83rem;
      font-weight: 600;
      color: rgba(255,255,255,0.7);
      letter-spacing: 0.3px;
    }

    .input-row { position: relative; display: flex; align-items: center; }

    .input {
      width: 100%;
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 10px;
      color: white;
      font-family: 'Inter', sans-serif;
      font-size: 0.93rem;
      padding: 11px 14px;
      outline: none;
      transition: all 0.25s;
    }
    .input::placeholder { color: rgba(255,255,255,0.28); }
    .input:focus {
      border-color: #3b82f6;
      background: rgba(255,255,255,0.12);
      box-shadow: 0 0 0 3px rgba(59,130,246,0.2);
    }

    .eye {
      position: absolute;
      right: 10px;
      background: none;
      border: none;
      font-size: 1rem;
      cursor: pointer;
      opacity: 0.7;
      transition: opacity 0.2s;
    }
    .eye:hover { opacity: 1; }

    .field-err { font-size: 0.75rem; color: #fca5a5; }

    .submit-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      width: 100%;
      padding: 13px;
      margin-top: 6px;
      background: linear-gradient(90deg, #f97316, #ef4444);
      color: white;
      font-size: 1rem;
      font-weight: 700;
      font-family: 'Inter', sans-serif;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      letter-spacing: 0.2px;
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
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .switch-row {
      text-align: center;
      font-size: 0.88rem;
      color: rgba(255,255,255,0.45);
      margin-top: 24px;
    }
    .switch-link {
      color: #60a5fa;
      font-weight: 600;
      text-decoration: none;
      margin-left: 5px;
      transition: color 0.2s;
    }
    .switch-link:hover { color: #93c5fd; }

    .back {
      display: block;
      text-align: center;
      margin-top: 14px;
      font-size: 0.82rem;
      color: rgba(255,255,255,0.25);
      text-decoration: none;
      transition: color 0.2s;
    }
    .back:hover { color: rgba(255,255,255,0.55); }

    /* ============ RESPONSIVE ============ */
    @media (max-width: 768px) {
      .page { flex-direction: column; }
      .left-panel { min-height: 260px; flex: none; }
      .welcome-title { font-size: 2.8rem; }
      .right-panel { flex: none; padding: 30px 20px 40px; }
    }
  `]
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  showPwd = false;
  loading = false;
  error = '';

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.logout();
  }

  onSubmit() {
    this.loading = true;
    this.error = '';
    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        const returnUrl = this.route.snapshot.queryParams['returnUrl'];
        if (returnUrl) {
          this.router.navigateByUrl(returnUrl);
        } else if (response.role === 'ADMIN' || response.role === 'QUALITE') {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['/user/dashboard']);
        }
      },
      error: () => {
        this.error = 'Email ou mot de passe incorrect. Vérifiez vos identifiants.';
        this.loading = false;
      }
    });
  }
}
