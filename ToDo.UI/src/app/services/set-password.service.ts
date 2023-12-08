import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SetPassword } from '../models/set-password.model';
import { environment } from 'src/environment'

@Injectable({
  providedIn: 'root'
})
export class SetPasswordService {
  private baseUrl: string = environment.apiUrl;
  constructor(private http: HttpClient) { }

  sendSetPasswordLink(emailAddress: string) {
    return this.http.post<any>(`${this.baseUrl}User/send-password-link/${emailAddress}`, {});
  }

  setPassword(setPasswordObject: SetPassword) {
    return this.http.post<any>(`${this.baseUrl}User/set-password`, setPasswordObject);
  }
}
