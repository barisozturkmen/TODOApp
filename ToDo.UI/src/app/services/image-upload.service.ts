import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})

export class ImageUploadService {
  uploadImage(imageInput: any, formGroup: FormGroup) {
    const file: File = imageInput.files[0];
    if (file == null)
      return;
    const reader = new FileReader();
    reader.addEventListener('load', (event: any) => {
      formGroup.patchValue({
        profileImage: event.target.result as string
      });
    });

    reader.readAsDataURL(file);
  }
}