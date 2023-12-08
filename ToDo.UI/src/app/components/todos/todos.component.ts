import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Todo } from 'src/app/models/todo.model';
import { TodoService } from 'src/app/services/todo.service';
import { ToastrService } from 'ngx-toastr';
import { UserStoreService } from 'src/app/services/user-store.service';
import { Subscription } from 'rxjs';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-todos',
  templateUrl: './todos.component.html',
  styleUrls: ['./todos.component.css'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class TodosComponent implements OnInit {
  private notificationSubscription!: Subscription;
  todos: Todo[] = [];
  newTodo: Todo = {
    id: null,
    createdByUserId: null,
    createdByUsername: "",
    name: "",
    description: "",
    isCompleted: false,
    completionDate: null
  }
  private roleSubscription!: Subscription;
  todoTitle: string = "My todos";

  constructor(
    private todoService: TodoService,
    private toastr: ToastrService,
    private userStore: UserStoreService,
    private notifications: NotificationService,
    private changeDetector: ChangeDetectorRef) { }

  ngOnInit():void {
    this.getTodos();

    this.roleSubscription = this.userStore.getRole().subscribe(role => {
      if (role === "Admin") {
        this.todoTitle = "All todos";
        return;
      }
      this.todoTitle = "My todos";
    });

    this.notificationSubscription = this.notifications.notifyTodos.subscribe((value) => {
      if (value) {
        this.getTodos();
      }
    });
  }

  getTodos() {
    this.todoService.getTodos()
    .subscribe({
      next:(todos) => {
        this.todos = [...todos];
        this.changeDetector.detectChanges();
      },
      error:(err) => {
        this.toastr.error(err?.error.message, "", { timeOut: 5000, });
      }
    })
  }

  addTodo(){
    this.todoService.addTodo(this.newTodo)
    .subscribe({
      next:(res)=> {
        this.getTodos();
        this.toastr.success(res.message, "", { timeOut: 5000, });
      },
      error:(err)=> {
        this.toastr.error(err?.error.message, "", { timeOut: 5000, });
      }
    })
  }

  onCompleted(todo: Todo) {
    todo.isCompleted = !todo.isCompleted;
    this.todoService.updateTodo(todo)
    .subscribe({
      next:(res)=> {
        this.getTodos();
        this.toastr.success(res.message, "", { timeOut: 5000, });
        this.notifications.sendNotification('Todo marked as complete');
      },
      error:(err)=> {
        this.toastr.error(err?.error.message, "", { timeOut: 5000, });
      }
    })
  }

  getLocalTime(date: Date | null) {
    let localDate = "";
    if (date !== null && date !== undefined)
    {
      localDate = new Date(date + 'Z').toString();
    }

    return localDate;
  }
}
