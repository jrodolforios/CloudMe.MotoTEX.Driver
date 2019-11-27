import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TaxistaSummary, SolicitacaoCorridaSummary, CorridaSummary, FormaPagamentoSummary, FaixaDescontoSummary } from '../../core/api/to_de_taxi/models';
import { ToastController, Platform, LoadingController } from 'ionic-angular';
import { Vibration } from '@ionic-native/vibration/ngx';
import { NativeAudio } from '@ionic-native/native-audio/ngx';
import { SolicitacaoCorridaService, CorridaService } from '../../core/api/to_de_taxi/services';
import { BackgroundMode } from '@ionic-native/background-mode/ngx';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import { SignalRserviceServiceProvider } from '../signal-rservice-service/signal-rservice-service';
import { CatalogosService } from '../Catalogos/catalogos.service';
import { App } from 'ionic-angular';
import { Subscriber, Subscription } from 'rxjs';
import { CatalogoCorrida } from '../Catalogos/catalogo-corrida.service';
/*
  Generated class for the AppServiceProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable({
  providedIn: 'root'
})
export class AppServiceProvider {

  taxistLat: any;
  Taxistlng: any;

  //Para uso na modal
  textoOrigem: string = '';
  textoDestino: string = '';

  descDistanciaViagem: string = '';
  descTempoViagem: string = '';
  descValorCorrida: string = '';

  solicitacaoCorridaEmQuestao: SolicitacaoCorridaSummary
  corridaEmQuestao: CorridaSummary;
  corridaSubscriber: Subscription;

  taxistaLogado: TaxistaSummary;
  fotoTaxista: string;
  formasPagamentoTaxista: FormaPagamentoSummary[];
  faixasDescontoTaxista: FaixaDescontoSummary[];
  IdCorridaParaClassificacao: string;

  constructor(public http: HttpClient,
    public toastCtrl: ToastController,
    private vibration: Vibration,
    private nativeAudio: NativeAudio,
    public loadingCtrl: LoadingController,
    private solicitacaoCorridaService: SolicitacaoCorridaService,
    private backgroundMode: BackgroundMode,
    private platform: Platform,
    private localNotifications: LocalNotifications,
    private signalRService: SignalRserviceServiceProvider,
    private CatalogosService: CatalogosService,
    private app: App,
    private corridaService: CorridaService) {
    this.formasPagamentoTaxista = [];
    this.faixasDescontoTaxista = [];
  }

  async presentToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000
    });
    return toast;
  }

  discartViagem() {
    this.solicitacaoCorridaEmQuestao = undefined;
  }

  private async notificarCorrida(corridaSummary: CorridaSummary) {
    this.solicitacaoCorridaEmQuestao = corridaSummary;

    if (this.solicitacaoCorridaEmQuestao && this.solicitacaoCorridaEmQuestao != null && (this.solicitacaoCorridaEmQuestao.situacao == 1 || this.solicitacaoCorridaEmQuestao.situacao == 0)) {
      this.callNotification();
      this.app.getRootNav().setRoot('Home');
    }
  }

  async callNotification() {
    this.vibration.vibrate([2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000]);
    this.nativeAudio.play('todetaximotoristaruncomming').then().catch();
    
    this.localNotifications.schedule({
      id: 999,
      title: 'Chamado em andamento',
      text: 'Toque para ver o chamado em andamento',
      //data: { secret: key }
    });

  }

  async endNotification() {
    this.localNotifications.cancel(999).catch();
    this.vibration.vibrate(0);
    this.nativeAudio.stop('todetaximotoristaruncomming')
  }

  async loading(message: string) {
    const loader = await this.loadingCtrl.create({
      content: message
    });
    return loader;
  }

  formatedTimeHHMMss(timeInSeconds: number) {
    var sec_num = timeInSeconds // don't forget the second param
    var hours = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    var fHours, fMinutes, fSecconds: string;

    if (hours < 10) { fHours = "0" + hours; } else { fHours = "" + hours; }
    if (minutes < 10) { fMinutes = "0" + minutes; } else { fMinutes = "" + minutes; }
    if (seconds < 10) { fSecconds = "0" + seconds.toFixed(0); } else { fSecconds = seconds.toFixed(0); }

    return fHours + 'h ' + fMinutes + 'min ' + fSecconds + 'seg';
  }

  formatedTimeHHMM(timeInSeconds: number) {
    var sec_num = timeInSeconds// don't forget the second param
    var hours = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);

    var fHours, fMinutes, fSecconds: string;

    if (hours < 10) { fHours = "0" + hours; } else { fHours = '' + hours }
    if (minutes < 10) { fMinutes = "0" + minutes; } else { fMinutes = '' + minutes }
    return fHours + 'h ' + fMinutes + 'min'
  }

  getTipoViagem(tipoAtendimento?: 0 | 1 | 2 | 3) {
    var descriçãoTipoViagem: string = '';
    switch (tipoAtendimento) {
      case 0:
        descriçãoTipoViagem = 'Indefinido';
        break;
      case 1:
        descriçãoTipoViagem = 'Normal';
        break;
      case 2:
        descriçãoTipoViagem = 'Agendado';
        break;
      case 3:
        descriçãoTipoViagem = 'Flex';
        break;
    }

    return descriçãoTipoViagem;
  }

  formatData(d: Date) {
    var strData =
      ("00" + d.getDate()).slice(-2) + '/' +
      ("00" + (d.getMonth() + 1)).slice(-2) + "/" +
      d.getFullYear() + " " +
      ("00" + d.getHours()).slice(-2) + ":" +
      ("00" + d.getMinutes()).slice(-2) + ":" +
      ("00" + d.getSeconds()).slice(-2);

    return strData;
  }

  getStatusCorrida(status: 0 | 1 | 2 | 3 | 4 | 5 | 6) {
    switch (status) {
      case 0:
        return 'Indefinido';
      case 1:
        return 'Agendado';
      case 2:
        return 'solicitado';
      case 3:
        return 'Em curso';
      case 4:
        return 'Espera';
      case 5:
        return 'Cancelada';
      case 6:
        return 'Concluída';
    }
  }

  enableBackground() {
    this.signalRService.startConnection();
    this.signalRService.getCurrentLocation(this.taxistaLogado.id, this);

    this.CatalogosService.solicitacaoCorrida.startTrackingChanges();

    this.CatalogosService.solicitacaoCorrida.changesSubject.subscribe(x => {
      var faixadescontoExiste = false;
      var formaPagamentoExiste = false;
      var idAdded: string = '';
      var idUpdated: string = '';
      if (!this.solicitacaoCorridaEmQuestao) {
        var solicitacaoCorridaParaNotificar: SolicitacaoCorridaSummary;
        x.addedItems.forEach(x => {
          if (idAdded != x.id) {
            idAdded = x.id;
            this.faixasDescontoTaxista.forEach(y => {
              if ((y.id == x.idFaixaDesconto && !faixadescontoExiste) || x.idFaixaDesconto == null)
                faixadescontoExiste = true;
            });

            this.formasPagamentoTaxista.forEach(y => {
              if (y.id == x.idFormaPagamento && !formaPagamentoExiste)
                formaPagamentoExiste = true;
            });

            if (formaPagamentoExiste && faixadescontoExiste)
              solicitacaoCorridaParaNotificar = x;
          }
        });

        faixadescontoExiste = false;
        formaPagamentoExiste = false;

        x.updatedItems.forEach(x => {
          if (idUpdated != x.id) {
            idUpdated = x.id;
            if (x.situacao == 1) {
              this.faixasDescontoTaxista.forEach(y => {
                if ((y.id == x.idFaixaDesconto && !faixadescontoExiste) || x.idFaixaDesconto == null)
                  faixadescontoExiste = true;
              })

              this.formasPagamentoTaxista.forEach(y => {
                if (y.id == x.idFormaPagamento && !formaPagamentoExiste)
                  formaPagamentoExiste = true;
              })

              if (formaPagamentoExiste && faixadescontoExiste && solicitacaoCorridaParaNotificar.situacao != 4)
                solicitacaoCorridaParaNotificar = x;
            }
          }
        });

        this.notificarCorrida(solicitacaoCorridaParaNotificar);
      }
      else if (this.solicitacaoCorridaEmQuestao) {
        x.updatedItems.forEach(async x => {
          var corrida: CorridaSummary
          await this.corridaService.ApiV1CorridaConsultaIdSolicitacaoCorridaByIdGet(this.solicitacaoCorridaEmQuestao.id).toPromise()
          .then(z =>{
            if(z.success && z.data)
            corrida = z.data;
          });

          if (x.id == this.solicitacaoCorridaEmQuestao.id && (x.situacao == 2 || x.situacao == 4) && corrida && corrida.idTaxista != this.taxistaLogado.id) {
            this.endNotification();
            this.solicitacaoCorridaEmQuestao = undefined;
          } else {
            if (x.id == this.solicitacaoCorridaEmQuestao.id && x.situacao == 4) {
              this.endNotification();
              this.solicitacaoCorridaEmQuestao = undefined;
            }
          }
        });
      }

    })

    this.platform.ready().then(() => {
      if (!(this.backgroundMode.isActive() && this.backgroundMode.isEnabled())) {
        this.backgroundMode.setDefaults({
          text: "Você está ativo, receberá chamados de corrida",
          title: "Ativo para receber chamados",
          ticker: "Você está ativo",
          resume: true,
          bigText: true,
          hidden: false,
          silent: false
        });

        this.backgroundMode.enable();

        this.backgroundMode.on('activate').subscribe(() => {
          this.backgroundMode.disableWebViewOptimizations();

        });
      }
    });
  }

  disableBackground() {
    this.CatalogosService.solicitacaoCorrida.stopTrackingChanges();
    this.signalRService.disconnect();
    if (this.backgroundMode.isActive && this.backgroundMode.isEnabled) {
      this.backgroundMode.disable();

      this.localNotifications.cancel(1);
    }
  }

}
