import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import {Visitor} from '../visitor';
import {LocalStorage} from '@ngx-pwa/local-storage';
import {Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {VisitHistory} from '../visit-history';

@Component({
  selector: 'app-visitor-list',
  templateUrl: './visitor-list.component.html',
  styleUrls: ['./visitor-list.component.css']
})
export class VisitorListComponent implements OnInit {

  visitorList = [Visitor];
  constructor(private apiService: ApiService, protected localStorage: LocalStorage, private router: Router, private translate: TranslateService) { }

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

    this.apiService.getVisitorList().subscribe(visitors => {
      this.visitorList = visitors.map(visitor => {
        return new Visitor(
          visitor.name, visitor.email, visitor.isPresent, visitor.history.map(visit => {
            console.log(visit.exitedAt )
            return new VisitHistory((new Date(visit.enteredAt)), (visit.exitedAt === null ? (new Date()) : (new Date(visit.exitedAt))));
          }));
      });
    }, error => {
        console.log(`Fetching visitor list error ${error}`);
    });
  }

  visitsForPeriod(visitor) {
    return visitor.history.map(v => {
      const duration = v.exitedAt - v.enteredAt;

      return {
        enteredAt: v.enteredAt,
        exitedAt: v.exitedAt ,
        visitDuration: this.msToTime(duration)
      };
    });
  }

  totalPresentTimeFor(visitor) {
    let totalTime = 0;

    visitor.history.forEach(v => {
      totalTime += v.exitedAt - v.enteredAt;
    });

    return this.msToTime(totalTime);
  }


  msToTime(duration) {
    let minutes = Math.floor((duration / (1000 * 60)) % 60);
    let hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

    let h = (hours < 10) ?  `0${hours}` : `${hours}`;
    let m = (minutes < 10) ? `0${minutes}` : `${minutes}`;

    return h + ':' + m;
  }

  logout() {
    this.localStorage.removeItem('admin').subscribe(() => {
      this.router.navigate(['/admin/login']);
    });
  }

  selctionChange(index) {
    console.log(index);
  }
}
