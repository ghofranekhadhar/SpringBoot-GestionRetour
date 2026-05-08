import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Breadcrumb } from '../../components/breadcrumb/breadcrumb';
import { DashboardService } from '../../services/dashboard.service';
import { DashboardMetrics } from '../../models/dashboard.model';
import { RetourService } from '../../services/retour.service';
import { RetourProduit } from '../../models/retour.model';
import { AuthService } from '../../services/auth.service';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, Breadcrumb],
  template: `
    <div class="admin-page fade-in" id="dashboardContent" style="padding:32px; background-color: var(--bg-admin, #0f172a);">
      <app-breadcrumb></app-breadcrumb>
      
      <div class="page-header" data-html2canvas-ignore="false">
        <div style="display:flex; flex-direction:column; gap:6px;">
          <h1 class="page-title">{{ userRole === 'QUALITE' ? 'Dashboard Qualité' : "Rapport d'Activité" }}</h1>
          <div style="display:flex; align-items:center; gap:8px; color:var(--text-secondary); font-size:0.9rem;">
            <i class="ph ph-calendar-blank"></i>
            <span style="text-transform:capitalize;">{{ currentDate }}</span>
            <span style="color:rgba(255,255,255,0.2);">|</span>
            <span style="display:flex; align-items:center; gap:6px; color:#4ade80; font-weight: 500;">
              <span class="activity-dot green" style="width:8px;height:8px;margin:0;"></span> En direct
            </span>
          </div>
        </div>
        <button class="primary-btn" (click)="exportReport()" [disabled]="isExporting || retours.length === 0" data-html2canvas-ignore="true">
          <span *ngIf="!isExporting" style="display:flex;align-items:center;gap:8px;">
            <i class="ph ph-file-pdf"></i> Exporter en PDF
          </span>
          <span *ngIf="isExporting" style="display:flex;align-items:center;gap:8px;">
            <i class="ph ph-spinner spin-anim"></i> Génération...
          </span>
        </button>
      </div>

      <!-- Metrics Grid -->
      <div class="metrics-grid" *ngIf="metrics">
        <div class="metric-card" *ngIf="userRole !== 'QUALITE'">
          <div class="metric-icon blue"><i class="ph ph-package"></i></div>
          <div class="metric-content">
            <span class="metric-label">Total Produits</span>
            <span class="metric-value">{{ metrics.totalProduits }}</span>
          </div>
          <div class="metric-trend positive"><i class="ph ph-cube"></i> {{ metrics.totalStock }} en stock</div>
        </div>

        <div class="metric-card" *ngIf="userRole === 'QUALITE'">
          <div class="metric-icon blue" style="background:rgba(59,130,246,0.15);color:#3b82f6;"><i class="ph ph-warning-circle"></i></div>
          <div class="metric-content">
            <span class="metric-label">Incidents Qualité</span>
            <span class="metric-value">{{ metrics.totalHistorique }}</span>
          </div>
          <div class="metric-trend positive"><i class="ph ph-activity"></i> Suivi des anomalies</div>
        </div>
        
        <div class="metric-card">
          <div class="metric-icon orange"><i class="ph ph-arrow-u-up-left"></i></div>
          <div class="metric-content">
            <span class="metric-label">Retours en Attente</span>
            <span class="metric-value">{{ metrics.retoursEnAttente }}</span>
          </div>
          <div class="metric-trend negative"><i class="ph ph-clock"></i> Action requise</div>
        </div>
        
        <div class="metric-card">
          <div class="metric-icon green"><i class="ph ph-check-circle"></i></div>
          <div class="metric-content">
            <span class="metric-label">Retours Validés</span>
            <span class="metric-value">{{ metrics.retoursValides }}</span>
          </div>
          <div class="metric-trend neutral"><i class="ph ph-check"></i> Traités</div>
        </div>
        
        <div class="metric-card">
          <div class="metric-icon red" style="background:rgba(239,68,68,0.15);color:#ef4444;"><i class="ph ph-x-circle"></i></div>
          <div class="metric-content">
            <span class="metric-label">Retours Rejetés</span>
            <span class="metric-value">{{ metrics.retoursRejetes }}</span>
          </div>
          <div class="metric-trend neutral"><i class="ph ph-x"></i> Traités</div>
        </div>
        
        <div class="metric-card">
          <div class="metric-icon purple"><i class="ph ph-clock-clockwise"></i></div>
          <div class="metric-content">
            <span class="metric-label">Total Historique</span>
            <span class="metric-value">{{ metrics.totalHistorique }}</span>
          </div>
          <div class="metric-trend positive"><i class="ph ph-activity"></i> Actions tracées</div>
        </div>
      </div>

      <!-- Main Content Area Mockup -->
      <div class="dashboard-widgets">
        <div class="widget-card col-span-2">
          <div class="widget-header">
            <h3 class="widget-title">Évolution des retours (7 derniers jours)</h3>
          </div>
          <div class="widget-body" style="position:relative; height: 340px; padding: 24px;">
            <canvas #chartCanvas></canvas>
          </div>
        </div>
        
        <div class="widget-card">
          <div class="widget-header">
            <h3 class="widget-title"><i class="ph ph-clock-counter-clockwise" style="margin-right:8px;color:#fb923c;"></i>Derniers retours</h3>
          </div>
          <div class="widget-body">
            <div *ngIf="recentRetours.length === 0" class="empty-state" style="padding:20px;">
              <p>Aucun retour récent.</p>
            </div>
            <ul class="activity-list" *ngIf="recentRetours.length > 0">
              <li class="activity-item" *ngFor="let r of recentRetours">
                <span class="activity-dot" [ngClass]="getStatusColor(r.statut)"></span>
                <div class="activity-text">
                  <strong>{{ r.produit?.nom || 'Produit' }}</strong> - {{ r.statut }}
                  <span class="activity-time">{{ r.dateRetour | date:'dd/MM/yyyy à HH:mm' }}</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- New KPIs Row -->
      <div class="dashboard-widgets" style="margin-top: 24px;">
        <div class="widget-card">
          <div class="widget-header">
            <h3 class="widget-title"><i class="ph ph-chart-bar" style="margin-right:8px;color:#3b82f6;"></i>Top Produits Retournés</h3>
          </div>
          <div class="widget-body">
            <div *ngIf="topProduits.length === 0" class="empty-state" style="padding:20px;">
              <p>Aucune donnée disponible.</p>
            </div>
            <div class="top-list" *ngIf="topProduits.length > 0">
              <div class="top-item" *ngFor="let p of topProduits; let i = index">
                <div class="top-rank">{{ i + 1 }}</div>
                <div class="top-info">
                  <span class="top-name">{{ p.nom }}</span>
                  <div class="top-progress-bg">
                    <div class="top-progress-bar" [style.width.%]="(p.count / topProduits[0].count) * 100"></div>
                  </div>
                </div>
                <div class="top-count">{{ p.count }} retours</div>
              </div>
            </div>
          </div>
        </div>

        <div class="widget-card" *ngIf="userRole === 'ADMIN' || userRole === 'QUALITE'">
          <div class="widget-header">
            <h3 class="widget-title"><i class="ph ph-users-three" style="margin-right:8px;color:#22c55e;"></i>Clients les plus fréquents</h3>
          </div>
          <div class="widget-body">
            <div *ngIf="topClients.length === 0" class="empty-state" style="padding:20px;">
              <p>Aucune donnée disponible.</p>
            </div>
            <div class="top-list" *ngIf="topClients.length > 0">
              <div class="top-item" *ngFor="let c of topClients; let i = index">
                <div class="top-avatar" [style.background]="getAvatarColor(i)">{{ c.nom.charAt(0).toUpperCase() }}</div>
                <div class="top-info">
                  <span class="top-name">{{ c.nom }}</span>
                  <span class="top-subtext">Client régulier</span>
                </div>
                <div class="top-count">{{ c.count }} retours</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes spin { 100% { transform: rotate(360deg); } }
    .spin-anim { animation: spin 1s linear infinite; }

    .top-list { display: flex; flex-direction: column; gap: 16px; padding: 12px; }
    .top-item { display: flex; align-items: center; gap: 16px; }
    .top-rank { width: 28px; height: 28px; border-radius: 50%; background: rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.8rem; color: var(--text-secondary); }
    .top-avatar { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 1.1rem; }
    .top-info { flex: 1; display: flex; flex-direction: column; gap: 4px; }
    .top-name { font-weight: 600; color: var(--text-primary); font-size: 0.95rem; }
    .top-subtext { font-size: 0.75rem; color: var(--text-secondary); }
    .top-count { font-weight: bold; color: #3b82f6; font-size: 0.9rem; white-space: nowrap; }
    
    .top-progress-bg { height: 6px; background: rgba(255,255,255,0.05); border-radius: 3px; overflow: hidden; margin-top: 4px; }
    .top-progress-bar { height: 100%; background: linear-gradient(90deg, #3b82f6, #60a5fa); border-radius: 3px; transition: width 1s ease-out; }

    .activity-list { list-style: none; padding: 0; margin: 0; }
    .activity-item { display: flex; align-items: flex-start; gap: 12px; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
    .activity-item:last-child { border-bottom: none; }
    .activity-dot { width: 10px; height: 10px; border-radius: 50%; margin-top: 6px; flex-shrink: 0; }
    .activity-dot.green { background: #22c55e; }
    .activity-dot.orange { background: #f59e0b; }
    .activity-dot.red { background: #ef4444; }
    .activity-dot.blue { background: #3b82f6; }
    .activity-text { font-size: 0.87rem; color: var(--text-primary); flex: 1; }
    .activity-time { display: block; font-size: 0.75rem; color: var(--text-secondary); margin-top: 4px; }
  `],
  styleUrls: ['../admin-shared.css']
})
export class Dashboard implements OnInit, AfterViewInit {
  metrics: DashboardMetrics | null = null;
  retours: RetourProduit[] = [];
  recentRetours: RetourProduit[] = [];
  topProduits: {nom: string, count: number}[] = [];
  topClients: {nom: string, count: number}[] = [];
  currentDate = new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  
  @ViewChild('chartCanvas') chartCanvas!: ElementRef;
  chart: Chart | null = null;
  viewReady = false;
  isExporting = false;
  userRole = '';

  constructor(
    private dashboardService: DashboardService,
    private retourService: RetourService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    if (this.authService.currentUser) {
      this.userRole = (this.authService.currentUser.role || '').trim().toUpperCase();
    }
    this.authService.currentUser$.subscribe(u => {
      if (u) this.userRole = (u.role || '').trim().toUpperCase();
    });

    this.dashboardService.getMetrics().subscribe({
      next: (data) => this.metrics = data,
      error: (err) => console.error('Erreur metrics', err)
    });

    this.retourService.getRetours().subscribe({
      next: (data) => {
        this.retours = data;
        
        if (this.metrics) {
          this.metrics.retoursEnAttente = data.filter(r => { const s = (r.statut||'').toUpperCase(); return s.includes('ATTENTE') || s.includes('PENDING'); }).length;
          this.metrics.retoursValides   = data.filter(r => { const s = (r.statut||'').toUpperCase(); return s.includes('VALID'); }).length;
        }

        this.recentRetours = [...data]
          .sort((a,b) => new Date(b.dateRetour || 0).getTime() - new Date(a.dateRetour || 0).getTime())
          .slice(0, 5);

        this.computeTops(data);
        this.tryRenderChart();
      },
      error: (err) => console.error('Erreur retours', err)
    });
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.tryRenderChart();
  }

  getStatusColor(statut: string): string {
    const s = (statut || '').toUpperCase();
    if (s.includes('VALID')) return 'green';
    if (s.includes('REJET') || s.includes('REFUS')) return 'red';
    if (s.includes('ATTENTE') || s.includes('PENDING')) return 'orange';
    return 'blue';
  }

  tryRenderChart(): void {
    if (!this.viewReady || this.retours.length === 0 || !this.chartCanvas) return;

    const dates = [];
    const counts = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      dates.push(dateStr);
      
      const count = this.retours.filter(r => (r.dateRetour || '').startsWith(dateStr)).length;
      counts.push(count);
    }

    const labels = dates.map(d => {
      const parts = d.split('-'); 
      return parts[2] + '/' + parts[1];
    });

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.35)'); 
    gradient.addColorStop(1, 'rgba(59, 130, 246, 0.0)');  

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Retours signalés',
          data: counts,
          borderColor: '#3b82f6',
          backgroundColor: gradient,
          borderWidth: 3,
          pointBackgroundColor: '#1e293b',
          pointBorderColor: '#3b82f6',
          pointBorderWidth: 2.5,
          pointRadius: 4,
          pointHoverRadius: 6,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            titleColor: '#f8fafc',
            bodyColor: '#cbd5e1',
            padding: 12,
            boxPadding: 4,
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
            bodyFont: { family: 'Inter', size: 13 },
            titleFont: { family: 'Inter', size: 14, weight: 'bold' }
          }
        },
        scales: {
          x: {
            grid: { display: false, drawOnChartArea: false },
            ticks: { color: '#94a3b8', font: { family: 'Inter', size: 12 } }
          },
          y: {
            beginAtZero: true,
            suggestedMax: Math.max(...counts, 4) + 1,
            grid: { color: 'rgba(148, 163, 184, 0.1)', tickLength: 0 },
            border: { dash: [5, 5] },
            ticks: { color: '#94a3b8', stepSize: 1, font: { family: 'Inter', size: 12 } }
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        }
      }
    });
  }

  exportReport(): void {
    if (this.retours.length === 0 || this.isExporting) return;
    this.isExporting = true;

    const element = document.getElementById('dashboardContent');
    if (!element) {
      this.isExporting = false;
      return;
    }

    html2canvas(element, { 
      scale: 2,
      backgroundColor: '#0f172a',
      useCORS: true
    }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Rapport_Dashboard_${new Date().toISOString().split('T')[0]}.pdf`);
      
      this.isExporting = false;
    }).catch(err => {
      console.error('Erreur lors de la création du PDF :', err);
      this.isExporting = false;
    });
  }

  computeTops(data: RetourProduit[]): void {
    const prodMap = new Map<string, number>();
    const clientMap = new Map<string, number>();

    data.forEach(r => {
      const pNom = r.produit?.nom || 'Produit inconnu';
      prodMap.set(pNom, (prodMap.get(pNom) || 0) + 1);

      const cNom = r.client?.nom || (r as any).utilisateur?.nom || 'Client inconnu';
      clientMap.set(cNom, (clientMap.get(cNom) || 0) + 1);
    });

    this.topProduits = Array.from(prodMap.entries())
      .map(([nom, count]) => ({ nom, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    this.topClients = Array.from(clientMap.entries())
      .map(([nom, count]) => ({ nom, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  getAvatarColor(index: number): string {
    const colors = ['#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ef4444'];
    return colors[index % colors.length];
  }
}
