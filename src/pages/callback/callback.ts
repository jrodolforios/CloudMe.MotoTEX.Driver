import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, Alert, AlertController } from 'ionic-angular';
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
    private faixaDescontoTaxistaService: FaixaDescontoTaxistaService,
    public alertCtrl: AlertController, ) {
  }

  async ngOnInit() {
    await this.oauthService.loadDiscoveryDocument();
    await this.oauthService.tryLoginCodeFlow(this.serviceProvider.loginQueryString).then(async loggedIn => {
      if (!this.oauthService.hasValidIdToken() && !this.oauthService.hasValidAccessToken()) {
        this.navCtrl.push("Login");
      } else {
        await this.oauthService.loadUserProfile().then(async x => {
          if (x["sub"]) {
            try{
            await this.taxistaService.ApiV1TaxistaConsultaIdTaxistaByIdGet(x["sub"]).toPromise().then(async taxista => {
              if (taxista.success) {
                this.serviceProvider.taxistaLogado = taxista.data;

                await this.formaPagamentoTaxistaService.ApiV1FormaPagamentoTaxistaConsultaIdTaxistaByIdGet(this.serviceProvider.taxistaLogado.id).toPromise().then(x => {
                  if (x.success)
                    x.data.forEach(y => {
                      this.serviceProvider.formasPagamentoTaxista.push({ descricao: '', id: y.idFormaPagamento })
                    });
                });

                await this.faixaDescontoTaxistaService.ApiV1FaixaDescontoTaxistaConsultaIdTaxistaByIdGet(this.serviceProvider.taxistaLogado.id).toPromise().then(x => {
                  if (x.success)
                    x.data.forEach(y => {
                      this.serviceProvider.faixasDescontoTaxista.push({ descricao: '', id: y.idFaixaDesconto })
                    });
                });

                if (this.serviceProvider.taxistaLogado && !this.serviceProvider.taxistaLogado.disponivel) {
                  const alert = await this.alertCtrl.create({
                    title: 'Você está indisponível',
                    message: 'Estando indisponível, você não receberá chamados de corridas. Deseja alterar seu status para disponível?',
                    buttons: [
                      {
                        text: 'Ficar disponível',
                        handler: (blah) => {
                          this.serviceProvider.taxistaLogado.disponivel = true;
                          this.ficarDisponivel();
                        }
                      },
                      {
                        text: 'Cancelar',
                        role: 'cancel',
                        cssClass: 'secondary',
                        handler: (blah) => {
                          this.serviceProvider.taxistaLogado.disponivel = false;
                          this.ficarDisponivel();
                        }
                      }
                    ]
                  });
                  return await alert.present();
                } else {
                  this.ficarDisponivel();
                }

                await this.fotoService.ApiV1FotoByIdGet(taxista.data.idFoto).toPromise().then(foto => {
                  if (foto.success)
                    this.serviceProvider.fotoTaxista = foto.data.dados;
                });
              }
            });
          } catch(err){
            console.log(JSON.stringify(err));
          }
            // if (!this.serviceProvider.taxistaLogado || this.serviceProvider.taxistaLogado == null
            //   || this.serviceProvider.taxistaLogado == undefined) {
            //   const alert = await this.alertCtrl.create({
            //     title: 'Acesso não permitido',
            //     message: 'Você não pode acessar o app',
            //     enableBackdropDismiss: false,
            //     buttons: [
            //       {
            //         text: 'OK',
            //         handler: (blah) => {
            //           this.navCtrl.push("LogoutPage");
            //         }
            //       }
            //     ]
            //   });
            //   return await alert.present();
            // }
            this.navCtrl.push("Home");
          } else {
            this.navCtrl.push("Login");
          }
        });
      }
    });
  }

  ficarDisponivel() {
    this.taxistaService.ApiV1TaxistaMarcarTaxistaDisponivelByIdGet({
      id: this.serviceProvider.taxistaLogado.id,
      disponivel: this.serviceProvider.taxistaLogado.disponivel
    }).toPromise().then(async x => {
      if (x.success && x.data) {
        if (this.serviceProvider.taxistaLogado && this.serviceProvider.taxistaLogado.disponivel)
          this.serviceProvider.enableBackground();
        else
          this.serviceProvider.disableBackground();
      }
    });
  }

}
