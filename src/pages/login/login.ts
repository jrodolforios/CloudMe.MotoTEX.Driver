import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { OAuthService } from '../../../auth-oidc/src/oauth-service';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { windowWhen } from 'rxjs/operators';

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class Login {

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private oauthService: OAuthService,
    private inappBrowser: InAppBrowser) {
  }

  async loginAuth(){
    var loginUrl: string = ''
    var endUrl = this.oauthService.redirectUri;
    await this.oauthService.createLoginUrl().then(x => {
      loginUrl = x;
    });
    loginUrl = "https://auth.todetaxi.com.br/connect/authorize?" + loginUrl.split('?')[1];
    var startUrl = loginUrl;
    // scope, state, allow_signup also available 
    var browser = this.inappBrowser.create(startUrl, '_blank', 'location=yes');
    browser.on('loadstart').subscribe((result) => {

      if (result.url.indexOf(endUrl) == 0) {
        browser.close();
        var resultEnd: string = result.url.split('#/callback/?')[1]

        window.location.href = 'http://localhost/#/callback/?' + resultEnd;
      }
    });

    //this.oauthService.initCodeFlow("login");
  }
}