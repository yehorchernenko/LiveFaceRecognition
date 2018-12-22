import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StreamComponent} from './stream/stream.component';
import { NewUserComponent} from './new-user/new-user.component';

const routes: Routes = [
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
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
