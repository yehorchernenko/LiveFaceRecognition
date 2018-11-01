import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { StreamComponent } from './stream/stream.component';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

const appRoutes: Routes = [
  {
    path: 'stream',
    component: StreamComponent,
    data: { title: 'Video stream' }
  },
  { path: '',
    redirectTo: '/stream',
    pathMatch: 'full'
  }
  ];

@NgModule({
  declarations: [
    AppComponent,
    StreamComponent
  ],
  imports: [
    RouterModule.forRoot(appRoutes),
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
