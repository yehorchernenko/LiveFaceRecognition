import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { LocalStorage } from '@ngx-pwa/local-storage';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-login',
  templateUrl: './user-login.component.html',
  styleUrls: ['./user-login.component.css']
})
export class UserLoginComponent implements OnInit {
  email = '';
  password = '';

  constructor(private api: ApiService, protected localStorage: LocalStorage, private router: Router) {}

  ngOnInit() {
    this.localStorage.getItem('user').subscribe((user: string) => {
      if (user) {
        const userObj = JSON.parse(user);

        this.api.userLogin(userObj.email, userObj.password).subscribe(response => {
          if (response.status === 200) {
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
    this.api.userLogin(this.email, this.password).subscribe(response => {
      console.log(response);
      if (response.status === 200) {
        this.localStorage.setItem('user', JSON.stringify({email: this.email, password: this.password})).subscribe(() => {});
        this.router.navigate(['/admin']);
      }

    }, error => {
      console.log(`Error ${error}`);
    });
  }

  get diagnostic() { return JSON.stringify({email: this.email, password: this.password}); }

}
