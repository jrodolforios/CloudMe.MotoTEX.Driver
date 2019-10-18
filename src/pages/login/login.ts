import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { OAuthService } from 'angular-oauth2-oidc';


@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class Login {

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private oauthService: OAuthService) {
  }

  loginAuth(){
    this.oauthService.initImplicitFlow("login");
  }

}