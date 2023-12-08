import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { authGuard } from './guards/auth.guard';
import { SetPasswordComponent } from './components/setpassword/setpassword.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { TodosComponent } from './components/todos/todos.component';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';

const routes: Routes = [
    {path: '', redirectTo: '/login', pathMatch: 'full' },
    {path:'login', component: LoginComponent},
    {path:'signup', component: SignupComponent},
    {path:'navbar', component: NavbarComponent},
    {path:'set-password', component: SetPasswordComponent},
    {path:'todos', component: TodosComponent, canActivate: [authGuard]}
    
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
    providers: [{ provide: LocationStrategy, useClass: HashLocationStrategy }]
})
export class AppRoutingModule { }