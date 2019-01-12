import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { Observable } from 'rxjs';
import {LocalStorage} from '@ngx-pwa/local-storage';
import {Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-stream',
  templateUrl: './stream.component.html',
  styleUrls: ['./stream.component.css']
})
export class StreamComponent implements OnInit {
  message = 'Waiting...';
  enterURL = '';
  exitURL = '';

  constructor(private api: ApiService, protected localStorage: LocalStorage, private router: Router, private translate: TranslateService) { }

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
    this.api.checkApi()
      .subscribe(res => {
        console.log(res);
        this.message = res.message;
      }, err => {
        console.log(err);
      });
  }

  startRecognition() {
    console.log(this.enterURL + this.exitURL);
    this.api.startRecognition(this.enterURL, this.exitURL).subscribe( res => {
      console.log(res);
      this.message = res.message;
    }, err => {
        console.log(err);
    });
  }

  logout() {
    this.localStorage.removeItem('admin').subscribe(() => {
      this.router.navigate(['/admin/login']);
    });
  }
}
