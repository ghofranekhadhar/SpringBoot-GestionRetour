import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
  <div class="page">

    <!-- ═══════════════════════════════════
         Formes d'arrière-plan (une seule fois)
    ═══════════════════════════════════ -->
    <div class="bg-shapes" aria-hidden="true">
      <div class="bs bs-1"></div>
      <div class="bs bs-2"></div>
      <div class="bs bs-3"></div>
      <div class="ring ring-1"></div>
      <div class="ring ring-2"></div>
      <div class="line line-1"></div>
      <div class="line line-2"></div>
    </div>

    <!-- ═══════════════════════════════════
         HERO
    ═══════════════════════════════════ -->
    <section class="hero">
      <div class="hero-inner">

        <div class="hero-left">
          <div class="badge">Plateforme de gestion des retours</div>
          <h1>
            Gérez vos retours<br>
            <span class="accent">intelligemment</span>
          </h1>
          <p class="hero-desc">
            RetourTrack centralise la gestion complète de vos retours,
            non-conformités et historiques d'actions en une seule
            plateforme sécurisée et performante.
          </p>
          <div class="hero-ctas">
            <a routerLink="/login" class="btn-primary">Commencer maintenant →</a>
            <a href="#features" class="btn-ghost">Voir les fonctionnalités</a>
          </div>
        </div>

        <div class="hero-right">
          <!-- Dashboard mockup flotant -->
          <div class="mockup">
            <div class="mockup-bar">
              <span class="dot red"></span>
              <span class="dot yellow"></span>
              <span class="dot green"></span>
              <span class="mockup-title-txt">RetourTrack Dashboard</span>
            </div>
            <div class="mockup-body">
              <div class="stats-row">
                <div class="stat-box"><div class="sv blue">240</div><div class="sl">Retours</div></div>
                <div class="stat-box"><div class="sv orange">18</div><div class="sl">En attente</div></div>
                <div class="stat-box"><div class="sv green">98%</div><div class="sl">Traités</div></div>
              </div>
              <div class="bars">
                <div class="bar-lbl">Retours cette semaine</div>
                <div class="bar-track"><div class="bar-fill" style="width:78%"></div></div>
                <div class="bar-lbl">Non-conformités</div>
                <div class="bar-track"><div class="bar-fill bf-orange" style="width:45%"></div></div>
                <div class="bar-lbl">Taux de satisfaction</div>
                <div class="bar-track"><div class="bar-fill bf-green" style="width:93%"></div></div>
              </div>
              <div class="list">
                <div class="list-row">
                  <span class="dot-s blue-s"></span>
                  <span>Retour #1042 — Produit défectueux</span>
                  <span class="tag t-orange">En cours</span>
                </div>
                <div class="list-row">
                  <span class="dot-s green-s"></span>
                  <span>Retour #1041 — Mauvaise taille</span>
                  <span class="tag t-green">Validé</span>
                </div>
                <div class="list-row">
                  <span class="dot-s orange-s"></span>
                  <span>Non-conformité #87 — Étiquette</span>
                  <span class="tag t-red">NC</span>
                </div>
              </div>
            </div>
          </div>
          <div class="fc fc-a"><span>📦</span><div><div class="fc-n">+240</div><div class="fc-l">Retours traités</div></div></div>
          <div class="fc fc-b"><span>⚡</span><div><div class="fc-n">98%</div><div class="fc-l">Satisfaction</div></div></div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════
         STATS
    ═══════════════════════════════════ -->
    <section class="section" id="stats">
      <div class="section-container">
        <div class="stats-grid">
          <div class="card-stat">
            <div class="card-icon">📦</div>
            <div class="card-num">500+</div>
            <div class="card-lbl">Retours gérés</div>
          </div>
          <div class="card-stat">
            <div class="card-icon">🔐</div>
            <div class="card-num">100%</div>
            <div class="card-lbl">Sécurisé JWT</div>
          </div>
          <div class="card-stat">
            <div class="card-icon">👥</div>
            <div class="card-num">3</div>
            <div class="card-lbl">Niveaux d'accès</div>
          </div>
          <div class="card-stat">
            <div class="card-icon">⚡</div>
            <div class="card-num">24/7</div>
            <div class="card-lbl">Disponibilité</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════
         FONCTIONNALITÉS
    ═══════════════════════════════════ -->
    <section class="section" id="features">
      <div class="section-container">
        <div class="sec-head">
          <div class="badge"> Fonctionnalités</div>
          <h2>Tout ce dont vous avez besoin</h2>
          <p>Une suite complète pour optimiser vos retours produits.</p>
        </div>
        <div class="feat-grid">
          <div class="card-feat">
            <div class="feat-icon" style="background:rgba(59,130,246,.14)">🔐</div>
            <h3>Authentification sécurisée</h3>
            <p>JWT + rôles Admin/Employé pour un accès personnalisé et sécurisé.</p>
          </div>
          <div class="card-feat">
            <div class="feat-icon" style="background:rgba(249,115,22,.14)">📋</div>
            <h3>Gestion des retours</h3>
            <p>Créez, suivez et validez les retours avec historique complet.</p>
          </div>
          <div class="card-feat">
            <div class="feat-icon" style="background:rgba(239,68,68,.14)">⚠️</div>
            <h3>Non-conformités</h3>
            <p>Identifiez et documentez les NC pour améliorer votre qualité.</p>
          </div>
          <div class="card-feat">
            <div class="feat-icon" style="background:rgba(34,197,94,.14)">📊</div>
            <h3>Historique & Traçabilité</h3>
            <p>Accédez à l'historique complet avec dates et intervenants.</p>
          </div>
          <div class="card-feat">
            <div class="feat-icon" style="background:rgba(139,92,246,.14)">👥</div>
            <h3>Gestion des utilisateurs</h3>
            <p>Administration complète des comptes avec permissions granulaires.</p>
          </div>
          <div class="card-feat">
            <div class="feat-icon" style="background:rgba(6,182,212,.14)">🔄</div>
            <h3>Mise à jour du stock</h3>
            <p>Stock automatiquement mis à jour lors de la validation du retour.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════
         PROCESSUS
    ═══════════════════════════════════ -->
    <section class="section" id="process">
      <div class="section-container">
        <div class="sec-head">
          <div class="badge" style="background:rgba(249,115,22,.14);color:#fb923c"> Comment ça marche</div>
          <h2>Simple et efficace en 3 étapes</h2>
          <p>Un flux de travail clair pour tous vos retours.</p>
        </div>
        <div class="steps">
          <div class="step-card">
            <div class="step-n">01</div>
            <div class="step-icon">📝</div>
            <h3>Déclarer un retour</h3>
            <p>Sélectionnez le produit et saisissez le motif en quelques secondes.</p>
          </div>
          <div class="arrow">→</div>
          <div class="step-card">
            <div class="step-n">02</div>
            <div class="step-icon">🔍</div>
            <h3>Traitement & vérification</h3>
            <p>Un administrateur examine la demande et peut documenter une NC.</p>
          </div>
          <div class="arrow">→</div>
          <div class="step-card">
            <div class="step-n">03</div>
            <div class="step-icon">✅</div>
            <h3>Validation & mise à jour</h3>
            <p>Retour validé, stock mis à jour, action enregistrée dans l'historique.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════
         CTA FINAL
    ═══════════════════════════════════ -->
    <section class="section cta-section" id="cta">
      <div class="section-container">
        <div class="cta-box">
          <div class="badge" style="background:rgba(255,255,255,.08);color:rgba(255,255,255,.75)"> Prêt à démarrer ?</div>
          <h2>Accédez à votre espace<br>de gestion dès maintenant</h2>
          <p>Rejoignez la plateforme et prenez le contrôle de vos retours produits.</p>
          <div class="cta-btns">
            <a routerLink="/login" class="btn-primary large">Se connecter ✨</a>
            <a routerLink="/signup" class="btn-ghost">Créer un compte</a>
          </div>
        </div>
      </div>
    </section>

  </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

    * { box-sizing: border-box; margin: 0; padding: 0; }

    /* ══════════════════════════════════════════
       PAGE WRAPPER — un seul fond continu
    ══════════════════════════════════════════ */
    .page {
      font-family: 'Inter', sans-serif;
      background: linear-gradient(160deg, #060d1f 0%, #0b1a35 30%, #0d1f3c 60%, #102448 100%);
      min-height: 100vh;
      position: relative;
      overflow-x: hidden;
      /* Padding-top pour la navbar flottante */
      padding-top: 76px;
    }

    /* ══ Formes d'arrière-plan fixes ══ */
    .bg-shapes { position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
    .bs { position: absolute; border-radius: 50%; }
    .bs-1 {
      width: 600px; height: 600px;
      background: radial-gradient(circle, rgba(37,99,235,0.1) 0%, transparent 70%);
      top: -200px; right: -150px;
      animation: pulse 9s ease-in-out infinite;
    }
    .bs-2 {
      width: 500px; height: 500px;
      background: radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 70%);
      bottom: 20%; left: -150px;
      animation: pulse 12s ease-in-out infinite reverse;
    }
    .bs-3 {
      width: 300px; height:300px;
      background: radial-gradient(circle, rgba(147,197,253,0.05) 0%, transparent 70%);
      top: 40%; left: 35%;
      animation: pulse 15s ease-in-out infinite 3s;
    }
    .ring { position: absolute; border-radius: 50%; }
    .ring-1 {
      width: 700px; height: 700px;
      border: 1px solid rgba(99,164,255,0.08);
      top: 5%; left: 50%; transform: translateX(-50%);
      animation: spin 50s linear infinite;
    }
    .ring-2 {
      width: 400px; height: 400px;
      border: 1px solid rgba(147,197,253,0.06);
      bottom: 10%; right: -100px;
      animation: spin 35s linear infinite reverse;
    }
    .line { position: absolute; width: 2px; border-radius: 2px; }
    .line-1 {
      height: 120px;
      background: linear-gradient(to bottom, transparent, rgba(99,164,255,0.25), transparent);
      top: 25%; left: 42%;
      animation: floaty 6s ease-in-out infinite;
    }
    .line-2 {
      height: 80px;
      background: linear-gradient(to bottom, transparent, rgba(147,197,253,0.15), transparent);
      top: 60%; left: 62%;
      animation: floaty 9s ease-in-out infinite 2s;
    }

    @keyframes pulse {
      0%,100% { transform: scale(1); opacity: 1; }
      50%      { transform: scale(1.12); opacity: 0.6; }
    }
    @keyframes spin { to { transform: translateX(-50%) rotate(360deg); } }
    @keyframes spin-simple { to { transform: rotate(360deg); } }
    @keyframes floaty {
      0%,100% { transform: translateY(0); }
      50%      { transform: translateY(-16px); }
    }
    @keyframes float-mock {
      0%,100% { transform: translateY(0); }
      50%      { transform: translateY(-10px); }
    }
    @keyframes float-card {
      0%,100% { transform: translateY(0); }
      50%      { transform: translateY(-8px); }
    }
    @keyframes bar-grow { from { width: 0 !important; } }

    /* ═══ Sections & Container — "Card" style global ═══ */
    .section {
      position: relative;
      z-index: 1;
      padding: 20px 40px; /* Reduced to accommodate the container padding */
      margin-bottom: 40px;
    }

    /* Le container central qui enveloppe chaque section = l'effet "carte" */
    .section-container {
      background: rgba(14, 28, 62, 0.6); /* Slightly lighter background for the content container */
      border: 1px solid rgba(255, 255, 255, 0.05); /* very subtle border */
      border-radius: 24px;
      padding: 60px;
      max-width: 1200px;
      margin: 0 auto;
      backdrop-filter: blur(10px);
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    }

    /* ══════════════════════════════════════════
       HERO
    ══════════════════════════════════════════ */
    .hero {
      position: relative;
      z-index: 1;
      min-height: calc(100vh - 76px);
      display: flex;
      align-items: center;
    }
    .hero-inner {
      display: flex;
      gap: 60px;
      align-items: center;
      width: 100%;
      max-width: 1280px;
      margin: 0 auto;
      padding: 40px 80px 80px;
    }
    .hero-left { flex: 1; }
    .hero-right {
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
    }

    /* Badge pill bleu léger */
    .badge {
      display: inline-block;
      background: rgba(59,130,246,0.14);
      border: 1px solid rgba(59,130,246,0.28);
      color: #93c5fd;
      padding: 6px 16px; border-radius: 20px;
      font-size: 0.82rem; font-weight: 600;
      margin-bottom: 24px; letter-spacing: 0.2px;
    }
    h1 {
      font-size: 3.7rem; font-weight: 900;
      color: white; line-height: 1.1;
      letter-spacing: -1.5px; margin-bottom: 22px;
    }
    .accent {
      background: linear-gradient(90deg, #f97316, #ef4444);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .hero-desc {
      font-size: 1.04rem; color: rgba(255,255,255,0.52);
      line-height: 1.75; max-width: 480px; margin-bottom: 34px;
    }
    .hero-ctas { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 30px; }

    /* Boutons */
    .btn-primary {
      display: inline-block;
      background: linear-gradient(90deg, #f97316, #ef4444);
      color: white; padding: 14px 32px; border-radius: 30px;
      font-weight: 700; font-size: 1rem; text-decoration: none;
      box-shadow: 0 4px 20px rgba(239,68,68,0.32);
      transition: all .3s;
    }
    .btn-primary:hover { transform: translateY(-3px); box-shadow: 0 8px 28px rgba(239,68,68,0.48); }
    .btn-primary.large { font-size: 1.05rem; padding: 15px 40px; }

    .btn-ghost {
      display: inline-block; color: rgba(255,255,255,0.72);
      padding: 14px 24px; border-radius: 30px;
      font-weight: 600; font-size: 1rem; text-decoration: none;
      border: 1.5px solid rgba(255,255,255,0.18);
      transition: all .3s;
    }
    .btn-ghost:hover { background: rgba(255,255,255,0.07); color: white; border-color: rgba(255,255,255,0.38); }

    .trust { display: flex; gap: 22px; flex-wrap: wrap; }
    .trust span { color: rgba(255,255,255,0.45); font-size: 0.87rem; font-weight: 500; }

    /* Dashboard mockup */
    .mockup {
      width: 100%; max-width: 440px;
      background: rgba(255,255,255,0.05);
      backdrop-filter: blur(18px);
      border: 1px solid rgba(255,255,255,0.09);
      border-radius: 18px; overflow: hidden;
      box-shadow: 0 24px 60px rgba(0,0,0,0.45);
      animation: float-mock 4s ease-in-out infinite;
    }
    .mockup-bar {
      background: rgba(255,255,255,0.055);
      padding: 11px 16px;
      display: flex; align-items: center; gap: 10px;
      border-bottom: 1px solid rgba(255,255,255,0.07);
    }
    .dot { width: 10px; height: 10px; border-radius: 50%; }
    .red { background:#ef4444; } .yellow { background:#f59e0b; } .green { background:#22c55e; }
    .mockup-title-txt { color: rgba(255,255,255,0.4); font-size: 0.78rem; font-weight: 600; }
    .mockup-body { padding: 18px; display: flex; flex-direction: column; gap: 16px; }

    .stats-row { display: flex; gap: 10px; }
    .stat-box {
      flex: 1; background: rgba(255,255,255,0.055);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 10px; padding: 12px 8px; text-align: center;
    }
    .sv { font-size: 1.5rem; font-weight: 800; color: white; }
    .sl { font-size: 0.68rem; color: rgba(255,255,255,0.38); margin-top: 3px; }
    .blue { color: #60a5fa !important; } .orange { color: #fb923c !important; } .green { color: #4ade80 !important; }

    .bar-lbl { font-size: 0.7rem; color: rgba(255,255,255,0.42); margin-bottom: 4px; }
    .bar-track { height: 5px; background: rgba(255,255,255,0.07); border-radius: 99px; overflow: hidden; margin-bottom: 9px; }
    .bar-fill { height: 100%; background: linear-gradient(90deg, #2563eb, #60a5fa); border-radius: 99px; animation: bar-grow 1.5s ease; }
    .bf-orange { background: linear-gradient(90deg, #f97316, #fb923c); }
    .bf-green  { background: linear-gradient(90deg, #16a34a, #4ade80); }

    .list { display: flex; flex-direction: column; gap: 7px; }
    .list-row {
      display: flex; align-items: center; gap: 9px;
      font-size: 0.73rem; color: rgba(255,255,255,0.58);
      background: rgba(255,255,255,0.04); border-radius: 8px; padding: 7px 10px;
    }
    .dot-s { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
    .blue-s { background:#60a5fa; } .green-s { background:#4ade80; } .orange-s { background:#fb923c; }
    .tag { margin-left: auto; padding: 2px 8px; border-radius: 9px; font-size: 0.66rem; font-weight: 700; }
    .t-orange { background:rgba(249,115,22,.22); color:#fb923c; }
    .t-green  { background:rgba(34,197,94,.22); color:#4ade80; }
    .t-red    { background:rgba(239,68,68,.22); color:#fca5a5; }

    /* Floating cards */
    .fc {
      position: absolute;
      background: rgba(255,255,255,0.07);
      backdrop-filter: blur(14px);
      border: 1px solid rgba(255,255,255,0.13);
      border-radius: 14px; padding: 12px 18px;
      display: flex; gap: 12px; align-items: center;
      box-shadow: 0 8px 24px rgba(0,0,0,0.28);
      font-size: 1.55rem;
    }
    .fc-a { bottom: -18px; left: -28px; animation: float-card 3.2s ease-in-out infinite; }
    .fc-b { top: -18px; right: -28px; animation: float-card 3.2s ease-in-out infinite 1.6s; }
    .fc-n { font-weight: 800; font-size: 1.05rem; color: white; }
    .fc-l { font-size: 0.68rem; color: rgba(255,255,255,0.45); }

    /* ═══ STATS ═══ */
    .stats-grid {
      display: grid; grid-template-columns: repeat(4,1fr);
      gap: 22px; max-width: 900px; margin: 0 auto;
    }
    .card-stat {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 16px; padding: 30px 16px;
      text-align: center; transition: all .3s;
    }
    .card-stat:hover {
      background: rgba(255,255,255,0.07);
      border-color: rgba(99,164,255,0.22);
      transform: translateY(-4px);
      box-shadow: 0 12px 30px rgba(0,0,0,0.28);
    }
    .card-icon { font-size: 1.9rem; margin-bottom: 12px; }
    .card-num { font-size: 2.3rem; font-weight: 900; color: white; letter-spacing: -1px; margin-bottom: 6px; }
    .card-lbl { font-size: 0.82rem; color: rgba(255,255,255,0.42); font-weight: 500; }

    /* ═══ FEATURES ═══ */
    .sec-head { text-align: center; margin-bottom: 52px; }
    .sec-head h2 { font-size: 2.3rem; font-weight: 800; color: white; letter-spacing: -.7px; margin: 14px 0 10px; }
    .sec-head p  { color: rgba(255,255,255,0.42); font-size: .97rem; }

    .feat-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(280px,1fr));
      gap: 20px; max-width: 1080px; margin: 0 auto;
    }
    .card-feat {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 16px; padding: 28px; transition: all .3s;
    }
    .card-feat:hover {
      background: rgba(255,255,255,0.07);
      border-color: rgba(99,164,255,0.2);
      transform: translateY(-5px);
      box-shadow: 0 12px 32px rgba(0,0,0,0.28);
    }
    .feat-icon { width: 50px; height: 50px; border-radius: 13px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; margin-bottom: 16px; }
    .card-feat h3 { font-size: 1rem; font-weight: 700; color: white; margin-bottom: 9px; }
    .card-feat p  { font-size: 0.86rem; color: rgba(255,255,255,0.42); line-height: 1.65; }

    /* ═══ PROCESS ═══ */
    .steps {
      display: flex; align-items: flex-start;
      gap: 16px; max-width: 940px; margin: 0 auto;
      flex-wrap: wrap; justify-content: center;
    }
    .step-card {
      flex: 1; min-width: 210px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 16px; padding: 30px 22px; text-align: center; transition: all .3s;
    }
    .step-card:hover {
      background: rgba(255,255,255,0.07);
      border-color: rgba(249,115,22,0.22);
      transform: translateY(-4px); box-shadow: 0 12px 30px rgba(0,0,0,0.28);
    }
    .step-n { font-size: 2.8rem; font-weight: 900; color: rgba(255,255,255,0.05); line-height: 1; margin-bottom: 8px; }
    .step-icon { font-size: 1.9rem; margin-bottom: 12px; }
    .step-card h3 { font-size: .98rem; font-weight: 700; color: white; margin-bottom: 9px; }
    .step-card p  { font-size: .84rem; color: rgba(255,255,255,0.42); line-height: 1.65; }
    .arrow { font-size: 1.7rem; color: rgba(249,115,22,0.45); align-self: center; }

    /* ═══ CTA FINAL ═══ */
    .cta-section { text-align: center; }
    .cta-box { max-width: 640px; margin: 0 auto; }
    .cta-section h2 {
      font-size: 2.6rem; font-weight: 900; color: white;
      letter-spacing: -.9px; margin: 14px 0 12px; line-height: 1.15;
    }
    .cta-section p { color: rgba(255,255,255,0.45); font-size: 1rem; margin-bottom: 38px; }
    .cta-btns { display: flex; gap: 18px; justify-content: center; flex-wrap: wrap; }

    /* ═══ RESPONSIVE ═══ */
    @media (max-width: 900px) {
      .hero-inner { flex-direction: column; padding: 40px 30px 60px; }
      h1 { font-size: 2.5rem; }
      .hero-right { width: 100%; }
      .fc-a, .fc-b { display: none; }
      .stats-grid { grid-template-columns: repeat(2,1fr); }
      .section { padding: 40px 20px; }
      .section-container { padding: 40px 20px; border-radius: 16px; }
    }
    @media (max-width: 560px) {
      h1 { font-size: 1.9rem; letter-spacing: -.6px; }
      .cta-section h2 { font-size: 1.8rem; }
    }
  `]
})
export class HomeComponent implements OnInit {
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
}
