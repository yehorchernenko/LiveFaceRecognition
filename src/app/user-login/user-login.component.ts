import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-user-login',
  templateUrl: './user-login.component.html',
  styleUrls: ['./user-login.component.css']
})
export class UserLoginComponent implements OnInit {
  email = '';
  password = '';

  constructor(private api: ApiService) {}

  ngOnInit() {}

  onSubmit() {
    this.api.userLogin(this.email, this.password).subscribe(response => {
      console.log(response.status);
    }, error => {
      console.log(`Error ${error}`);
    });
  }

  get diagnostic() { return JSON.stringify({email: this.email, password: this.password}); }

}
