import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StreamComponent} from './stream/stream.component';
import { NewUserComponent} from './new-user/new-user.component';
import { VisitorListComponent } from './visitor-list/visitor-list.component';
import { UserLoginComponent } from './user-login/user-login.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { AdminLoginComponent } from './admin-login/admin-login.component';
import { EditComponent } from './edit/edit.component';

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
    path: 'admin/login',
    component: AdminLoginComponent,
    data: { title: 'Admin login information.'}
  },
  {
    path: 'admin/edit',
    component: EditComponent,
    data: { title: 'Edit.'}
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
