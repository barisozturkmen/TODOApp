import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { TokenInterceptor } from './interceptors/token.interceptor';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SetPasswordComponent } from './components/setpassword/setpassword.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { TodosComponent } from './components/todos/todos.component';

@NgModule({
    imports: [
        BrowserModule,
        AppRoutingModule,
        ReactiveFormsModule,
        HttpClientModule,
        FormsModule,
        BrowserAnimationsModule,
        ToastrModule.forRoot({
            positionClass: 'toast-top-right'
        })
    ],
    declarations: [
        AppComponent,
        LoginComponent,
        SignupComponent,
        SetPasswordComponent,
        NavbarComponent,
        TodosComponent,
    ],
    providers: [{
        provide:HTTP_INTERCEPTORS,
        useClass:TokenInterceptor,
        multi:true
    }],
    bootstrap: [AppComponent]
})
export class AppModule { }