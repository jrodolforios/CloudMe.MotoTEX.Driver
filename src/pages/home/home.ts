import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, ViewController, ModalController, AlertController, NavParams, Platform } from 'ionic-angular';
import { global } from '../../providers/global';
import { AuthGuard } from '../../auth/auth.guard';
import { OAuthService } from '../../../auth-oidc/src/oauth-service';
import { MouseEvent, MapsAPILoader, } from '@agm/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { AppServiceProvider } from '../../providers/app-service/app-service';
import { FormaPagamentoService, FaixaDescontoService, LocalizacaoService, CorridaService, PassageiroService } from '../../core/api/to_de_taxi/services';
import { LaunchNavigator } from '@ionic-native/launch-navigator/ngx';
import { CallNumber } from '@ionic-native/call-number/ngx';
import { CatalogosService } from '../../providers/Catalogos/catalogos.service';
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
    private CatalogosService: CatalogosService,) {
  }

  async ionViewDidLoad() {
    if (this.serviceProvider.taxistaLogado && this.serviceProvider.taxistaLogado.disponivel)
      this.serviceProvider.enableBackground();
    else
      this.serviceProvider.disableBackground();

    await this.initMap();
    if (this.serviceProvider.solicitacaoCorridaEmQuestao
      && this.serviceProvider.solicitacaoCorridaEmQuestao != null
      && this.serviceProvider.solicitacaoCorridaEmQuestao.situacao == 1) {
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
    this.serviceProvider.corridaEmQuestao.status = 6
    this.serviceProvider.corridaEmQuestao.fim = (new Date()).toISOString();
    this.corridaService.ApiV1CorridaPut(this.serviceProvider.corridaEmQuestao).toPromise().then(x => { });

    this.global.running = false;
    this.global.accept = false;
    this.ignoreCorrida();
  }

  iniciarCorrida() {
    this.serviceProvider.corridaEmQuestao.status = 3
    this.serviceProvider.corridaEmQuestao.inicio = (new Date()).toISOString();
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

    this.showDetails = false;
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
      && this.serviceProvider.solicitacaoCorridaEmQuestao.situacao == 1) {
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
    DestinationModal.onDidDismiss(() => {
      if (this.global.accept == false && !this.serviceProvider.solicitacaoCorridaEmQuestao) {
        this.ignoreCorrida();
      } else{
        this.CatalogosService.corrida.startTrackingChanges();
        this.CatalogosService.corrida.changesSubject.subscribe(x =>{
          x.updatedItems.forEach(async y =>{
            if(y.id == this.serviceProvider.corridaEmQuestao.id){
              this.serviceProvider.corridaEmQuestao = y;

              if(this.serviceProvider.corridaEmQuestao.status == 5){
                this.ignoreCorrida();
                const alert = await this.alertCtrl.create({
                  title: 'Corrida cancelada',
                  message: 'A corrida foi cancelada pelo usuário',
                  buttons: [
                    {
                      text: 'Ok',
                      role: 'cancel',
                      cssClass: 'secondary',
                      handler: (blah) => {
                        // Classificar passageiro
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
            }
          })
        })
      }
    });
    DestinationModal.present();

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
    this.serviceProvider.corridaEmQuestao.status = 5;
    this.global.accept = false;
    this.corridaService.ApiV1CorridaPut(this.serviceProvider.corridaEmQuestao).toPromise().then(x => {
      if (!x.success)
        alert(JSON.stringify(x.notifications));
    });
  }

}