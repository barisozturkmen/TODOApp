import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Todo } from '../models/todo.model';
import { environment } from 'src/environment'

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  private baseUrl:string = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getTodos(): Observable<Todo[]> {
    return this.http.get<Todo[]>(`${this.baseUrl}ToDo/get-todos`);
  }

  addTodo(newTodo:any): Observable<any> {
    return this.http.post<Todo>(`${this.baseUrl}ToDo/add-todo`, newTodo);
  }

  updateTodo(todo: Todo): Observable<any> {
    return this.http.put<Todo>(`${this.baseUrl}ToDo/update-todo`, todo);
  }
}
