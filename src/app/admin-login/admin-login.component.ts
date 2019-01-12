import { Component, OnInit } from '@angular/core';
import {LocalStorage} from '@ngx-pwa/local-storage';
import {ApiService} from '../api.service';
import {Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.css']
})
export class AdminLoginComponent implements OnInit {
  login = '';
  password = '';

  constructor(private api: ApiService, protected localStorage: LocalStorage, private router: Router, private translate: TranslateService) {}

  ngOnInit() {
    this.localStorage.getItem('admin').subscribe((admin: string) => {
      if (admin) {
        const userObj = JSON.parse(admin);

        this.api.adminLogin(userObj.login, userObj.password).subscribe(response => {
          if (response.status === 200) {
            console.log('FUCK YOU');
            this.router.navigate(['/admin']);
          }
        }, error => {
          console.log(`Error ${error}`);
        });
      } else {
        console.log(`Local storage error user is null`);
      }
    }, error => {
      console.log(`Local storage error ${error}`);
    });
  }

  onSubmit() {
    this.api.adminLogin(this.login, this.password).subscribe(response => {
      console.log(response);
      if (response.status === 200) {
        this.localStorage.setItem('admin', JSON.stringify({login: this.login, password: this.password})).subscribe(() => {});
        console.log('FUCK YOU 2');
        this.router.navigate(['/admin']);
      }

    }, error => {
      console.log(`Error ${JSON.stringify(error)}`);
    });
  }

  get diagnostic() { return JSON.stringify({email: this.login, password: this.password}); }
}
