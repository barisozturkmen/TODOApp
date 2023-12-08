import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import EmailValidator from 'src/app/helpers/emailValidator';
import ValidateForm from 'src/app/helpers/validateForm';
import { AuthService } from 'src/app/services/auth.service';
import { ImageUploadService } from 'src/app/services/image-upload.service';
import { SetPasswordService } from 'src/app/services/set-password.service';
import { UserStoreService } from 'src/app/services/user-store.service';

@Component({
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {
  signUpForm!: FormGroup;
  constructor(
    private fb: FormBuilder, 
    private authService: AuthService, 
    private router: Router,
    private toastr: ToastrService,
    private setPasswordService: SetPasswordService,
    private imageService: ImageUploadService,
    private userStore: UserStoreService) { }

  ngOnInit(): void
  {
    this.signUpForm = this.fb.group
    ({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      userName: ['', Validators.required],
      email: ['', Validators.required],
      profileImage: File
    })

    this.signUpForm.patchValue({ profileImage: this.getProfileImage() })
  }

  getProfileImage() {
    return this.userStore.getProfilePicture();
  }
  uploadImage(imageInput: any) {
    this.imageService.uploadImage(imageInput, this.signUpForm);
  }

  onSignUp()
  {
    if(!EmailValidator.checkValidEmail(this.signUpForm.value.email))
    {
      this.toastr.error(`${this.signUpForm.value.email} is not a valid email address.`);
    }
    else if(this.signUpForm.valid)
    {
      this.authService.signUp(this.signUpForm.value)
      .subscribe({
        next:(res=>{
          this.toastr.success(res.message, "", { timeOut: 5000, });
          this.setPasswordService.sendSetPasswordLink(this.signUpForm.value.email)
          .subscribe({
            next:(res) => {
              this.toastr.success(res.message, "", { timeOut: 5000, });
            },
            error:(err) => {
              this.toastr.error(err?.error.message, "", { timeOut: 5000, });
            }
          });
          this.signUpForm.reset();
          this.router.navigate(['login']);
        }),
        error:(err=>{
          this.toastr.error(err?.error.message, "", { timeOut: 5000, });
        })
      })
    }
    else
    {
      ValidateForm.validateAllFields(this.signUpForm);
      this.toastr.error("Form is invalid.", "", { timeOut: 5000, });
    }
  }

}
