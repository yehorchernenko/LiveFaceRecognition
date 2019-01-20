import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { StreamComponent } from './stream/stream.component';
import { NewUserComponent } from './new-user/new-user.component';
import { AppRoutingModule } from './app-routing.module';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './shared/material.module';
import { AlertModule } from 'ngx-alerts';
import { VisitorListComponent } from './visitor-list/visitor-list.component';
import { UserLoginComponent } from './user-login/user-login.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { AdminLoginComponent } from './admin-login/admin-login.component';

/**Localization https://medium.com/letsboot/translate-angular-4-apps-with-ngx-translate-83302fb6c10d*/
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';



export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    StreamComponent,
    NewUserComponent,
    VisitorListComponent,
    UserLoginComponent,
    UserProfileComponent,
    AdminLoginComponent
  ],
  imports: [
    AppRoutingModule,
    AlertModule.forRoot(),
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MaterialModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (HttpLoaderFactory),
        deps: [HttpClient]
      }
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
