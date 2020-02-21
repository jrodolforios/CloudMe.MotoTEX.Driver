import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TaxistaSummary, SolicitacaoCorridaSummary, CorridaSummary, FormaPagamentoSummary, FaixaDescontoSummary, EmergenciaSummary, LocalizacaoSummary } from '../../core/api/to_de_taxi/models';
import { ToastController, Platform, LoadingController } from 'ionic-angular';
import { Vibration } from '@ionic-native/vibration/ngx';
import { NativeAudio } from '@ionic-native/native-audio/ngx';
import { SolicitacaoCorridaService, CorridaService, LocalizacaoService } from '../../core/api/to_de_taxi/services';
import { BackgroundMode } from '@ionic-native/background-mode/ngx';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import { SignalRserviceServiceProvider } from '../signal-rservice-service/signal-rservice-service';
import { CatalogosService } from '../Catalogos/catalogos.service';
import { App } from 'ionic-angular';
import { Subscriber, Subscription } from 'rxjs';
import { MessageServiceProvider } from '../message-service/message-service';
import { global } from '../../providers/global';
import { SolicitacaoServiceProvider } from '../solicitacao-service/solicitacao-service';
import { TextToSpeech } from '@ionic-native/text-to-speech/ngx';
import { PowerManagement } from '@ionic-native/power-management/ngx';
/*
  Generated class for the AppServiceProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable({
  providedIn: 'root'
})
export class AppServiceProvider {

  TaxistLat: any;
  TaxistLng: any;
  TaxistAngl: number;

  //Para uso na modal
  textoOrigem: string = '';
  textoDestino: string = '';
  public idUsuarioPassageiro: string = '';
  public loginQueryString: string = '';
  filaSolicitacoes: SolicitacaoCorridaSummary[] = [];

  descDistanciaViagem: string = '';
  descTempoViagem: string = '';
  descValorCorrida: string = '';

  solicitacaoCorridaEmQuestao: SolicitacaoCorridaSummary
  corridaEmQuestao: CorridaSummary;
  corridaSubscriber: Subscription;
  emergenciaRecebida: EmergenciaSummary;

  taxistaLogado: TaxistaSummary;
  fotoTaxista: string;
  formasPagamentoTaxista: FormaPagamentoSummary[];
  faixasDescontoTaxista: FaixaDescontoSummary[];
  IdCorridaParaClassificacao: string;
  notificacaoFirebase: string;

  public appVersion: string = '';

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
    public global: global,
    private powerManagement: PowerManagement,
    private CatalogosService: CatalogosService,
    private tts: TextToSpeech,
    private app: App,
    private corridaService: CorridaService,
    private messageService: MessageServiceProvider,
    private localizacaoService: LocalizacaoService,
    private solicitacaoServiceProvider: SolicitacaoServiceProvider) {
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

  public async notificarCorrida(corridaSummary: CorridaSummary) {
    this.solicitacaoCorridaEmQuestao = corridaSummary;

    await this.solicitacaoCorridaService.ApiV1SolicitacaoCorridaAcaoTaxistaByIdPost({
      id: '00000000-0000-0000-0000-000000000000',
      acao: 0,
      idSolicitacao: this.solicitacaoCorridaEmQuestao.id,
      idTaxista: this.taxistaLogado.id
    }).toPromise().then(x => {
      console.log(JSON.stringify(x));
    });

    if (this.solicitacaoCorridaEmQuestao && this.solicitacaoCorridaEmQuestao != null && (this.solicitacaoCorridaEmQuestao.situacao == 1 || this.solicitacaoCorridaEmQuestao.situacao == 0)) {
      this.callNotification();
      this.app.getRootNav().setRoot('Home');
    }
  }

  async callNotification() {
    this.platform.ready().then(x => {
      this.localNotifications.schedule({
        id: 6832168431,
        title: 'Chamado em andamento',
        text: 'Toque para ver o chamado em andamento',
      });

      this.vibration.vibrate([2000, 1000, 2000, 1000, 2000]);
      this.nativeAudio.play('mototextaxistamotoristaruncomming').then(async audio => {
        var origem: LocalizacaoSummary;
        var destino: LocalizacaoSummary;
        var texto: string;
        await this.localizacaoService.ApiV1LocalizacaoByIdGet(this.solicitacaoCorridaEmQuestao.idLocalizacaoOrigem)
          .toPromise().then(loca => {
            if (loca.success && loca.data)
              origem = loca.data;
          })

        await this.localizacaoService.ApiV1LocalizacaoByIdGet(this.solicitacaoCorridaEmQuestao.idLocalizacaoDestino)
          .toPromise().then(loca => {
            if (loca.success && loca.data)
              destino = loca.data;
          })

        var distanciaMototaxista: number = this.getDistanceFromLatLonInM(+origem.latitude, +origem.longitude, +this.TaxistLat, +this.TaxistLng);
        var distanciaTrajeto: number = this.getDistanceFromLatLonInM(+origem.latitude, +origem.longitude, +destino.latitude, +destino.longitude);

        texto = "Solicitação de corrida próximo a você."

        if (distanciaTrajeto > 1000)
          texto += " O trajeto tem um total de " + (distanciaTrajeto / 1000).toFixed(1) + " quilômetros"
        else
          texto += " O trajeto tem um total de " + distanciaTrajeto.toFixed(0) + " metros"

        texto += " com um valor de " + this.solicitacaoCorridaEmQuestao.valorEstimado + " reais."

        texto += " Abra o APP para aceitar."

        this.tts.speak({ text: texto, locale: "pt-BR", rate: 1.4 });
      }).catch(err => console.log(JSON.stringify(err)));

      setTimeout(() => {
        this.backgroundMode.moveToForeground();
      }, 1000);
    });
  }

  getDistanceFromLatLonInM(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = this.deg2rad(lat2 - lat1);  // deg2rad below
    var dLon = this.deg2rad(lon2 - lon1);
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
      ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d * 1000;
  }

  deg2rad(deg) {
    return deg * (Math.PI / 180)
  }

  async endNotification() {
    try {
      this.platform.ready().then(x => {
        this.localNotifications.cancel(6832168431).catch(err => console.log(JSON.stringify(err)));

        this.nativeAudio.stop('mototextaxistamotoristaruncomming').catch(err => console.log(JSON.stringify(err)))
        this.tts.stop();
        this.vibration.vibrate(0);
      });
    } catch (err) {
      console.log(JSON.stringify(err));
    }
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
    this.powerManagement.dim()
    this.signalRService.startConnection();
    this.signalRService.getCurrentLocation(this.taxistaLogado.id, this);

    this.messageService.startConnection();
    this.messageService.listenMessages(this);

    this.solicitacaoServiceProvider.startConnection();
    this.solicitacaoServiceProvider.watchSolicitacoes(this.taxistaLogado.id, this);

    this.CatalogosService.solicitacaoCorrida.startTrackingChanges();

    this.CatalogosService.solicitacaoCorrida.changesSubject.subscribe(x => {

      if (this.solicitacaoCorridaEmQuestao) {
        x.updatedItems.forEach(async x => {
          var corrida: CorridaSummary
          await this.corridaService.ApiV1CorridaConsultaIdSolicitacaoCorridaByIdGet(this.solicitacaoCorridaEmQuestao.id).toPromise()
            .then(z => {
              if (z.success && z.data)
                corrida = z.data;
            });

          if (x.id == this.solicitacaoCorridaEmQuestao.id && (x.situacao == 2 || x.situacao == 4) && corrida && corrida.idTaxista != this.taxistaLogado.id
            && !this.global.accept && !this.global.running && !this.global.showDetails) {
            this.endNotification();
            this.solicitacaoCorridaEmQuestao = undefined;
            this.verificarFilaENotificar();
          } else {
            if (x.id == this.solicitacaoCorridaEmQuestao.id && x.situacao == 4) {
              this.endNotification();
              this.solicitacaoCorridaEmQuestao = undefined;
              this.verificarFilaENotificar();
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
          this.backgroundMode.disableBatteryOptimizations();
          this.backgroundMode.disableWebViewOptimizations();

          this.backgroundMode.configure({
            text: "Você está ativo, receberá chamados de corrida",
            title: "Ativo para receber chamados",
            ticker: "Você está ativo",
            resume: true,
            bigText: true,
            hidden: false,
            silent: false
          });

        });
      }
    });
  }

  async verificarFilaENotificar() {
    var solicitacao = this.filaSolicitacoes.shift();
    await this.solicitacaoCorridaService.ApiV1SolicitacaoCorridaByIdGet(solicitacao.id).toPromise()
      .then(x => {
        if (x.success) {
          solicitacao = x.data;
        }
      });
    if (solicitacao.situacao != 4 && solicitacao.situacao != 2) {
      this.notificarCorrida(solicitacao);
    } else if (this.filaSolicitacoes.length > 0) {
      await this.verificarFilaENotificar();
    }
  }

  disableBackground() {
    this.powerManagement.release();
    this.CatalogosService.solicitacaoCorrida.stopTrackingChanges();
    this.signalRService.disconnect();
    this.messageService.disconnect();
    this.solicitacaoServiceProvider.disconnect();
    if (this.backgroundMode.isActive && this.backgroundMode.isEnabled) {
      this.backgroundMode.disable();

      this.localNotifications.cancel(1);
    }
  }

}
