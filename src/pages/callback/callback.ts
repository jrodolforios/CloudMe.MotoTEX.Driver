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

  async ngOnInit() {
    this.oauthService.loadDiscoveryDocumentAndTryLogin().then(loggedIn => {
      if (!this.oauthService.hasValidIdToken() && !this.oauthService.hasValidAccessToken()) {
        this.navCtrl.push("Login");
      } else {
        this.oauthService.loadUserProfile().then(x => {
          if (x["sub"]) {
            this.taxistaService.ApiV1TaxistaConsultaIdTaxistaByIdGet(x["sub"]).toPromise().then(async taxista => {
              if (taxista.success) {
                this.serviceProvider.taxistaLogado = taxista.data;

                await this.fotoService.ApiV1FotoByIdGet(taxista.data.idFoto).toPromise().then(foto => {
                  if (foto.success)
                    this.serviceProvider.fotoTaxista = foto.data.dados;
                });

                if (this.serviceProvider.taxistaLogado && this.serviceProvider.taxistaLogado.disponivel)
                  this.serviceProvider.enableBackground();
                else
                  this.serviceProvider.disableBackground();
              }
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
