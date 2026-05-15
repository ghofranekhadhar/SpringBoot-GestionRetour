import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  date: Date;
  isRead: boolean;
  route?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications: Notification[] = [];
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);

  constructor() {
    // Charger depuis le localStorage pour la persistance session
    const saved = localStorage.getItem('notifications');
    if (saved) {
      this.notifications = JSON.parse(saved).map((n: any) => ({
        ...n,
        date: new Date(n.date)
      }));
      this.notificationsSubject.next(this.notifications);
    }
  }

  getNotifications(): Observable<Notification[]> {
    return this.notificationsSubject.asObservable();
  }

  get unreadCount(): number {
    return this.notifications.filter(n => !n.isRead).length;
  }

  addNotification(notif: Omit<Notification, 'id' | 'date' | 'isRead'>): void {
    const newNotif: Notification = {
      ...notif,
      id: Date.now(),
      date: new Date(),
      isRead: false
    };
    this.notifications = [newNotif, ...this.notifications].slice(0, 50); // Garder les 50 dernières
    this.saveAndPublish();
  }

  markAsRead(id: number): void {
    const n = this.notifications.find(item => item.id === id);
    if (n) {
      n.isRead = true;
      this.saveAndPublish();
    }
  }

  markAllAsRead(): void {
    this.notifications.forEach(n => n.isRead = true);
    this.saveAndPublish();
  }

  clearAll(): void {
    this.notifications = [];
    this.saveAndPublish();
  }

  private saveAndPublish(): void {
    localStorage.setItem('notifications', JSON.stringify(this.notifications));
    this.notificationsSubject.next(this.notifications);
  }
}
