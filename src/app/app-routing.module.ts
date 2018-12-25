import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StreamComponent} from './stream/stream.component';
import { NewUserComponent} from './new-user/new-user.component';
import { VisitorListComponent } from './visitor-list/visitor-list.component';

const routes: Routes = [
  {
    path: '',
    component: VisitorListComponent,
    data: { title: 'Stream information.'}
  },
  {
    path: 'stream',
    component: StreamComponent,
    data: { title: 'Stream information.'}
  },
  {
    path: 'user/new',
    component: NewUserComponent,
    data: { title: 'Add new user.'}
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {onSameUrlNavigation: 'reload'})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
