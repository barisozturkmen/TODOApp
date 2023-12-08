import { Injectable, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import * as signalR from '@microsoft/signalR';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from './auth.service';
import { TodoService } from './todo.service';
import { environment } from 'src/environment'

@Injectable({
  providedIn: 'root',
})

export class NotificationService implements OnInit {
  private notificationSubject = new Subject<string>();
  public notifyTodos = new Subject<boolean>();

  constructor(
    private authService: AuthService,
    private toastr: ToastrService,
    private todoService: TodoService) { }

  hubConnection!:signalR.HubConnection;

  ngOnInit(): void {

  }

  startConnection = () => {
    this.hubConnection = new signalR.HubConnectionBuilder()
    .withUrl(environment.toastrURL)
    .withAutomaticReconnect()
    .build();

  this.hubConnection
  .start()
  .then(() => {
    this.getNotification();
  })
  .catch(err => console.log('Connection problem'));
  }

  sendNotification(message: string) {
    this.notificationSubject.next(message);
  }

  getNotification() {
    this.hubConnection.on("ReceiveNotification", (res) => {
      if (this.authService.getUsernameFromToken() === res.username) //Hide unnecessary notification
      {
        return;
      }

      this.todoService.getTodos().subscribe(() => {
        this.notifyTodos.next(true);
      });

      this.toastr.success(res.message, "", { timeOut: 5000, });
    });
  }
}