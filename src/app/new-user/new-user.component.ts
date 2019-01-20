import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { User } from '../user';
import { AlertService } from 'ngx-alerts';
import {LocalStorage} from '@ngx-pwa/local-storage';
import {Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-new-user',
  templateUrl: './new-user.component.html',
  styleUrls: ['./new-user.component.css']
})
export class NewUserComponent implements OnInit {
  model = new User('', '');

  constructor(private apiService: ApiService, private alerts: AlertService, protected localStorage: LocalStorage, private router: Router, private translate: TranslateService) { }

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
        this.alerts.success('User created successfully');
      } else {
        this.alerts.warning('User creation failure');
      }

    }, error => {
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
