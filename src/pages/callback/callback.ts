import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { OAuthService } from 'angular-oauth2-oidc';

/**
 * Generated class for the CallbackPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-callback',
  templateUrl: 'callback.html',
})
export class CallbackPage implements OnInit {

  constructor(public navCtrl: NavController, public navParams: NavParams, private oauthService: OAuthService,) {
  }

  ngOnInit() {
    this.oauthService.loadDiscoveryDocumentAndTryLogin().then(loggedIn => {
      if (!this.oauthService.hasValidIdToken() && !this.oauthService.hasValidAccessToken())  {
          this.oauthService.initImplicitFlow('login');
      } else {
        this.navCtrl.push("Home");
      }
  });
  }

}
