import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { JwtHelperService } from "@auth0/angular-jwt";
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from 'src/environment'
const jwtHelper = new JwtHelperService();

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  private isLoggedInSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  loginStatus: Observable<boolean> = this.isLoggedInSubject.asObservable();
  private userPayload: any;

  private baseUrl:string = environment.apiUrl;
  constructor(
    private http: HttpClient,
    private router: Router) { 
      this.userPayload = this.decodeToken();
      this.isLoggedInSubject.next(this.isLoggedIn());
    }

  signUp(userObject:any): Observable<any>{
    return this.http.post<any>(`${this.baseUrl}User/register`,userObject);
  }

  login(loginObject:any) {
    return this.http.post<any>(`${this.baseUrl}User/authenticate`, loginObject)
    .pipe(
      tap(response => {
        this.storeToken(response.token);
        this.isLoggedInSubject.next(true);
      })
    );
  }

  updateProfile(userObject:any) {
    return this.http.put<any>(`${this.baseUrl}User/update-profile`, userObject);
  }

  logout(){
    localStorage.clear();
    this.isLoggedInSubject.next(false);
    this.router.navigate(['login']);
  }

  storeToken(tokenValue:string){
    localStorage.setItem('token', tokenValue);
    this.userPayload = this.decodeToken();
  }

  getToken(){
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean{
    return !!localStorage.getItem('token');
  }

  decodeToken() {
    const token = this.getToken()!;
    return jwtHelper.decodeToken(token);
  }

  getFirstNameFromToken() {
    if (this.userPayload)
    return this.userPayload.FirstName;
  }

  getLastNameFromToken() {
    if (this.userPayload)
    return this.userPayload.LastName;
  }

  getRoleFromToken() {
    if (this.userPayload)
    return this.userPayload.role;
  }

  getUsernameFromToken() {
    if (this.userPayload)
    return this.userPayload.name;
  }
}
