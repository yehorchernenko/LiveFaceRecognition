import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import {Visitor} from '../visitor';

@Component({
  selector: 'app-visitor-list',
  templateUrl: './visitor-list.component.html',
  styleUrls: ['./visitor-list.component.css']
})
export class VisitorListComponent implements OnInit {

  visitorList = [Visitor];
  constructor(private apiService: ApiService) { }

  ngOnInit() {
    this.apiService.getVisitorList().subscribe(visitors => {
      this.visitorList = visitors.map(visitor => {
        const lastVisit = new Date(visitor.lastVisit);
        return new Visitor(
          visitor.name, visitor.email, visitor.isPresent, visitor.presentTime, this.msToTime(visitor.presentTime),
          visitor.lastVisit, `${lastVisit.getDate()}-${lastVisit.getMonth()}-${lastVisit.getFullYear()} ${lastVisit.getHours()}:${lastVisit.getMinutes()}`);
      });
    }, error => {
        console.log(`Fetching visitor list error ${error}`);
    });
  }

  msToTime(duration) {
    let minutes = Math.floor((duration / (1000 * 60)) % 60);
    let hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

    let h = (hours < 10) ?  `0${hours}` : `${hours}`;
    let m = (minutes < 10) ? `0${minutes}` : `${minutes}`;

    return h + ':' + m;
  }

}
