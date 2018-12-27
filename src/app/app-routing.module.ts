import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StreamComponent} from './stream/stream.component';
import { NewUserComponent} from './new-user/new-user.component';
import { VisitorListComponent } from './visitor-list/visitor-list.component';
import { UserLoginComponent } from './user-login/user-login.component';
import {UserProfileComponent} from './user-profile/user-profile.component';


const routes: Routes = [
  {
    path: '',
    component: UserLoginComponent,
    data: { title: 'User login'}
  },
  {
    path: 'profile',
    component: UserProfileComponent,
    data: { title: 'User login'}
  },
  {
    path: 'admin',
    component: VisitorListComponent,
    data: { title: 'Stream information.'}
  },
  {
    path: 'admin/stream',
    component: StreamComponent,
    data: { title: 'Stream information.'}
  },
  {
    path: 'admin/user/new',
    component: NewUserComponent,
    data: { title: 'Add new user.'}
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {onSameUrlNavigation: 'reload'})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
