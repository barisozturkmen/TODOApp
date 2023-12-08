import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { User } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { ImageUploadService } from 'src/app/services/image-upload.service';
import { UserStoreService } from 'src/app/services/user-store.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  editProfileForm!: FormGroup;
  modalDisplay = "none";
  public firstName = "";
  public lastName = "";

  constructor(
    private authService: AuthService,
    private userStore: UserStoreService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private imageService: ImageUploadService){}

  ngOnInit() {

    this.editProfileForm = this.fb.group
    ({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      profileImage: File
    })

    this.userStore.getFirstName()
    .subscribe(val => {
      const firstNameFromToken = this.authService.getFirstNameFromToken();
      this.firstName = val || firstNameFromToken;
      this.editProfileForm.patchValue({ firstName: this.firstName });
    });

    this.userStore.getLastName()
    .subscribe(val => {
      const lastNameFromToken = this.authService.getLastNameFromToken();
      this.lastName = val || lastNameFromToken;
      this.editProfileForm.patchValue({ lastName: this.lastName });
    });

    this.editProfileForm.patchValue({ profileImage: this.getProfileImage() });
  };

  getProfileImage() {
    return this.userStore.getProfilePicture();
  }

  logout() {
    this.authService.logout();
  }

  openModal() {
    this.modalDisplay = "block";
  }

  closeModal() {
    this.modalDisplay = "none";
    this.editProfileForm.patchValue({ firstName: this.firstName})
    this.editProfileForm.patchValue({ lastName: this.lastName})
    this.editProfileForm.patchValue({ profileImage: this.getProfileImage() });
  }

  confirmChanges() {
    if (this.editProfileForm.valid) {
      const user: User = {
        FirstName: this.editProfileForm.value.firstName,
        LastName: this.editProfileForm.value.lastName,
        Email: '',
        Username: '',
        ProfileImage: this.editProfileForm.value.profileImage,
      };
      this.authService.updateProfile(user)
      .subscribe({
        next:(res=> {
          this.toastr.success(res.message, "", { timeOut: 5000, });
          this.authService.storeToken(res.token)
          const tokenPayload = this.authService.decodeToken();
          this.userStore.setFirstName(tokenPayload.firstName);
          this.userStore.setLastName(tokenPayload.lastName);
          this.userStore.setProfilePicture(res.profileImage);
          this.closeModal();
        }),
        error:(err=> {
          this.toastr.error(err?.error.message, "", { timeOut: 5000, });
        })
      })
    }
  }

  uploadImage(imageInput: any) {
    this.imageService.uploadImage(imageInput, this.editProfileForm);
  }
}
