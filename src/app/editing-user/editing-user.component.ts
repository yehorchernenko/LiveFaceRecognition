import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router, ParamMap} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {UserEdit} from '../user-edit';
import {LocalStorage} from '@ngx-pwa/local-storage';
import {ApiService} from '../api.service';
import { switchMap } from 'rxjs/operators';


@Component({
  selector: 'app-editing-user',
  templateUrl: './editing-user.component.html',
  styleUrls: ['./editing-user.component.css']
})
export class EditingUserComponent implements OnInit {

  constructor(private apiService: ApiService, protected localStorage: LocalStorage, private router: Router, private activatedRouter: ActivatedRoute, private translate: TranslateService) { }
  model = new UserEdit('', '', '', '', []);
  images = null;
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

    const id = this.activatedRouter.snapshot.paramMap.get('id');
    this.apiService.getUserById(id).subscribe(user => {
      this.model = new UserEdit(user._id, user.displayName, user.email, user.password, user.images);
    }, error => {
      console.log(`Fetching user list error ${error}`);
    });
  }

  onSubmit() {
    this.apiService.updateUser(this.model).subscribe(response => {
      if (response.status === 200) {
        this.router.routeReuseStrategy.shouldReuseRoute = function () { return false; };
      }
    });
  }

  onImagesChanged(event) {
    this.images = event.target.files;
  }

  onUploadTouched() {
    console.log(this.model.email)
    this.apiService.updateUserPhoto(this.model.email, this.images).subscribe(response => {
      if (response.status === 200) {
        this.router.routeReuseStrategy.shouldReuseRoute = function () { return false; };
      }
    });
  }
}

