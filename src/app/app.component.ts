import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, NavController, Toast, ToastController, AlertController, Alert } from 'ionic-angular';
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
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { LocationAccuracy } from '@ionic-native/location-accuracy/ngx';
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
  private showedAlert: boolean;
  private confirmAlert: Alert;

  constructor(public platform: Platform,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    private oauthService: OAuthService,
    private taxistaService: TaxistaService,
    private androidPermissions: AndroidPermissions,
    private serviceProvider: AppServiceProvider,
    private nativeAudio: NativeAudio,
    private fotoService: FotoService,
    public formaPagamentoTaxistaService: FormaPagamentoTaxistaService,
    private faixaDescontoTaxistaService: FaixaDescontoTaxistaService,
    public alertCtrl: AlertController,
    private appVersion: AppVersion,
    private network: Network,
    public toastCtrl: ToastController,
    private locationAccuracy: LocationAccuracy,
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
                  this.imageCompress.compressFile(atob(foto.data.dados), 1, 20, 10).then(compressed => {
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

    this.platform.ready().then(() => {
      this.showedAlert = false;

      const localS = localStorage;
      this.firebase.onNotificationOpen()
        .subscribe(async data => {

        });

      this.platform.registerBackButtonAction(() => {
        if (!this.nav.canGoBack()) {
          if (!this.showedAlert) {
            this.confirmExitApp();
          } else {
            this.showedAlert = false;
            this.confirmAlert.dismiss();
          }
        }

        this.nav.pop();
      });

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

      if (this.platform.is("android")) {
        this.checkGPSPermission();
      }

      this.splashScreen.hide();
    });

  }

  confirmExitApp() {
    this.showedAlert = true;
    this.confirmAlert = this.alertCtrl.create({
      title: "Sair",
      message: "Tem certeza que deseja sair do APP?",
      buttons: [
        {
          text: 'Cancelar',
          handler: () => {
            this.showedAlert = false;
            return;
          }
        },
        {
          text: 'Aceitar',
          handler: () => {
            this.platform.exitApp();
          }
        }
      ]
    });
    this.confirmAlert.present();
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }

  checkGPSPermission() {
    this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION).then(
      result => {
        if (result.hasPermission) {

          //If having permission show 'Turn On GPS' dialogue
          this.askToTurnOnGPS();
        } else {

          //If not having permission ask for permission
          this.requestGPSPermission();
        }
      },
      err => {
        alert(err);
      }
    );
  }

  requestBatteryPermission() {
    this.locationAccuracy.canRequest().then((canRequest: boolean) => {
      if (canRequest) {
        console.log("4");
      } else {
        //Show 'GPS Permission Request' dialogue
        this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS)
          .then(
            () => {
              // // call method to turn on GPS
              // this.askToTurnOnGPS();
            },
            error => {
              //Show alert if user click on 'No Thanks'
              alert('requestPermission Error requesting battery permissions ' + error)
            }
          );
      }
    });
  }


  requestGPSPermission() {
    this.locationAccuracy.canRequest().then((canRequest: boolean) => {
      if (canRequest) {
        console.log("4");
      } else {
        //Show 'GPS Permission Request' dialogue
        this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION)
          .then(
            () => {
              // call method to turn on GPS
              this.askToTurnOnGPS();
            },
            error => {
              //Show alert if user click on 'No Thanks'
              alert('requestPermission Error requesting location permissions ' + error)
            }
          );
      }
    });
  }

  askToTurnOnGPS() {
    this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(
      () => {
        // When GPS Turned ON call method to get Accurate location coordinates
        this.getLocationCoordinates()
      },
      error => alert('Error requesting location permissions ' + JSON.stringify(error))
    );
  }

  getLocationCoordinates() {
  }
}
