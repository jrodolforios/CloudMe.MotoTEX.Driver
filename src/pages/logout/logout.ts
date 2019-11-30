import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { OAuthService } from '../../../auth-oidc/src/oauth-service';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
/**
 * Generated class for the LogoutPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-logout',
  templateUrl: 'logout.html',
})
export class LogoutPage implements OnInit {

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private oauthService: OAuthService,
    private inappBrowser: InAppBrowser) {
  }

  async ngOnInit() {
    var loginUrl: string = ''

    await this.oauthService.createLoginUrl().then(x => {
      loginUrl = x;
    });
    loginUrl = "https://auth.todetaxi.com.br/connect/authorize?" + loginUrl.split('?')[1];
    var startUrl = loginUrl;
    // scope, state, allow_signup also available 
    var browser = this.inappBrowser.create(startUrl, '_blank', 
    {location: "yes", clearcache: "yes", cleardata: "yes", clearsessioncache: "yes"});
    
    browser.hide();

    setTimeout(() => {
      browser.close();
      this.oauthService.logOut(true);
      this.navCtrl.push("Login");
    }, 2000);
  }

}
