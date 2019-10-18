import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { OAuthService } from "angular-oauth2-oidc";
import { NavController, NavParams } from 'ionic-angular';

@Injectable()
export class AuthGuard {

    constructor(public navCtrl: NavController, private oauthService: OAuthService) { }

    async canActivate() {
        await this.oauthService.loadDiscoveryDocumentAndTryLogin();
        if (this.oauthService.hasValidIdToken() || this.oauthService.hasValidAccessToken()) {
          return true;
        }
        this.navCtrl.push("Login");
    }
}