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
    console.log('User id' + id)
    this.apiService.getUserById(id).subscribe(user => {
      this.model = new UserEdit(user._id, user.displayName, user.email, user.password, user.images);
    }, error => {
      console.log(`Fetching user list error ${error}`);
    });
  }
}
//
// this.apiService.getUserById(params['id']).subscribe(user => {
//   this.model = new UserEdit(user._id, user.displayName, user.email, user.password, user.images);
// }, error => {
//   console.log(`Fetching user list error ${error}`);
// });
