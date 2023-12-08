import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Observable } from 'rxjs';
import { NotificationService } from './services/notification.service';

@Component({ selector: 'app-root', templateUrl: 'app.component.html' })
export class AppComponent implements OnInit { 
    isLoggedIn$: Observable<boolean>;
    constructor(
      private authService: AuthService,
      private notifications: NotificationService) {
      this.isLoggedIn$ = this.authService.loginStatus;
    }

    ngOnInit() {
      this.notifications.startConnection();
    }
}