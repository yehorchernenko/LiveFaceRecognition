import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Smart office tracker';
  selectedLanguage = '';

  constructor(private translate: TranslateService) {
    translate.setDefaultLang('en');
    this.selectedLanguage = 'en';
  }

  switchLanguage(language: string) {
    this.translate.use(language);
    this.selectedLanguage = language;
  }
}
