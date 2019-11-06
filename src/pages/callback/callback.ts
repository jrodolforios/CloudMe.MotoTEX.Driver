import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, Alert } from 'ionic-angular';
import { OAuthService } from '../../../auth-oidc/src/oauth-service';
import { PassageiroService, FotoService, TaxistaService } from '../../core/api/to_de_taxi/services';
import { AppServiceProvider } from '../../providers/app-service/app-service';

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

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private oauthService: OAuthService,
    private taxistaService: TaxistaService,
    private serviceProvider: AppServiceProvider,
    private fotoService: FotoService) {
  }

  ngOnInit() {
    this.oauthService.loadDiscoveryDocumentAndTryLogin().then(loggedIn => {
      if (!this.oauthService.hasValidIdToken() && !this.oauthService.hasValidAccessToken()) {
        this.navCtrl.push("Login");
      } else {
        this.oauthService.loadUserProfile().then(async x => {
          if (x["sub"]) {
            await this.taxistaService.ApiV1TaxistaConsultaIdTaxistaByIdGet(x["sub"]).toPromise().then(async taxista => {
              if (taxista.success)
                this.serviceProvider.taxistaLogado = taxista.data;
            });
            this.navCtrl.push("Home");
          } else {
            this.navCtrl.push("Login");
          }
        });
      }
    });
  }

}
