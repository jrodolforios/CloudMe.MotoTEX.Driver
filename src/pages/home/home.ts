import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, ViewController, ModalController, AlertController, NavParams, Platform } from 'ionic-angular';
import { global } from '../../providers/global';
import { AuthGuard } from '../../auth/auth.guard';
import { OAuthService } from '../../../auth-oidc/src/oauth-service';
import { MouseEvent, MapsAPILoader, } from '@agm/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { AppServiceProvider } from '../../providers/app-service/app-service';
import { FormaPagamentoService, FaixaDescontoService, LocalizacaoService } from '../../core/api/to_de_taxi/services';
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
  public descTituloTipoViagem: string = ''
  public descDistanciaViagem: string = '';
  public descTempoViagem: string = '';
  public descValorCorrida: string = '';
  public descFormaPagamento: string = '';
  public textoOrigem: string = '';
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
    private localizacaoService: LocalizacaoService) {
  }

  async ionViewDidLoad() {
    await this.initMap();
    if (await this.serviceProvider.encontrarCorrida()) {
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
            this.descDistanciaViagem = this.serviceProvider.solicitacaoCorridaEmQuestao.valorProposto.toFixed(2);
            break;
        }

        this.descTempoViagem = this.serviceProvider.formatedTimeHHMMss(this.serviceProvider.solicitacaoCorridaEmQuestao.eta)
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

        await this.calculateDistance(this.origin.lat, this.origin.lng, this.destination.lat, this.destination.lng);
      }
    }

  }

  async calculateDistance(origin_lat: any, origin_lng: any, dest_lat: any, dest_lng: any) {
    var encontrouADistancia: boolean = false;
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
        encontrouADistancia = true;
        // this.serviceProvider.timeDurationSeconds = timeDurationSec;
        // this.timeDuration = this.serviceProvider.formatedTimeHHMMss(timeDurationSec);
        // console.log(this.tripDistance);
      }, 3000);
  }

  getProfilePhoto() {
    try {
      if (this.serviceProvider && this.serviceProvider.taxistaLogado && this.serviceProvider.taxistaLogado.foto)
        return atob(this.serviceProvider.taxistaLogado.foto.dados);
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
    this.textoDestino = '';
    this.origin = undefined;
    this.destination = undefined;


    this.showDetails = false;
    this.serviceProvider.discartViagem();
  }

  async initMap() {
    await this.platform.ready().then(() => {
      //use the geolocation 
      this.geolocation.watchPosition({ maximumAge: 10000, timeout: 10000, enableHighAccuracy: true }).subscribe(resp => {
        const latLng = new google.maps.LatLng(resp.coords.latitude, resp.coords.longitude);
        const mapOptions = {
          center: latLng,
          zoom: 15,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        this.lat = resp.coords.latitude;
        this.lng = resp.coords.longitude;
        this.serviceProvider.originlatitude = this.lat;
        this.serviceProvider.originlongititude = this.lng;
        this.serviceProvider.directionlat = this.lat;
        this.serviceProvider.directionlng = this.lng;

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
    let DestinationModal = this.modalCtrl.create('DestinationModal', { userId: 8675309 });
    DestinationModal.present();

  }

  //present message
  presentMessageModal() {
    let MessageModal = this.modalCtrl.create('MessageModal');
    MessageModal.present();
  }

  // cancle trip
  cancelAlert() {
    let alert = this.alertCtrl.create({
      subTitle: 'Are you sure you want to cancel this trip?',
      buttons: ['No', 'Yes']
    });
    alert.present();
  }

}