import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, NavController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { OAuthService } from '../../auth-oidc/src/oauth-service';
import {JwksValidationHandler } from '../../auth-oidc/src/token-validation/jwks-validation-handler'
import { authConfig } from '../auth/auth.config';
import { TaxistaService } from '../core/api/to_de_taxi/services';
import { AppServiceProvider } from '../providers/app-service/app-service';



@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav, { static: false }) nav: Nav;

  rootPage: any = 'Login';

  pages: Array<any>;

  constructor(public platform: Platform,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    private oauthService: OAuthService,
    private taxistaService: TaxistaService,
    private serviceProvider: AppServiceProvider,) {
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

      this.oauthService.loadUserProfile().then(async x => {
        if (x["sub"]) {
          await this.taxistaService.ApiV1TaxistaConsultaIdTaxistaByIdGet(x["sub"]).toPromise().then(async taxista => {
            if (taxista.success)
              this.serviceProvider.taxistaLogado = taxista.data;
          });
          this.nav.push("Home");
        } else {
          this.nav.push("Login");
        }
      });
    } else{
      this.nav.push('Login')
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
