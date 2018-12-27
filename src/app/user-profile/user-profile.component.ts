import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { LocalStorage } from '@ngx-pwa/local-storage';
import { Router } from '@angular/router';
import {Visitor} from '../visitor';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {

  visitor = null;

  constructor(private api: ApiService, protected localStorage: LocalStorage, private router: Router) {}


  ngOnInit() {
    this.localStorage.getItem('user').subscribe((user: string) => {
      if (user) {
        const userObj = JSON.parse(user);

        this.api.userProfile(userObj.email, userObj.password).subscribe(response => {
          const visitor = response.body;
          const lastVisit = new Date(visitor.lastVisit);
          this.visitor =  new Visitor(
            visitor.name, visitor.email, visitor.isPresent, visitor.presentTime, this.msToTime(visitor.presentTime),
            visitor.lastVisit, `${lastVisit.getDate()}-${lastVisit.getMonth()}-${lastVisit.getFullYear()} ${lastVisit.getHours()}:${lastVisit.getMinutes()}`);
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

  msToTime(duration) {
    let minutes = Math.floor((duration / (1000 * 60)) % 60);
    let hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

    let h = (hours < 10) ? `0${hours}` : `${hours}`;
    let m = (minutes < 10) ? `0${minutes}` : `${minutes}`;

    return h + ':' + m;
  }

  logout() {
    this.localStorage.removeItem('user').subscribe(() => {
      this.router.navigate(['/']);
    });
  }
}
