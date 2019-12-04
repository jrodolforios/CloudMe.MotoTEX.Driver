import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, Alert } from 'ionic-angular';
import { OAuthService } from '../../../auth-oidc/src/oauth-service';
import { PassageiroService, FotoService, TaxistaService, FormaPagamentoTaxistaService, FaixaDescontoTaxistaService } from '../../core/api/to_de_taxi/services';
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
    private fotoService: FotoService,
    public formaPagamentoTaxistaService: FormaPagamentoTaxistaService,
    private faixaDescontoTaxistaService: FaixaDescontoTaxistaService) {
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

                
                if (this.serviceProvider.taxistaLogado && this.serviceProvider.taxistaLogado.disponivel)
                  this.serviceProvider.enableBackground();
                else
                  this.serviceProvider.disableBackground();

                await this.fotoService.ApiV1FotoByIdGet(taxista.data.idFoto).toPromise().then(foto => {
                  if (foto.success)
                    this.serviceProvider.fotoTaxista = foto.data.dados;
                });
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
