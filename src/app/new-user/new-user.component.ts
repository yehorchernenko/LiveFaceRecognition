import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { User } from '../user';
import { AlertsService } from 'angular-alert-module';

@Component({
  selector: 'app-new-user',
  templateUrl: './new-user.component.html',
  styleUrls: ['./new-user.component.css']
})
export class NewUserComponent implements OnInit {
  message = '';
  model = new User('', '');

  constructor(private apiService: ApiService, private alerts: AlertsService) { }

  ngOnInit() {
  }

  onSubmit() {
    this.message = 'Creating new user...';
    this.apiService.addNewUser(this.model).subscribe(res => {
      this.message = res;
      this.alerts.setMessage(`New user successfully created`, 'success');
      this.model = new User('', '');
    }, error => {
      this.message = error;
      this.alerts.setMessage(`Error occurred ${error}`, 'error');
      this.model = new User('', '');
    });
  }

  onImagesChanged(event) {
    this.model.images = event.target.files;
  }

  get diagnostic() { return JSON.stringify(this.model); }
}
