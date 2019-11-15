import { Component, Renderer } from '@angular/core';
import { IonicPage, NavController, ViewController } from 'ionic-angular';
import $ from "jquery";
import 'intl-tel-input';
import { AuthGuard } from '../../auth/auth.guard';
import { OAuthService } from '../../../auth-oidc/src/oauth-service';
import { AppServiceProvider } from '../../providers/app-service/app-service';
import { CorridaService, LocalizacaoService, SolicitacaoCorridaService, FormaPagamentoService } from '../../core/api/to_de_taxi/services';
import { CorridaSummary, SolicitacaoCorridaSummary } from '../../core/api/to_de_taxi/models';
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
    public formaPagamentoService: FormaPagamentoService) {
  }


  // remove item of list
  removeItem(item) {
    for (var i = 0; i < this.notify.length; i++) {
      if (this.notify[i] == item) {
        this.notify.splice(i, 1);
      }

    }
  }

  ionViewCanEnter() {
    var authGuard: AuthGuard = new AuthGuard(this.navCtrl, this.oauthService)

    authGuard.canActivate();
  }


  //scroll header function
  async ngAfterViewInit() {
    var lengthHeader = document.getElementsByClassName("toolbar-md").length - 1;
    this.headerbg = document.getElementsByClassName("toolbar-md")[lengthHeader];


    if (this.serviceProvider.taxistaLogado && this.serviceProvider.taxistaLogado.usuario) {
      this.nome = this.serviceProvider.taxistaLogado.usuario.nome;
      this.email = this.serviceProvider.taxistaLogado.usuario.email;
      this.telefone = this.serviceProvider.taxistaLogado.usuario.telefone;
      this.fotoPerfil = atob(this.serviceProvider.fotoTaxista);

      await this.corridaService.ApiV1CorridaConsultaIdTaxistaByIdGet(this.serviceProvider.taxistaLogado.id).toPromise()
        .then(async x => {
          if (x.success) {
            var corridas = x.data
            this.notify = [];
            this.history = [];
            await corridas.forEach(async y => {
              if (y.status == 6 || y.status == 5 || y.status == 1) {
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
                    origem: origem,
                    destino: destino,
                    data: this.serviceProvider.formatData(new Date(solicitacaoCorrida.data)),
                    valor: 'R$' + solicitacaoCorrida.valorEstimado.toFixed(2),
                    formaPagamento: formaPagamento
                  });
                }
                else if (y.status == 6 || y.status == 5) {
                  this.history.push({
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