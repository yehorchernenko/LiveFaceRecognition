import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { User } from '../user';
import { AlertsService } from 'angular-alert-module';
import {LocalStorage} from '@ngx-pwa/local-storage';
import {Router} from '@angular/router';

@Component({
  selector: 'app-new-user',
  templateUrl: './new-user.component.html',
  styleUrls: ['./new-user.component.css']
})
export class NewUserComponent implements OnInit {
  model = new User('', '');

  constructor(private apiService: ApiService, private alerts: AlertsService, protected localStorage: LocalStorage, private router: Router) { }

  ngOnInit() {
    this.localStorage.getItem('admin').subscribe((admin: string) => {
      if (!admin) {
        console.log(`Local storage error user is null`);
        this.router.navigate(['/admin/login']);
      }
    }, error => {
      console.log(`Local storage error ${error}`);
      this.router.navigate(['/admin/login']);
    });
  }

  onSubmit() {

    this.apiService.addNewUser(this.model).subscribe(res => {
      this.model = new User(' ', ' ');
      if (res.status === 200) {
        this.alerts.setMessage(`New user successfully created`, 'success');

      } else {
        this.alerts.setMessage(`Error occurred negative status code`, 'error');
      }

    }, error => {
      this.alerts.setMessage(`Error occurred ${error}`, 'error');
      this.model = new User(' ', ' ');
    });
  }

  onImagesChanged(event) {
    this.model.images = event.target.files;
  }

  get diagnostic() { return JSON.stringify(this.model); }

  logout() {
    this.localStorage.removeItem('admin').subscribe(() => {
      this.router.navigate(['/admin/login']);
    });
  }
}
