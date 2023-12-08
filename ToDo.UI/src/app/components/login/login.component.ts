import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import ValidateForm from 'src/app/helpers/validateForm';
import { AuthService } from 'src/app/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { UserStoreService } from 'src/app/services/user-store.service';
import { SetPasswordService } from 'src/app/services/set-password.service';
import EmailValidator from 'src/app/helpers/emailValidator';

@Component({
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  modalDisplay = "none";
  passwordInputType: string = "password"
  isText: boolean = false;
  eyeIcon: string = "fa-eye-slash";
  loginForm!: FormGroup;
  public setPasswordEmail!: string;
  public isValidEmail!: boolean;
  constructor
  (
    private fb: FormBuilder, 
    private auth: AuthService, 
    private router: Router,
    private toastr: ToastrService,
    private userStore: UserStoreService,
    private setPasswordService: SetPasswordService
  ) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    })
  }

  hideShowPassword(){
    this.isText = !this.isText;
    this.isText ? this.eyeIcon = "fa-eye" : this.eyeIcon = "fa-eye-slash";
    this.isText ? this.passwordInputType = "text" : this.passwordInputType = "password";
  }

  onLogin(){
    if(this.loginForm.valid){
      this.auth.login(this.loginForm.value).subscribe({
        next:(res)=>{
          this.toastr.success(res.message, "", { timeOut: 5000, });
          this.loginForm.reset();
          this.auth.storeToken(res.token);
          const tokenPayload = this.auth.decodeToken();
          this.userStore.setFirstName(tokenPayload.firstName);
          this.userStore.setLastName(tokenPayload.lastName);
          this.userStore.setRole(tokenPayload.role);
          this.userStore.setProfilePicture(res.profileImage);
          this.router.navigate(['todos']);
        },
        error:(err)=> {
            this.toastr.error(err?.error.message, "", { timeOut: 5000, });
        }
      });
    }
    else{
      ValidateForm.validateAllFields(this.loginForm);

      this.toastr.error("Form is invalid.", "Invalid Form", { timeOut: 5000, });
    }
  }

  openModal(){
    this.modalDisplay = "block";
  }

  closeModal(){
    this.modalDisplay = "none";
  }

  checkValidEmail(event: string){
    this.isValidEmail = EmailValidator.checkValidEmail(event);
  }

  confirmAndSendReset(){
    if (this.isValidEmail)
    {
      this.setPasswordService.sendSetPasswordLink(this.setPasswordEmail)
      .subscribe({
        next:(res)=> {
          this.setPasswordEmail = "";
          this.closeModal();
          this.toastr.success(res.message, "", { timeOut: 5000, });
        },
        error:(err)=> {
          this.toastr.error(err?.error.message, "", { timeOut: 5000, });
        }
      })
    }
  }
}
