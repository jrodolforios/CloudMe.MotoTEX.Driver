import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, NavController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { OAuthService } from '../../auth-oidc/src/oauth-service';
import { JwksValidationHandler } from '../../auth-oidc/src/token-validation/jwks-validation-handler'
import { authConfig } from '../auth/auth.config';
import { TaxistaService, FotoService, FormaPagamentoTaxistaService, FaixaDescontoTaxistaService } from '../core/api/to_de_taxi/services';
import { AppServiceProvider } from '../providers/app-service/app-service';
import { NativeAudio } from '@ionic-native/native-audio/ngx';



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
    private serviceProvider: AppServiceProvider,
    private nativeAudio: NativeAudio,
    private fotoService: FotoService,
    public formaPagamentoTaxistaService: FormaPagamentoTaxistaService,
    private faixaDescontoTaxistaService: FaixaDescontoTaxistaService) {
    this.initializeApp();

    this.configureWithNewConfigApi();
    // used for an example of ngFor and navigation
    this.pages = [
      { title: 'Home', component: 'Home' },
      { title: 'List', component: 'Home' }
    ];

  }

  private async configureWithNewConfigApi() {
    this.nativeAudio.unload('todetaximotoristaruncomming').then().catch(err => { });
    await this.nativeAudio.preloadComplex('todetaximotoristaruncomming', 'assets/sounds/simple_beep.mp3', 1, 1, 0)
      .then().catch(err => { });

    this.oauthService.configure(authConfig);
    this.oauthService.setStorage(localStorage);
    this.oauthService.tokenValidationHandler = new JwksValidationHandler();
    this.oauthService.setupAutomaticSilentRefresh();

    await this.oauthService.loadDiscoveryDocumentAndTryLogin();
    if (this.oauthService.hasValidIdToken() || this.oauthService.hasValidAccessToken()) {

      this.oauthService.loadUserProfile().then(async x => {
        if (x["sub"]) {
          this.taxistaService.ApiV1TaxistaConsultaIdTaxistaByIdGet(x["sub"]).toPromise().then(async taxista => {
            if (taxista.success) {
              this.serviceProvider.taxistaLogado = taxista.data;

              await this.fotoService.ApiV1FotoByIdGet(taxista.data.idFoto).toPromise().then(foto =>{
                if(foto.success)
                this.serviceProvider.fotoTaxista = foto.data.dados;
              });

              await this.formaPagamentoTaxistaService.ApiV1FormaPagamentoTaxistaConsultaIdTaxistaByIdGet(this.serviceProvider.taxistaLogado.id).toPromise().then(x => {
                if (x.success)
                  x.data.forEach(y => {
                    this.serviceProvider.formasPagamentoTaxista.push({descricao:'', id: y.idFormaPagamento})
                  });
              });

              await this.faixaDescontoTaxistaService.ApiV1FaixaDescontoTaxistaConsultaIdTaxistaByIdGet(this.serviceProvider.taxistaLogado.id).toPromise().then(x => {
                if (x.success)
                  x.data.forEach(y => {
                    this.serviceProvider.faixasDescontoTaxista.push({descricao:'', id: y.idFaixaDesconto})
                  });
              });

              if (this.serviceProvider.taxistaLogado.disponivel)
                this.serviceProvider.enableBackground();
              else
                this.serviceProvider.disableBackground();
            }
          });
          this.nav.push("Home");
        } else {
          this.nav.push("Login");
        }
      });
    } else {
      this.nav.push('Login')
    }
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.

      this.statusBar.backgroundColorByHexString('#858585');
      this.statusBar.styleLightContent();

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
