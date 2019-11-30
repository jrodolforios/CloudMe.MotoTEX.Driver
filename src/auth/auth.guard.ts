import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { OAuthService } from "../../auth-oidc/src/oauth-service";
import { NavController, NavParams } from 'ionic-angular';
import { AppServiceProvider } from '../providers/app-service/app-service';

@Injectable()
export class AuthGuard {

    constructor(public navCtrl: NavController, private oauthService: OAuthService,
      private serviceProvider: AppServiceProvider) { }

    async canActivate() {
      this.oauthService.loadDiscoveryDocumentAndTryLogin().then(x =>{
        if (this.oauthService.hasValidIdToken() || this.oauthService.hasValidAccessToken()) {        
            return true;
        } else {
          this.navCtrl.push("Login");
        }
    });
        if (this.oauthService.hasValidIdToken() || this.oauthService.hasValidAccessToken()) {
          return true;
        }
        this.navCtrl.push("Login");
    }
}