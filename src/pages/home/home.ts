import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, ViewController, ModalController, AlertController, NavParams, Platform, Loading, DateTime } from 'ionic-angular';
import { global } from '../../providers/global';
import { AuthGuard } from '../../auth/auth.guard';
import { OAuthService } from '../../../auth-oidc/src/oauth-service';
import { MouseEvent, MapsAPILoader, } from '@agm/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { AppServiceProvider } from '../../providers/app-service/app-service';
import { FormaPagamentoService, FaixaDescontoService, LocalizacaoService, CorridaService, PassageiroService, SolicitacaoCorridaService, TaxistaService, EmergenciaService } from '../../core/api/to_de_taxi/services';
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
  public platformIOS: boolean = false;
  zoom = 15;
  private panicControlDate: Date = new Date();
  private panicControlTouchNumber: number = 0;

  public lat: number;
  public lng: number;
  private loader: any;

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
    private localNotifications: LocalNotifications,
    private taxistaService: TaxistaService,
    private emergenciaService: EmergenciaService) {
  }

  async verificarCorridaEmAndamento() {
    var corridaEmQuestaoParaProsseguir: CorridaSummary;
    var idCorridaEmAndamento: string
    await this.corridaService.ApiV1CorridaConsultaIdTaxistaByIdGet(this.serviceProvider.taxistaLogado.id).toPromise().then(async x => {
      if (x.success) {
        await x.data.forEach(async y => {
          if (y.status == 2 || y.status == 3 || y.status == 4) {
            idCorridaEmAndamento = y.idSolicitacao;
            corridaEmQuestaoParaProsseguir = y;
          }
        });
        if (idCorridaEmAndamento != undefined && idCorridaEmAndamento != null)
          await this.solicitacaoCorridaService.ApiV1SolicitacaoCorridaByIdGet(idCorridaEmAndamento).toPromise().then(async z => {
            if (z.success) {
              idCorridaEmAndamento = null;
              this.serviceProvider.corridaEmQuestao = corridaEmQuestaoParaProsseguir
              this.serviceProvider.solicitacaoCorridaEmQuestao = z.data

              await this.carregarDadosCorrida();
              this.global.accept = true;
              this.showDetails = true;
              if (this.serviceProvider.corridaEmQuestao.status == 3) {
                this.global.running = true;
              }


            }
          })
      }
    });
  }

  profileButtonAction() {
    if (this.platformIOS)
      this.callPanic();
    else
      this.navCtrl.push("Profile");
  }

  async carregarDadosCorrida() {
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

    if (this.serviceProvider.solicitacaoCorridaEmQuestao.isInterUrbano)
      this.descValorCorrida = "Interurbana"
    else
      this.descValorCorrida = "R$" + this.serviceProvider.solicitacaoCorridaEmQuestao.valorEstimado.toFixed(2);

    this.localizacaoService.ApiV1LocalizacaoByIdGet(this.serviceProvider.solicitacaoCorridaEmQuestao.idLocalizacaoOrigem).toPromise().then(x => {
      if (x.success) {
        this.textoOrigem = x.data.nomePublico;
        this.origin = { lat: +x.data.latitude, lng: +x.data.longitude }

        this.localizacaoService.ApiV1LocalizacaoByIdGet(this.serviceProvider.solicitacaoCorridaEmQuestao.idLocalizacaoDestino).toPromise().then(x => {
          if (x.success) {
            this.textoDestino = x.data.nomePublico;
            this.destination = { lat: +x.data.latitude, lng: +x.data.longitude }

            this.calculateDistance(this.origin.lat, this.origin.lng, this.destination.lat, this.destination.lng);
          }
        })
      }
    })

    this.passageiroService.ApiV1PassageiroByIdGet(this.serviceProvider.solicitacaoCorridaEmQuestao.idPassageiro).toPromise().then(x => {
      if (x.success)
        this.telefonePassageiro = x.data.usuario.telefone;
      this.nomePassageiro = x.data.usuario.nome;
      this.serviceProvider.idUsuarioPassageiro = x.data.usuario.id;
    })
  }

  async ionViewDidLoad() {
    try {
      this.platformIOS = this.platform.is("ios");
      //this.platformIOS = true;
    } catch (err) {
      console.log(JSON.stringify(err));
    }
    await this.initMap();
    var loading = await this.serviceProvider.loading("Aguarde...");
    loading.present();
    setTimeout(() => {
      this.verificarCorridaEmAndamento();
    }, 5000);


    if ((this.serviceProvider.solicitacaoCorridaEmQuestao
      && this.serviceProvider.solicitacaoCorridaEmQuestao != null
      && (this.serviceProvider.solicitacaoCorridaEmQuestao.situacao == 1 || this.serviceProvider.solicitacaoCorridaEmQuestao.situacao == 0))
      || (this.serviceProvider.corridaEmQuestao && this.serviceProvider.corridaEmQuestao.status == 2)) {
      await this.carregarDadosCorrida();
    }
    loading.dismiss();
  }

  async closeAPP() {
    const alert = await this.alertCtrl.create({
      title: 'Parar notificações',
      message: 'Tem certeza que deseja fechar o aplicativo e parar com as notificações de corrida?',
      buttons: [{
        text: 'Sim',
        handler: (blah) => {
          this.taxistaService.ApiV1TaxistaMarcarTaxistaDisponivelByIdGet({
            id: this.serviceProvider.taxistaLogado.id,
            disponivel: false
          }).toPromise().then(async x => {
            if (x.success && x.data) {
              this.serviceProvider.taxistaLogado.disponivel = false;

              if (this.serviceProvider.taxistaLogado.disponivel) {
                this.serviceProvider.enableBackground();
              } else {
                this.serviceProvider.disableBackground();
              }

              this.platform.exitApp();
            }
          });
        }
      },
      {
        text: 'Não',
        cssClass: 'secondary',
        role: 'cancel',
        handler: (blah) => {
        }
      }]
    });
    return await alert.present();
  }

  async callPanic() {
    if (!this.panicControlDate || (this.panicControlDate.getTime() + 5000) < (new Date()).getTime()) {
      this.panicControlDate = new Date();
      this.panicControlTouchNumber = 1;
    } else if ((this.panicControlDate.getTime() + 5000) > (new Date()).getTime()) {
      this.panicControlTouchNumber++;

      if (this.panicControlTouchNumber >= 5) {
        this.panicControlTouchNumber = 0;
        this.panicControlDate = new Date();

        this.loader = await this.serviceProvider.loading('Aguarde...');
        await this.loader.present();

        await this.emergenciaService.ApiV1EmergenciaPanicoPost({
          idTaxista: this.serviceProvider.taxistaLogado.id,
          latitude: this.serviceProvider.TaxistLat,
          longitude: this.serviceProvider.TaxistLng
        }).toPromise().then(x => {
          if (!x.success || !x.data)
            console.log("erro no envio do panico");
        })

        setTimeout(() => {
          this.loader.dismiss();
        }, 5000);
      }
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
    this.serviceProvider.IdCorridaParaClassificacao = this.serviceProvider.corridaEmQuestao.id;
    let ratingModal = this.modalCtrl.create('RatingPage');
    ratingModal.present();

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
    if (this.serviceProvider.corridaSubscriber) {
      this.serviceProvider.corridaSubscriber.unsubscribe();
      this.serviceProvider.corridaSubscriber = undefined;
    }
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

        this.serviceProvider.TaxistLat = resp.coords.latitude;
        this.serviceProvider.TaxistLng = resp.coords.longitude;

        //loader.dismiss();
      });
    });
  }

  ionViewCanEnter() {
    var authGuard: AuthGuard = new AuthGuard(this.navCtrl, this.oauthService, this.serviceProvider)

    authGuard.canActivate();
  }

  //show details of trip
  async activeTrip() {
    if (this.serviceProvider.solicitacaoCorridaEmQuestao && this.serviceProvider.solicitacaoCorridaEmQuestao != null
      && (this.serviceProvider.solicitacaoCorridaEmQuestao.situacao == 1 || this.serviceProvider.solicitacaoCorridaEmQuestao.situacao == 0)) {
      this.showDetails = !this.showDetails;
    } else {
      var toast = await this.serviceProvider.presentToast("Nenhuma corrida para aceitar no momento.");
      toast.present();
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
        this.loader = await this.serviceProvider.loading('Aguarde...');
        await this.loader.present();

        this.CatalogosService.corrida.startTrackingChanges()
        this.serviceProvider.corridaSubscriber = this.CatalogosService.corrida.changesSubject.subscribe(async x => {
          var idAdded: string = '';
          var idUpdated: string = '';

          await x.addedItems.forEach(async item => {
            if (idAdded != item.id) {
              idAdded = item.id;
              await this.realizarTratamentoAddCorrida(item);
            }
          });

          this.corridaService.ApiV1CorridaConsultaIdSolicitacaoCorridaByIdGet(this.serviceProvider.solicitacaoCorridaEmQuestao.id)
            .toPromise().then(x => {
              if (x.success && x.data) {
                this.realizarTratamentoUpdateCorrida(x.data);
              }
            })

          // await x.updatedItems.forEach(async item => {
          //   if (idUpdated != item.id) {
          //     idUpdated = item.id;
          //     await this.realizarTratamentoUpdateCorrida(item, loader);
          //   }
          // })
        });

        setTimeout(() => {
          if (!this.serviceProvider.corridaEmQuestao)
            this.corridaService.ApiV1CorridaConsultaIdSolicitacaoCorridaByIdGet(this.serviceProvider.solicitacaoCorridaEmQuestao.id)
              .toPromise().then(x => {
                if (x.success && x.data) {
                  this.realizarTratamentoAddCorrida(x.data);
                  this.realizarTratamentoUpdateCorrida(x.data);
                }
              })
        }, 5000);

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
  async realizarTratamentoUpdateCorrida(item: CorridaSummary) {
    if (item.idTaxista != this.serviceProvider.taxistaLogado.id
      && item.idSolicitacao == this.serviceProvider.solicitacaoCorridaEmQuestao.id) {
      if (this.loader) this.loader.dismiss();
      await this.showAlertCorridaOutroTaxista();
      this.ignoreCorrida();
    } else if (this.serviceProvider.corridaEmQuestao && this.serviceProvider.corridaEmQuestao.id == item.id) {
      if (this.loader) this.loader.dismiss();

      this.serviceProvider.corridaEmQuestao = item;

      if ((this.serviceProvider.solicitacaoCorridaEmQuestao.tipoAtendimento == 2
        && this.serviceProvider.solicitacaoCorridaEmQuestao.isInterUrbano
        && this.serviceProvider.solicitacaoCorridaEmQuestao.valorProposto > 0
        && this.serviceProvider.corridaEmQuestao.status == 1)
        || (this.serviceProvider.solicitacaoCorridaEmQuestao.tipoAtendimento == 2
          && !this.serviceProvider.solicitacaoCorridaEmQuestao.isInterUrbano)) {
        var random: number = Math.random()
        this.localNotifications.schedule({
          id: random,
          title: 'Corrida agendada',
          text: 'Você tem uma corrida agendada para agora. Abra o app e vá até seus agendamentos e inicie a corrida.',
          trigger: { at: new Date(this.serviceProvider.solicitacaoCorridaEmQuestao.data) },
        });
        this.ignoreCorrida();
        this.showAlertCorridaAgendada();
      }

      if (item.status == 5) {
        await this.showCorridaCanceladaPeloUsuario();
        this.ignoreCorrida();
      }
    }
  }
  async realizarTratamentoAddCorrida(item: CorridaSummary) {
    if (item.idTaxista == this.serviceProvider.taxistaLogado.id
      && item.idSolicitacao == this.serviceProvider.solicitacaoCorridaEmQuestao.id) {
      if (this.loader) this.loader.dismiss();

      this.serviceProvider.corridaEmQuestao = item;

      if (this.serviceProvider.solicitacaoCorridaEmQuestao.tipoAtendimento == 2
        && this.serviceProvider.solicitacaoCorridaEmQuestao.isInterUrbano
        && !(this.serviceProvider.solicitacaoCorridaEmQuestao.valorProposto > 0)
        && this.serviceProvider.corridaEmQuestao != 7) {
        item.status = 7

        await this.corridaService.ApiV1CorridaPut(item).toPromise().then(x => console.log(JSON.stringify(x)));

        let DestinationModal = this.modalCtrl.create('EnviaPropostaPage');
        DestinationModal.onDidDismiss(async () => {
          this.loader = await this.serviceProvider.loading('Aguarde...');
          this.loader.present();
        })
        DestinationModal.present();
      } else if (this.serviceProvider.solicitacaoCorridaEmQuestao.tipoAtendimento == 2) {
        var random: number = Math.random()
        this.localNotifications.schedule({
          id: random,
          title: 'Corrida agendada',
          text: 'Você tem uma corrida agendada para agora. Abra o app e vá até seus agendamentos e inicie a corrida.',
          trigger: { at: new Date(this.serviceProvider.solicitacaoCorridaEmQuestao.data) },
        });
        this.ignoreCorrida();
        await this.showAlertCorridaAgendada();
      }
    } else if (item.idTaxista != this.serviceProvider.taxistaLogado.id
      && item.idSolicitacao == this.serviceProvider.solicitacaoCorridaEmQuestao.id) {
      if (this.loader) this.loader.dismiss();
      await this.showAlertCorridaOutroTaxista();
      this.ignoreCorrida();
    }
  }

  async showCorridaCanceladaPeloUsuario() {
    this.serviceProvider.IdCorridaParaClassificacao = this.serviceProvider.corridaEmQuestao.id;
    const alert = await this.alertCtrl.create({
      title: 'Corrida cancelada',
      message: 'O passageiro cancelou a corrida.',
      buttons: [
        {
          text: 'Ok',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            let ratingModal = this.modalCtrl.create('RatingPage');
            ratingModal.present();
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
      message: 'Essa corrida já foi direcionada para outro taxista. Aguarde um novo chamado',
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
            this.serviceProvider.IdCorridaParaClassificacao = this.serviceProvider.corridaEmQuestao.id;
            let ratingModal = this.modalCtrl.create('RatingPage');
            ratingModal.present();

            this.cancelarCorrida();
            this.ignoreCorrida();
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
    this.corridaService.ApiV1CorridaPut(this.serviceProvider.corridaEmQuestao).toPromise().then(x => {
      if (!x.success)
        alert(JSON.stringify(x.notifications));
    });
  }

}