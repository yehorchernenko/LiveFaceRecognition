import { Component, OnInit } from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {LocalStorage} from '@ngx-pwa/local-storage';
import {ApiService} from '../api.service';
import {Router} from '@angular/router';
import { UserEdit} from '../user-edit';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class EditComponent implements OnInit {
  userList = [];

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

    this.apiService.getUserList().subscribe(users => {
      this.userList = users.map(user => {
        return new UserEdit(user._id, user.displayName, user.email, user.password, user.images);
      });
    }, error => {
      console.log(`Fetching visitor list error ${error}`);
    });
  }

  editTouched(user) {
    console.log(user);
  }

  deleteTouched(user) {

    this.apiService.deleteUserById(user.id).subscribe(response => {
      if (response.status === 200) {
        this.apiService.getUserList().subscribe(users => {
          this.userList = users.map(json => {
            return new UserEdit(json._id, json.displayName, json.email, json.password, json.images);
          });
        }, error => {
          console.log(`Fetching visitor list error ${error}`);
        });
      }
    }, error => {
      console.log(`Error ${error}`);
    });
  }

}
