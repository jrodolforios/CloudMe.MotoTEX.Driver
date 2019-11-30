import { Component, Renderer } from '@angular/core';
import { IonicPage, NavController, ViewController, AlertController, Loading } from 'ionic-angular';
import $ from "jquery";
import 'intl-tel-input';
import { AuthGuard } from '../../auth/auth.guard';
import { OAuthService } from '../../../auth-oidc/src/oauth-service';
import { AppServiceProvider } from '../../providers/app-service/app-service';
import { CorridaService, LocalizacaoService, SolicitacaoCorridaService, FormaPagamentoService } from '../../core/api/to_de_taxi/services';
import { CorridaSummary, SolicitacaoCorridaSummary } from '../../core/api/to_de_taxi/models';
import { global } from '../../providers/global';
@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class Profile {

  tabs = "Histórico";
  history: Array<any> = [];
  notification: Array<any> = [];
  notify: Array<any>;
  headerbg: any;
  darkHeader: any;
  public isDisabled: boolean = true;

  public nome: string = '';
  public email: string = '';
  public telefone: string = '';
  public fotoPerfil: string = 'assets/img/user-img.png';


  constructor(public navCtrl: NavController,
    public viewCtrl: ViewController,
    public renderer: Renderer,
    private oauthService: OAuthService,
    public serviceProvider: AppServiceProvider,
    private corridaService: CorridaService,
    private solicitacaoCorridaService: SolicitacaoCorridaService,
    public localizacaoService: LocalizacaoService,
    public formaPagamentoService: FormaPagamentoService,
    public alertCtrl: AlertController,
    public global: global, ) {
  }

  async iniciarCorrida(item) {
    var corrida: CorridaSummary;
    var solicitacaoCorrida: SolicitacaoCorridaSummary;
    await this.corridaService.ApiV1CorridaByIdGet(item.id).toPromise().then(x => {
      if (x.success && x.data) {
        corrida = x.data;
      }
    });
    if (corrida) {
      await this.solicitacaoCorridaService.ApiV1SolicitacaoCorridaByIdGet(corrida.idSolicitacao).toPromise()
        .then(x => {
          if (x.success && x.data)
            solicitacaoCorrida = x.data;
        })

      if (solicitacaoCorrida) {
        var tolerance: Date = this.addMinutes(new Date(solicitacaoCorrida.data), 15)

        if (new Date() > new Date(solicitacaoCorrida.data) && new Date() < tolerance) {
          const alert = await this.alertCtrl.create({
            title: 'Iniciar corrida agendada',
            message: 'Deseja iniciar a corrida agendada?',
            buttons: [
              {
                text: 'Iniciar',
                handler: (blah) => {
                  corrida.status = 2;
                  this.corridaService.ApiV1CorridaPut(corrida).toPromise().then(x => {
                    if (x.success && x.data) {
                      this.serviceProvider.corridaEmQuestao = corrida;
                      this.serviceProvider.solicitacaoCorridaEmQuestao = solicitacaoCorrida
                      this.global.accept = true;
                      this.navCtrl.push("Home");
                    }
                  });
                }
              },
              {
                text: 'Voltar',
                role: 'cancel',
                cssClass: 'secondary',
                handler: (blah) => {
                }
              }
            ]
          });
          return await alert.present();
        } else {
          const alert = await this.alertCtrl.create({
            title: 'Fora do horário',
            message: 'Você só pode iniciar a corrida no horário agendado',
            buttons: [
              {
                text: 'Voltar',
                handler: (blah) => {
                }
              }
            ]
          });
          return await alert.present();
        }
      }
    }
  }

  addMinutes(date: Date, minutes) {
    return new Date(date.getTime() + minutes * 60000);
  }

  // remove item of list
  async removeItem(item) {
    for (var i = 0; i < this.notify.length; i++) {
      if (this.notify[i] == item) {
        const alert = await this.alertCtrl.create({
          title: 'Tem  certeza que deseja cancelar o agendamento?',
          message: 'Cancelando o agendamento o passageiro irá qualificá-lo',
          buttons: [
            {
              text: 'Cancelar corrida',
              handler: (blah) => {
                this.notify.splice(i, 1);

                item.status == 5;
                this.corridaService.ApiV1CorridaByIdGet(item.id).toPromise().then(x => {
                  if (x.success && x.data) {
                    x.data.status = 5;
                    this.corridaService.ApiV1CorridaPut(x.data).toPromise().then(x =>{
                      console.log(JSON.stringify(x));
                    });
                  }
                });
              }
            },
            {
              text: 'Voltar',
              role: 'cancel',
              cssClass: 'secondary',
              handler: (blah) => {
              }
            }
          ]
        });
        return await alert.present();
      }
    }
  }

  ionViewCanEnter() {
    var authGuard: AuthGuard = new AuthGuard(this.navCtrl, this.oauthService, this.serviceProvider)

    authGuard.canActivate();
  }


  //scroll header function
  async ngAfterViewInit() {
    const loader = await this.serviceProvider.loading('Aguarde...');
    await loader.present();
    var lengthHeader = document.getElementsByClassName("toolbar-md").length - 1;
    this.headerbg = document.getElementsByClassName("toolbar-md")[lengthHeader];


    if (this.serviceProvider.taxistaLogado && this.serviceProvider.taxistaLogado.usuario) {
      this.nome = this.serviceProvider.taxistaLogado.usuario.nome;
      this.email = this.serviceProvider.taxistaLogado.usuario.email;
      this.telefone = this.serviceProvider.taxistaLogado.usuario.telefone;
      this.fotoPerfil = atob(this.serviceProvider.fotoTaxista);
      var contadorHistorico = 0;

      await this.corridaService.ApiV1CorridaConsultaIdTaxistaByIdGet(this.serviceProvider.taxistaLogado.id).toPromise()
        .then(async x => {
          if (x.success) {
            var corridas = x.data
            this.notify = [];
            this.history = [];
            await corridas.forEach(async y => {
              if ((y.status == 6 || y.status == 5 || y.status == 1) && contadorHistorico <= 30) {
                contadorHistorico++;
                var solicitacaoCorrida: SolicitacaoCorridaSummary
                await this.solicitacaoCorridaService.ApiV1SolicitacaoCorridaByIdGet(y.idSolicitacao).toPromise()
                  .then(z => {
                    if (z.success)
                      solicitacaoCorrida = z.data
                  });

                var origem: string = '';
                await this.localizacaoService.ApiV1LocalizacaoByIdGet(solicitacaoCorrida.idLocalizacaoOrigem).toPromise()
                  .then(z => {
                    if (z.success)
                      origem = z.data.nomePublico;
                  });

                var destino: string = '';
                await this.localizacaoService.ApiV1LocalizacaoByIdGet(solicitacaoCorrida.idLocalizacaoDestino).toPromise()
                  .then(z => {
                    if (z.success)
                      destino = z.data.nomePublico;
                  });

                var formaPagamento: string = '';
                await this.formaPagamentoService.ApiV1FormaPagamentoByIdGet(solicitacaoCorrida.idFormaPagamento).toPromise()
                  .then(z => {
                    if (z.success)
                      formaPagamento = z.data.descricao;
                  })

                if (y.status == 1) { //Agendada
                  this.notify.push({
                    id: y.id,
                    origem: origem,
                    destino: destino,
                    data: this.serviceProvider.formatData(new Date(solicitacaoCorrida.data)),
                    valor: 'R$' + solicitacaoCorrida.valorEstimado.toFixed(2),
                    formaPagamento: formaPagamento
                  });
                }
                else if (y.status == 6 || y.status == 5) {
                  this.history.push({
                    id: y.id,
                    origem: origem,
                    destino: destino,
                    data: this.serviceProvider.formatData(new Date(solicitacaoCorrida.data)),
                    valor: 'R$' + solicitacaoCorrida.valorEstimado.toFixed(2),
                    formaPagamento: formaPagamento,
                    status: this.serviceProvider.getStatusCorrida(y.status)
                  })
                }
              }
            });
          }
        });
    }
    loader.dismiss();
  }

  scrollingFun(ev) {
    ev.domWrite(() => {
      this.updateHeader(ev);
      //
    });
  }
  updateHeader(ev) {
    if (ev.scrollTop > 0) {
      this.darkHeader = ev.scrollTop / 380;
    }

    this.renderer.setElementStyle(this.headerbg, 'background', 'rgba(158,158,158,' + this.darkHeader + ')');
  }

  //enable input for edit
  changeData() {
    this.isDisabled = !this.isDisabled;
  }

  // intlTelInput for select country id
  ngOnInit(): any {
    let output = $("#output");
    let telInput = $("#phone");

    // telInput.intlTelInput();

  }

}