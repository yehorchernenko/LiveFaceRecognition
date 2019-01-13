import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { LocalStorage } from '@ngx-pwa/local-storage';
import { Router } from '@angular/router';
import {Visitor} from '../visitor';
import {TranslateService} from '@ngx-translate/core';
import {VisitHistory} from '../visit-history';
import {Period} from '../period.enum';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  period = Period.all;
  visitor = null;

  constructor(private api: ApiService, protected localStorage: LocalStorage, private router: Router, private translate: TranslateService) {}


  ngOnInit() {
    this.localStorage.getItem('user').subscribe((user: string) => {
      if (user) {
        const userObj = JSON.parse(user);

        this.api.userProfile(userObj.email, userObj.password).subscribe(response => {
          const visitor = response.body;

          this.visitor = new Visitor(
            visitor.name, visitor.email, visitor.isPresent, visitor.history.map(visit => {
              return new VisitHistory((new Date(visit.enteredAt)), (visit.exitedAt === null ? (new Date()) : (new Date(visit.exitedAt))));
            }));
        }, error => {
          console.log(`Error ${error}`);
          this.router.navigate(['/']);
        });

      } else {
        console.log(`Local storage error user is null`);
        this.router.navigate(['/']);
      }
    }, error => {
      console.log(`Local storage error ${error}`);
      this.router.navigate(['/']);
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

  visitsForPeriod() {
    return this.visitor.history.filter(visit => {
      switch (this.period) {
        case Period.today: {
          const now = new Date();
          return visit.enteredAt.getDay() === now.getDay() && visit.enteredAt.getMonth() === now.getMonth();
        }
        case Period.week: {
          let minimumDate = new Date();
          minimumDate.setDate(minimumDate.getDate() - 7);

          return visit.enteredAt > minimumDate;
        }
        case Period.all: {
          return true;
        }
        default: {
          return true;
        }
      }
    }).map(v => {
      const duration = v.exitedAt - v.enteredAt;

      return {
        enteredAt: v.enteredAt,
        exitedAt: v.exitedAt ,
        visitDuration: this.msToTime(duration)
      };
    });
  }

  totalPresentTimeFor() {
    let totalTime = 0;

    this.visitor.history.filter(visit => {
      switch (this.period) {
        case Period.today: {
          const now = new Date();
          return visit.enteredAt.getDay() === now.getDay() && visit.enteredAt.getMonth() === now.getMonth();
        }
        case Period.week: {
          let minimumDate = new Date();
          minimumDate.setDate(minimumDate.getDate() - 7);

          return visit.enteredAt > minimumDate;
        }
        case Period.all: {
          return true;
        }
        default: {
          return true;
        }
      }
    }).forEach(v => {
      totalTime += v.exitedAt - v.enteredAt;
    });

    return this.msToTime(totalTime);
  }


  selctionChange(index) {
    switch (index) {
      case 0: {
        this.period = Period.today;
        break;
      }
      case 1: {
        this.period = Period.week;
        break;
      }
      case 2: {
        this.period = Period.all;
        break;
      }
      default: {
        this.period = Period.all;
      }
    }
    console.log(this.period);
  }
}
