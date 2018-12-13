import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { StreamComponent } from './stream/stream.component';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import {
  MatInputModule,
  MatPaginatorModule,
  MatProgressSpinnerModule,
  MatSortModule,
  MatTableModule,
  MatIconModule,
  MatButtonModule,
  MatCardModule,
  MatFormFieldModule,
} from '@angular/material';
import { NewUserComponent } from './new-user/new-user.component';

const appRoutes: Routes = [
  {
    path: 'newuser',
    component: NewUserComponent,
    data: { title: 'Add new user' }
  },
  {
    path: 'stream',
    component: StreamComponent,
    data: { title: 'Video stream' }
  },
  ];

@NgModule({
  declarations: [
    AppComponent,
    StreamComponent,
    NewUserComponent
  ],
  imports: [
    RouterModule.forRoot(appRoutes),
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatInputModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSortModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
