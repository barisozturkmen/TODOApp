import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserStoreService {
  private firstName$ = new BehaviorSubject<string>("");
  private lastName$ = new BehaviorSubject<string>("");
  private role$ = new BehaviorSubject<string>("");

  constructor() { }

  public getRole() {
    return this.role$.asObservable();
  }

  public setRole(role: string) {
    this.role$.next(role);
  }

  public getFirstName() {
    return this.firstName$.asObservable();
  }

  public setFirstName(firstName: string) {
    this.firstName$.next(firstName);
  }

  public getLastName() {
    return this.lastName$.asObservable();
  }

  public setLastName(lastName: string) {
    this.lastName$.next(lastName);
  }

  public getProfilePicture() {
    const storedValue = localStorage.getItem('profilePicture');
    if (storedValue !== null && storedValue !== 'null' && storedValue !== "") {
      return storedValue;
    }

    return "./assets/images/blank-profile.png";
  }

  public setProfilePicture(profilePicture: string) {
    localStorage.setItem('profilePicture', profilePicture)
  }
}
