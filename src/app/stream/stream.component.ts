import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-stream',
  templateUrl: './stream.component.html',
  styleUrls: ['./stream.component.css']
})
export class StreamComponent implements OnInit {
  message = 'Waiting...';
  enterURL = '';
  exitURL = '';

  constructor(private api: ApiService) { }

  ngOnInit() {
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
    this.api.startRecognition(this.enterURL).subscribe( res => {
      console.log(res);
      this.message = res.message;
    }, err => {
        console.log(err);
    });
  }

}
