import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { StreamComponent } from './stream/stream.component';
import { NewUserComponent } from './new-user/new-user.component';
import { AppRoutingModule } from './app-routing.module';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './shared/material.module';
import { AlertsModule } from 'angular-alert-module';
import { VisitorListComponent } from './visitor-list/visitor-list.component';

@NgModule({
  declarations: [
    AppComponent,
    StreamComponent,
    NewUserComponent,
    VisitorListComponent
  ],
  imports: [
    AppRoutingModule,
    AlertsModule.forRoot(),
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MaterialModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
