import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-new-user',
  templateUrl: './new-user.component.html',
  styleUrls: ['./new-user.component.css']
})
export class NewUserComponent implements OnInit {
  btnTitle = 'Fill gaps to create new user.';

  userName = '';
  userEmail = '';
  selectedImages: [File];

  constructor(private apiService: ApiService) { }

  ngOnInit() {
    this.btnTitle = 'Add btn';
  }

  onFileChanged(event) {
    this.btnTitle = 'Add btn';
    this.selectedImages = event.target.files;
  }

  addNewUser() {
    this.btnTitle = 'Creating new user';
    this.apiService.addNewUser(this.userEmail, this.userName, this.selectedImages).subscribe(event => {
        this.btnTitle = 'Uploading images';
    });
  }

}
