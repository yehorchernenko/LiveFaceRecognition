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
  streamUrl = '';

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
    this.api.startRecognition(this.streamUrl).subscribe( res => {
      console.log(res);
      this.message = res.message;
    }, err => {
        console.log(err);
    });
  }

}
