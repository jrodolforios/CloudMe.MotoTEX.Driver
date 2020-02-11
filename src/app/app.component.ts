import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, NavController, Toast, ToastController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { OAuthService } from '../../auth-oidc/src/oauth-service';
import { JwksValidationHandler } from '../../auth-oidc/src/token-validation/jwks-validation-handler'
import { authConfig } from '../auth/auth.config';
import { TaxistaService, FotoService, FormaPagamentoTaxistaService, FaixaDescontoTaxistaService, UsuarioService } from '../core/api/to_de_taxi/services';
import { AppServiceProvider } from '../providers/app-service/app-service';
import { NativeAudio } from '@ionic-native/native-audio/ngx';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { Subscription } from 'rxjs';
import { Network } from '@ionic-native/network/ngx';
import { Firebase } from '@ionic-native/firebase/ngx';
import { NgxImageCompressService } from 'ngx-image-compress';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav, { static: false }) nav: Nav;

  rootPage: any = 'Login';

  pages: Array<any>;
  private disconnectSubscription: Subscription;
  private connectSubscription: Subscription;
  private ToatNetwork: Toast;

  constructor(public platform: Platform,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    private oauthService: OAuthService,
    private taxistaService: TaxistaService,
    private serviceProvider: AppServiceProvider,
    private nativeAudio: NativeAudio,
    private fotoService: FotoService,
    public formaPagamentoTaxistaService: FormaPagamentoTaxistaService,
    private faixaDescontoTaxistaService: FaixaDescontoTaxistaService,
    private appVersion: AppVersion,
    private network: Network,
    public toastCtrl: ToastController,
    private firebase: Firebase,
    public imageCompress: NgxImageCompressService) {
    this.initializeApp();

    this.configureWithNewConfigApi();
    // used for an example of ngFor and navigation
    this.pages = [
      { title: 'Home', component: 'Home' },
      { title: 'List', component: 'Home' }
    ];

  }

  public ngOnDestroy() {
    this.connectSubscription.unsubscribe();
    this.disconnectSubscription.unsubscribe();
  }

  private async configureWithNewConfigApi() {
    const loading = await this.serviceProvider.loading("Aguarde...");
    loading.present();
    this.platform.ready().then(async x => {
      await this.nativeAudio.unload('mototextaxistamotoristaruncomming').then().catch(err => { });
      await this.nativeAudio.preloadComplex('mototextaxistamotoristaruncomming', 'assets/sounds/simple_beep.mp3', 1, 1, 0)
        .then().catch(err => { });
    });

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

              this.fotoService.ApiV1FotoByIdGet(taxista.data.idFoto).toPromise().then(foto => {
                if (foto.success) {
                  this.imageCompress.compressFile(atob(foto.data.dados), 1, 20,10 ).then(compressed =>{
                    this.serviceProvider.fotoTaxista = compressed;
                  });
                }
              });

              this.formaPagamentoTaxistaService.ApiV1FormaPagamentoTaxistaConsultaIdTaxistaByIdGet(this.serviceProvider.taxistaLogado.id).toPromise().then(x => {
                if (x.success)
                  x.data.forEach(y => {
                    this.serviceProvider.formasPagamentoTaxista.push({ descricao: '', id: y.idFormaPagamento })
                  });
              });

              this.faixaDescontoTaxistaService.ApiV1FaixaDescontoTaxistaConsultaIdTaxistaByIdGet(this.serviceProvider.taxistaLogado.id).toPromise().then(x => {
                if (x.success)
                  x.data.forEach(y => {
                    this.serviceProvider.faixasDescontoTaxista.push({ descricao: '', id: y.idFaixaDesconto })
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

    loading.dismiss();
  }

  initializeApp() {
    const localS = localStorage;
    // this.firebase.onNotificationOpen()
    // .subscribe(data => {
    //   this.serviceProvider.notificacaoFirebase = JSON.stringify(data);
    // });

    this.platform.ready().then(() => {

      this.disconnectSubscription = this.network.onDisconnect().subscribe(async () => {
        if (this.ToatNetwork) {
          this.ToatNetwork.dismiss();
          this.ToatNetwork = undefined;
        }
        this.ToatNetwork = await this.toastCtrl.create({
          message: "DESCONECTADO: Você está offline, verifique sua conexão.",
        });
        this.ToatNetwork.present();

      });
      this.connectSubscription = this.network.onConnect().subscribe(async () => {
        setTimeout(async () => {
          if (this.ToatNetwork) {
            this.ToatNetwork.dismiss();
            this.ToatNetwork = undefined;
          }
        }, 3000);
      });

      this.appVersion.getVersionNumber().then(x => {
        this.serviceProvider.appVersion = x;
      });

      this.statusBar.backgroundColorByHexString('#0E4B67');
      this.statusBar.styleLightContent();

      this.splashScreen.hide();
    });

  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }
}
