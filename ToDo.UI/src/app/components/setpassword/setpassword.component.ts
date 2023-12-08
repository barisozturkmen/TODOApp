import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import ValidateForm from 'src/app/helpers/validateForm';
import { SetPassword } from 'src/app/models/set-password.model';
import { SetPasswordService } from 'src/app/services/set-password.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-setpassword',
  templateUrl: './setpassword.component.html',
  styleUrls: ['./setpassword.component.css']
})
export class SetPasswordComponent implements OnInit {
  passwordInputType: string = "password"
  isText: boolean = false;
  eyeIcon: string = "fa-eye-slash";
  setPasswordForm!: FormGroup;
  emailToReset!: string;
  emailToken!: string;
  setPasswordObject = new SetPassword();

  constructor(
    private fb: FormBuilder, 
    private activatedRoute: ActivatedRoute,
    private setPasswordService: SetPasswordService,
    private toastr: ToastrService,
    private router: Router) { }
  
  ngOnInit(): void {
    this.setPasswordForm = this.fb.group({
      password: [null, Validators.required]
    })

    this.activatedRoute.queryParams.subscribe(val=> {
      this.emailToReset = val['email'];
      let uriToken = val['code'];
      this.emailToken = uriToken.replace(/ /g,'+');
    });
  };

  hideShowPassword() {
    this.isText = !this.isText;
    this.isText ? this.eyeIcon = "fa-eye" : this.eyeIcon = "fa-eye-slash";
    this.isText ? this.passwordInputType = "text" : this.passwordInputType = "password";
  };

  setNewPassword() {
    if(this.setPasswordForm.valid)
    {
      this.setPasswordObject.email = this.emailToReset;
      this.setPasswordObject.newPassword = this.setPasswordForm.value.password;
      this.setPasswordObject.emailToken = this.emailToken
      this.setPasswordService.setPassword(this.setPasswordObject)
      .subscribe({
        next:(res) => {
          this.toastr.success(res.message, "", { timeOut: 5000, });
          this.setPasswordForm.reset();
          this.router.navigate(['login']);
        },
        error:(err) => {
          this.toastr.error(err?.error?.message, "", { timeOut: 5000, });
        }
      })
    }
    else
    {
      ValidateForm.validateAllFields(this.setPasswordForm);
    }
  };
}
