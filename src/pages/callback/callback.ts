import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, Alert, AlertController } from 'ionic-angular';
import { OAuthService } from '../../../auth-oidc/src/oauth-service';
import { PassageiroService, FotoService, TaxistaService, FormaPagamentoTaxistaService, FaixaDescontoTaxistaService, VeiculoTaxistaService } from '../../core/api/to_de_taxi/services';
import { AppServiceProvider } from '../../providers/app-service/app-service';
import { NgxImageCompressService } from 'ngx-image-compress';

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
    private veiculoTaxistaService: VeiculoTaxistaService,
    public alertCtrl: AlertController, 
    public imageCompress: NgxImageCompressService ) {
  }

  async ngOnInit() {
    await this.oauthService.loadDiscoveryDocument();
    await this.oauthService.tryLoginCodeFlow(this.serviceProvider.loginQueryString).then(async loggedIn => {
      if (!this.oauthService.hasValidIdToken() && !this.oauthService.hasValidAccessToken()) {
        this.navCtrl.push("Login");
      } else {
        await this.oauthService.loadUserProfile().then(async x => {
          if (x["sub"]) {
            try {
              await this.taxistaService.ApiV1TaxistaConsultaIdTaxistaByIdGet(x["sub"]).toPromise().then(async taxista => {
                if (taxista.success) {
                  this.serviceProvider.taxistaLogado = taxista.data;

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

                  this.fotoService.ApiV1FotoByIdGet(taxista.data.idFoto).toPromise().then(foto => {
                    if (foto.success) {
                      this.imageCompress.compressFile(atob(foto.data.dados), 1, 30, 20).then(compressed => {
                        this.serviceProvider.fotoTaxista = compressed;
                      });
                    }
                  });
                }
              });
            } catch (err) {
              console.log(JSON.stringify(err));
            }
            var direcionadoParaSelecaoVeiculo: boolean = false;
            await this.veiculoTaxistaService.ApiV1VeiculoTaxistaConsultaVeiculosDeTaxistasByIdGet(this.serviceProvider.taxistaLogado.id)
              .toPromise().then(async x => {
                if (x.success) {
                  var algumAtivo: Boolean = false;
                  x.data.forEach(y => {
                    if (y.ativo && !algumAtivo)
                      algumAtivo = true;
                  });

                  if (!algumAtivo) {
                    x.data.forEach(y =>{
                      y.ativo = true;
                      this.veiculoTaxistaService.ApiV1VeiculoTaxistaPut(y).toPromise().then(z => JSON.stringify(z));
                    })
                  }
                }
              }).catch(err => console.log(JSON.stringify(err)));
              
            if (!direcionadoParaSelecaoVeiculo)
              this.navCtrl.push("Home");
          } else {
            this.navCtrl.push("Login");
          }
        });
      }
    }).catch(async err => {
      if (err == "Token has expired") {
        const alert = await this.alertCtrl.create({
          title: 'Data e hora incorretos',
          message: 'Seu smartphone não está com as configurações de horário corretas, verifique e ajuste a data e hora e também o horário de verão. Horario atual de seu dispositivo: ' + this.serviceProvider.formatData(new Date()),
          buttons: [
            {
              text: 'OK',
              handler: (blah) => {
                this.navCtrl.push("Login");
              }
            },
          ]
        });
        return await alert.present();
      }
    });
  }

  async ficarDisponivel(tentativas: number = 0) {

    try {
      await this.taxistaService.ApiV1TaxistaMarcarTaxistaDisponivelByIdGet({
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
    catch (err) {
      tentativas++;
      if (tentativas > 3) {
        this.serviceProvider.taxistaLogado.disponivel = false;
        this.serviceProvider.disableBackground();
      } else {
        setTimeout(() => {
          this.ficarDisponivel(tentativas);
        }, 5000);
      }
    }
  }

}
