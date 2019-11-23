import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, ViewController, ModalController, AlertController, NavParams, Platform, Loading } from 'ionic-angular';
import { global } from '../../providers/global';
import { AuthGuard } from '../../auth/auth.guard';
import { OAuthService } from '../../../auth-oidc/src/oauth-service';
import { MouseEvent, MapsAPILoader, } from '@agm/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { AppServiceProvider } from '../../providers/app-service/app-service';
import { FormaPagamentoService, FaixaDescontoService, LocalizacaoService, CorridaService, PassageiroService, SolicitacaoCorridaService } from '../../core/api/to_de_taxi/services';
import { LaunchNavigator } from '@ionic-native/launch-navigator/ngx';
import { CallNumber } from '@ionic-native/call-number/ngx';
import { CatalogosService } from '../../providers/Catalogos/catalogos.service';
import { CorridaSummary } from '../../core/api/to_de_taxi/models';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
declare var google;

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class Home {
  // @ViewChild('map', {static: false}) mapElement: ElementRef;
  // map: any;
  directionsService = new google.maps.DirectionsService;
  directionsDisplay = new google.maps.DirectionsRenderer;
  showDetails;
  zoom = 15;

  public lat: number;
  public lng: number;

  public descTipoViagem: string = '';
  public telefonePassageiro: string = '';
  public descTituloTipoViagem: string = ''
  public descDistanciaViagem: string = '';
  public descTempoViagem: string = '';
  public descValorCorrida: string = '';
  public descFormaPagamento: string = '';
  public textoOrigem: string = '';
  public nomePassageiro: string = ''
  public textoDestino: string = '';
  public origin: any;
  public destination: any;

  public markerOptions = {
    origin: {
      icon: '/assets/img/start.png',
      animation: '\'DROP\'',
    },
    destination: {
      icon: '/assets/img/finish.png',
      animation: '\'DROP\'',
    },
  }

  public renderOptions = {
    suppressMarkers: true,
  };


  constructor(public navCtrl: NavController,
    private oauthService: OAuthService,
    public viewCtrl: ViewController,
    public modalCtrl: ModalController,
    public alertCtrl: AlertController,
    public global: global,
    private mapsAPILoader: MapsAPILoader,
    public geolocation: Geolocation,
    private platform: Platform,
    private serviceProvider: AppServiceProvider,
    private formaPagamentoService: FormaPagamentoService,
    private faixaDescontoService: FaixaDescontoService,
    private localizacaoService: LocalizacaoService,
    private corridaService: CorridaService,
    private launchNavigator: LaunchNavigator,
    private callNumber: CallNumber,
    private passageiroService: PassageiroService,
    private CatalogosService: CatalogosService,
    private solicitacaoCorridaService: SolicitacaoCorridaService,
    private localNotifications: LocalNotifications, ) {
  }

  async ionViewDidLoad() {
    await this.initMap();
    if ((this.serviceProvider.solicitacaoCorridaEmQuestao
      && this.serviceProvider.solicitacaoCorridaEmQuestao != null
      && (this.serviceProvider.solicitacaoCorridaEmQuestao.situacao == 1 || this.serviceProvider.solicitacaoCorridaEmQuestao.situacao == 0))
      || this.serviceProvider.corridaEmQuestao.status == 2) {
      this.formaPagamentoService.ApiV1FormaPagamentoByIdGet(this.serviceProvider.solicitacaoCorridaEmQuestao.idFormaPagamento).toPromise()
        .then(x => {
          if (x.success)
            this.descFormaPagamento = x.data.descricao;
        });

      this.descTituloTipoViagem = this.serviceProvider.getTipoViagem(this.serviceProvider.solicitacaoCorridaEmQuestao.tipoAtendimento)

      switch (this.serviceProvider.solicitacaoCorridaEmQuestao.tipoAtendimento) {
        case 0:
          this.descTipoViagem = 'Indefinido';
          break;
        case 1:
          if (this.serviceProvider.solicitacaoCorridaEmQuestao.idFaixaDesconto != null
            && this.serviceProvider.solicitacaoCorridaEmQuestao.idFaixaDesconto != undefined) {
            this.faixaDescontoService.ApiV1FaixaDescontoByIdGet(this.serviceProvider.solicitacaoCorridaEmQuestao.idFaixaDesconto).toPromise()
              .then(x => {
                if (x.success)
                  this.descTipoViagem = x.data.descricao;
              });
          } else {
            this.descTipoViagem = "Sem desconto"
          }
          break;
        case 2:
          this.descTipoViagem = this.serviceProvider.formatData(new Date(this.serviceProvider.solicitacaoCorridaEmQuestao.data));
          break;
        case 3:
          this.descTipoViagem = "R$ " + this.serviceProvider.solicitacaoCorridaEmQuestao.valorProposto.toFixed(2);
          break;
      }

      this.descTempoViagem = this.serviceProvider.formatedTimeHHMM(this.serviceProvider.solicitacaoCorridaEmQuestao.eta)
      this.descValorCorrida = this.serviceProvider.solicitacaoCorridaEmQuestao.valorEstimado.toFixed(2);

      await this.localizacaoService.ApiV1LocalizacaoByIdGet(this.serviceProvider.solicitacaoCorridaEmQuestao.idLocalizacaoOrigem).toPromise().then(x => {
        if (x.success) {
          this.textoOrigem = x.data.nomePublico;
          this.origin = { lat: +x.data.latitude, lng: +x.data.longitude }
        }
      })

      await this.localizacaoService.ApiV1LocalizacaoByIdGet(this.serviceProvider.solicitacaoCorridaEmQuestao.idLocalizacaoDestino).toPromise().then(x => {
        if (x.success) {
          this.textoDestino = x.data.nomePublico;
          this.destination = { lat: +x.data.latitude, lng: +x.data.longitude }
        }
      })

      await this.passageiroService.ApiV1PassageiroByIdGet(this.serviceProvider.solicitacaoCorridaEmQuestao.idPassageiro).toPromise().then(x => {
        if (x.success)
          this.telefonePassageiro = x.data.usuario.telefone;
        this.nomePassageiro = x.data.usuario.nome;
      })

      await this.calculateDistance(this.origin.lat, this.origin.lng, this.destination.lat, this.destination.lng);
    }
  }

  async getPassageiro() {
    const alert = await this.alertCtrl.create({
      title: 'Iniciar Corrida',
      message: 'O passageiro já está embarcado e pronto para iniciar a corrida?',
      buttons: [
        {
          text: 'Começar corrida',
          cssClass: 'secondary',
          handler: (blah) => {
            this.iniciarCorrida();
          }
        },
        {
          text: 'Aguardar passageiro',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
          }
        }
      ]
    });
    return await alert.present();
  }

  async doneRun() {
    const alert = await this.alertCtrl.create({
      title: 'Finalizar corrida',
      message: 'Tem certeza que deseja finalizar a corrida de forma bem-sucedida?',
      buttons: [
        {
          text: 'Sim, finalizar',
          cssClass: 'secondary',
          handler: (blah) => {
            this.finalizarCorrida();
          }
        },
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
          }
        }
      ]
    });
    return await alert.present();
  }

  pausarCorrida() {
    let DestinationModal = this.modalCtrl.create('PauseCorridaPage');
    DestinationModal.present();
  }

  finalizarCorrida() {
    var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds

    this.serviceProvider.corridaEmQuestao.status = 6
    this.serviceProvider.corridaEmQuestao.fim = (new Date(Date.now() - tzoffset)).toISOString().slice(0, -1);
    this.corridaService.ApiV1CorridaPut(this.serviceProvider.corridaEmQuestao).toPromise().then(x => { });

    this.global.running = false;
    this.global.accept = false;
    this.ignoreCorrida();
  }

  iniciarCorrida() {
    var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds

    this.serviceProvider.corridaEmQuestao.status = 3
    this.serviceProvider.corridaEmQuestao.inicio = (new Date(Date.now() - tzoffset)).toISOString().slice(0, -1);
    this.corridaService.ApiV1CorridaPut(this.serviceProvider.corridaEmQuestao).toPromise().then(x => { });

    this.global.running = true;
  }

  callPassageiro() {
    this.callNumber.callNumber(this.telefonePassageiro.replace(/[^0-9]+/g, ''), true);
  }

  async calculateDistance(origin_lat: any, origin_lng: any, dest_lat: any, dest_lng: any) {
    var directionsService = new google.maps.DirectionsService();
    var routeDistance: number = 0;
    var timeDurationSec: number = 0;
    const _origin = new google.maps.LatLng(origin_lat, origin_lng);
    const _destination = new google.maps.LatLng(dest_lat, dest_lng);

    var request = {
      origin: _origin,
      destination: _destination,
      travelMode: google.maps.DirectionsTravelMode.DRIVING
    };

    await directionsService.route(request, function (response, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        routeDistance = (response.routes[0].legs[0].distance.value / 1000);
        timeDurationSec = parseInt(response.routes[0].legs[0].duration.value);
      }
    });

    setTimeout(() => {
      this.descDistanciaViagem = routeDistance.toFixed(1);
      // this.serviceProvider.timeDurationSeconds = timeDurationSec;
      // this.timeDuration = this.serviceProvider.formatedTimeHHMMss(timeDurationSec);
      // console.log(this.tripDistance);
    }, 3000);
  }

  async recusarCorrida() {
    if (this.serviceProvider.solicitacaoCorridaEmQuestao)
      await this.solicitacaoCorridaService.ApiV1SolicitacaoCorridaAcaoTaxistaByIdPost({
        id: '00000000-0000-0000-0000-000000000000',
        acao: 3,
        idSolicitacao: this.serviceProvider.solicitacaoCorridaEmQuestao.id,
        idTaxista: this.serviceProvider.taxistaLogado.id
      }).toPromise().then(x => {
        console.log(JSON.stringify(x));
      });
  }

  getProfilePhoto() {
    try {
      if (this.serviceProvider && this.serviceProvider.taxistaLogado && this.serviceProvider.fotoTaxista)
        return atob(this.serviceProvider.fotoTaxista);
      else
        return 'assets/img/user.png';
    } catch (e) {
      return 'assets/img/user.png';
    }
  }

  ignoreCorrida() {
    this.CatalogosService.corrida.stopTrackingChanges();
    this.descTipoViagem = '';
    this.descTituloTipoViagem = ''
    this.descDistanciaViagem = '';
    this.descTempoViagem = '';
    this.descValorCorrida = '';
    this.descFormaPagamento = '';
    this.textoOrigem = '';
    this.nomePassageiro = '';
    this.textoDestino = '';
    this.telefonePassageiro = '';
    this.origin = undefined;
    this.destination = undefined;

    this.serviceProvider.corridaEmQuestao = undefined;
    this.serviceProvider.solicitacaoCorridaEmQuestao = undefined;

    this.showDetails = false;
    this.global.accept = false;
    this.global.running = false;

    this.serviceProvider.discartViagem();
  }

  async initMap() {
    await this.platform.ready().then(() => {
      //use the geolocation 
      this.geolocation.watchPosition({ maximumAge: 10000, timeout: 10000, enableHighAccuracy: false }).subscribe(resp => {
        const latLng = new google.maps.LatLng(resp.coords.latitude, resp.coords.longitude);
        const mapOptions = {
          center: latLng,
          zoom: 15,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        if (!this.serviceProvider.solicitacaoCorridaEmQuestao || this.global.accept) {
          this.lat = resp.coords.latitude;
          this.lng = resp.coords.longitude;
        }

        this.serviceProvider.taxistLat = resp.coords.latitude;
        this.serviceProvider.Taxistlng = resp.coords.longitude;

        //loader.dismiss();
      });
    });
  }

  ionViewCanEnter() {
    var authGuard: AuthGuard = new AuthGuard(this.navCtrl, this.oauthService)

    authGuard.canActivate();
  }

  //show details of trip
  activeTrip() {
    if (this.serviceProvider.solicitacaoCorridaEmQuestao && this.serviceProvider.solicitacaoCorridaEmQuestao != null
      && (this.serviceProvider.solicitacaoCorridaEmQuestao.situacao == 1 || this.serviceProvider.solicitacaoCorridaEmQuestao.situacao == 0)) {
      this.showDetails = !this.showDetails;
    }

    this.serviceProvider.endNotification();
  }

  //present destination trip
  presentDestinationModal() {
    this.serviceProvider.textoDestino = this.textoDestino;
    this.serviceProvider.textoOrigem = this.textoOrigem;
    this.serviceProvider.descDistanciaViagem = this.descDistanciaViagem;
    this.serviceProvider.descTempoViagem = this.descTempoViagem;
    this.serviceProvider.descValorCorrida = this.descValorCorrida;

    let DestinationModal = this.modalCtrl.create('DestinationModal', { userId: 8675309 });
    DestinationModal.onDidDismiss(async () => {
      if (this.global.accept == false) {
        if (!this.global.accept) {
          this.ignoreCorrida();
          await this.solicitacaoCorridaService.ApiV1SolicitacaoCorridaAcaoTaxistaByIdPost({
            id: '00000000-0000-0000-0000-000000000000',
            acao: 3,
            idSolicitacao: this.serviceProvider.solicitacaoCorridaEmQuestao.id,
            idTaxista: this.serviceProvider.taxistaLogado.id
          }).toPromise().then(x => {
            console.log(JSON.stringify(x));
          });
        }
      } else {
        const loader = await this.serviceProvider.loading('Aguarde...');
        await loader.present();

        this.CatalogosService.corrida.startTrackingChanges()
        this.CatalogosService.corrida.changesSubject.subscribe(async x => {
          var idAdded: string = '';
          var idUpdated: string = '';

          await x.addedItems.forEach(async item => {
            if (idAdded != item.id) {
              idAdded = item.id;
              await this.realizarTratamentoAddCorrida(item, loader);
            }
          });

          await x.updatedItems.forEach(async item => {
            if (idUpdated != item.id) {
              idUpdated = item.id;
              await this.realizarTratamentoUpdateCorrida(item, loader);
            }
          })
        });

        this.corridaService.ApiV1CorridaConsultaIdSolicitacaoCorridaByIdGet(this.serviceProvider.solicitacaoCorridaEmQuestao.id)
        .toPromise().then(x =>{
          if(x.success && x.data){
            this.realizarTratamentoAddCorrida(x.data, loader);
            this.realizarTratamentoUpdateCorrida(x.data, loader);
          }
        })

        await this.solicitacaoCorridaService.ApiV1SolicitacaoCorridaAcaoTaxistaByIdPost({
          id: '00000000-0000-0000-0000-000000000000',
          acao: 2,
          idSolicitacao: this.serviceProvider.solicitacaoCorridaEmQuestao.id,
          idTaxista: this.serviceProvider.taxistaLogado.id
        }).toPromise().then(async x => {
          if (!x.success || !x.data)
            this.ignoreCorrida();
          console.log(JSON.stringify(x));
        });

      }
    });
    DestinationModal.present();

  }
  realizarTratamentoUpdateCorrida(item: CorridaSummary, loader: Loading) {
    if(this.serviceProvider.corridaEmQuestao.id == item.id){
      if(loader) loader.dismiss();

      if(item.status == 5 )
        this.showCorridaCanceladaPeloUsuario();
    }
  }
  async realizarTratamentoAddCorrida(item: CorridaSummary, loader: Loading) {
    if (item.idTaxista == this.serviceProvider.taxistaLogado.id
      && item.idSolicitacao == this.serviceProvider.solicitacaoCorridaEmQuestao.id) {
        if(loader) loader.dismiss();
      if (this.serviceProvider.solicitacaoCorridaEmQuestao.tipoAtendimento == 2 ) {
        var random: number = Math.random()
        this.localNotifications.schedule({
          id: random,
          title: 'Corrida agendada',
          text: 'Você tem uma corrida agendada para agora. Abra o app e vá até seus agendamentos e inicie a corrida.',
          trigger: {at: new Date(this.serviceProvider.solicitacaoCorridaEmQuestao.data)},
        });

        await this.showAlertCorridaAgendada();
      }
      this.serviceProvider.corridaEmQuestao = item;

    } else if (item.idTaxista != this.serviceProvider.taxistaLogado.id
      && item.idSolicitacao == this.serviceProvider.solicitacaoCorridaEmQuestao.id) {
        if(loader) loader.dismiss();
      await this.showAlertCorridaOutroTaxista();
    }
  }

  async showCorridaCanceladaPeloUsuario() {
    const alert = await this.alertCtrl.create({
      title: 'Corrida cancelada',
      message: 'O passageiro cancelou a corrida.',
      buttons: [
        {
          text: 'Ok',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            this.ignoreCorrida();

            //TODO: Qualificar corrida;
          }
        }
      ]
    });
    return await alert.present();
  }

  async showAlertCorridaOutroTaxista() {
    const alert = await this.alertCtrl.create({
      title: 'Corrida já aceita por outro taxista',
      message: 'Essa corrida já foi aceita por outro taxista. Aguarde um novo chamado',
      buttons: [
        {
          text: 'Ok',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            this.ignoreCorrida();
          }
        }
      ]
    });
    return await alert.present();
  }

  async showAlertCorridaAgendada() {
    const alert = await this.alertCtrl.create({
      title: 'A corrida foi agendada',
      message: 'A corrida foi agendada, fique atento para não perder o horário.',
      buttons: [
        {
          text: 'Ok',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            this.ignoreCorrida();
          }
        }
      ]
    });
    return await alert.present();
  }

  navigateTo() {
    if (this.global.accept && !this.global.running) {
      this.launchNavigator.navigate([this.origin.lat, this.origin.lng], {
        app: this.launchNavigator.APP.GOOGLE_MAPS
      });
    } else if (this.global.accept && this.global.running) {
      this.launchNavigator.navigate([this.destination.lat, this.destination.lng], {
        app: this.launchNavigator.APP.GOOGLE_MAPS
      });
    }
  }

  //present message
  presentMessageModal() {
    let MessageModal = this.modalCtrl.create('MessageModal');
    MessageModal.present();
  }

  // cancle trip
  async cancelAlert() {
    const alert = await this.alertCtrl.create({
      title: 'Deseja mesmo cancelar essa via corrida?',
      message: 'Cancelando essa corrida agora, o passageiro poderá te qualificar.',
      buttons: [
        {
          text: 'Cancelar mesmo assim',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            this.ignoreCorrida();

            this.cancelarCorrida();
          }
        },
        {
          text: 'Continuar corrida',
          cssClass: 'secondary',
          handler: (blah) => {
          }
        }
      ]
    });
    return await alert.present();
  }

  cancelarCorrida() {
    this.CatalogosService.corrida.stopTrackingChanges();
    this.serviceProvider.corridaEmQuestao.status = 5;
    this.global.accept = false;
    this.corridaService.ApiV1CorridaPut(this.serviceProvider.corridaEmQuestao).toPromise().then(x => {
      if (!x.success)
        alert(JSON.stringify(x.notifications));
    });
  }

}