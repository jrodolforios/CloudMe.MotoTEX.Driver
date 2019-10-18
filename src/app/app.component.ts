import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, NavController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { OAuthService, JwksValidationHandler } from 'angular-oauth2-oidc';
import { authConfig } from '../auth/auth.config';



@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = 'Login';

  pages: Array<any>;

  constructor(public platform: Platform, public statusBar: StatusBar, public splashScreen: SplashScreen,
    private oauthService: OAuthService) {
    this.initializeApp();
    this.configureWithNewConfigApi();
    // used for an example of ngFor and navigation
    this.pages = [
      { title: 'Home', component: 'Home' },
      { title: 'List', component: 'Home' }
    ];

  }

  private async configureWithNewConfigApi() {
    this.oauthService.configure(authConfig);
    this.oauthService.setStorage(localStorage);
    this.oauthService.tokenValidationHandler = new JwksValidationHandler();

    await this.oauthService.loadDiscoveryDocumentAndTryLogin();
    if (this.oauthService.hasValidIdToken() || this.oauthService.hasValidAccessToken()) {
      this.nav.push("Home");
    }
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }
}
