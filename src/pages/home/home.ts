import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, ViewController, ModalController, AlertController, NavParams, Platform, Loading, DateTime } from 'ionic-angular';
import { global } from '../../providers/global';
import { AuthGuard } from '../../auth/auth.guard';
import { OAuthService } from '../../../auth-oidc/src/oauth-service';
import { MouseEvent, MapsAPILoader, } from '@agm/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { AppServiceProvider } from '../../providers/app-service/app-service';
import { FormaPagamentoService, FaixaDescontoService, LocalizacaoService, CorridaService, PassageiroService, SolicitacaoCorridaService, TaxistaService, EmergenciaService, MensagemService, UsuarioService } from '../../core/api/to_de_taxi/services';
import { LaunchNavigator } from '@ionic-native/launch-navigator/ngx';
import { CallNumber } from '@ionic-native/call-number/ngx';
import { CatalogosService } from '../../providers/Catalogos/catalogos.service';
import { CorridaSummary } from '../../core/api/to_de_taxi/models';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import { MessageServiceProvider } from '../../providers/message-service/message-service';
import { Firebase } from '@ionic-native/firebase/ngx';
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

  public platformIOS: boolean = false;
  zoom = 15;
  private panicControlDate: Date = new Date();
  private panicControlTouchNumber: number = 0;

  public lat: number;
  public lng: number;
  public angulo: number;
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
    private usuarioService: UsuarioService,
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
    private emergenciaService: EmergenciaService,
    private mensagemService: MensagemService,
    private messageServiceProvider: MessageServiceProvider,
    private firebase: Firebase, ) {
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
        if (idCorridaEmAndamento != undefined && idCorridaEmAndamento != null) {
          await this.solicitacaoCorridaService.ApiV1SolicitacaoCorridaByIdGet(idCorridaEmAndamento).toPromise().then(async z => {
            if (z.success) {
              idCorridaEmAndamento = null;
              this.serviceProvider.corridaEmQuestao = corridaEmQuestaoParaProsseguir
              this.serviceProvider.solicitacaoCorridaEmQuestao = z.data

              await this.carregarDadosCorrida();
              this.global.accept = true;
              this.global.showDetails = true;
              if (this.serviceProvider.corridaEmQuestao.status == 3) {
                this.global.running = true;
              }


            }
          });
        } else {
          if (this.serviceProvider.solicitacaoCorridaEmQuestao == null || this.serviceProvider.solicitacaoCorridaEmQuestao == undefined) {
            this.serviceProvider.verificarFilaENotificar();
          }
        }
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
    var self = this;
    try {
      this.platformIOS = this.platform.is("ios");
      //this.platformIOS = true;
    } catch (err) {
      console.log(JSON.stringify(err));
    }
    this.initMap();
    var loading = await this.serviceProvider.loading("Aguarde...");
    loading.present();
    setTimeout(async () => {
      if (!this.serviceProvider.taxistaLogado || !this.serviceProvider.taxistaLogado.ativo) {
        const alert = await this.alertCtrl.create({
          title: 'Acesso não permitido',
          message: 'Você não pode acessar o app. Verifique se está logando essas credenciais no App correto.',
          enableBackdropDismiss: false,
          buttons: [
            {
              text: 'OK',
              handler: (blah) => {
                this.navCtrl.push("LogoutPage");
              }
            }
          ]
        });
        return await alert.present();
      }

      localStorage.setItem("IdUsuario", this.serviceProvider.taxistaLogado.usuario.id);
      this.firebase.getToken()
        .then(token => {
          self.usuarioService.ApiV1UsuarioInformarDeviceTokenByIdPost({ id: localStorage.getItem("IdUsuario"), token: token })
            .toPromise().then(x => {
            });

        }).catch(error => console.error('Error getting token', error));

      this.firebase.onTokenRefresh()
        .subscribe((token: string) => {
          self.usuarioService.ApiV1UsuarioInformarDeviceTokenByIdPost({ id: localStorage.getItem("IdUsuario"), token: token })
            .toPromise().then(x => {
            });
        });


      self.mensagemService.ApiV1MensagemObterEnviadasMarcarIdasPost(self.serviceProvider.taxistaLogado.usuario.id).toPromise().then(x => {
        if (x.success) {
          x.data.forEach(y => {
            self.messageServiceProvider.showMessage(y);
          });

        }
      });

      self.verificarCorridaEmAndamento();
    }, 5000);


    if ((this.serviceProvider.solicitacaoCorridaEmQuestao
      && this.serviceProvider.solicitacaoCorridaEmQuestao != null
      && (this.serviceProvider.solicitacaoCorridaEmQuestao.situacao == 1 || this.serviceProvider.solicitacaoCorridaEmQuestao.situacao == 0))
      || (this.serviceProvider.corridaEmQuestao && this.serviceProvider.corridaEmQuestao.status == 2)) {
      this.carregarDadosCorrida();
    }
    loading.dismiss();
  }

  async closeAPP(disponivel: boolean) {
    var textoAtivo: string = 'Tem certeza que deseja fechar o aplicativo e parar com as notificações de corrida?';
    if (disponivel)
      textoAtivo = 'Deseja ficar ativo para receber notificações de corridas?';
    const alert = await this.alertCtrl.create({
      title: disponivel ? 'Ficar ativo' : 'Ficar inativo',
      message: textoAtivo,
      buttons: [{
        text: 'Sim',
        handler: (blah) => {
          this.ficarDisponivel(disponivel);
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

  async ficarDisponivel(disponivel: boolean) {
    const loading = await this.serviceProvider.loading("Aguarde...");
    loading.present();
    await this.taxistaService.ApiV1TaxistaMarcarTaxistaDisponivelByIdGet({
      id: this.serviceProvider.taxistaLogado.id,
      disponivel: disponivel
    }).toPromise().then(async x => {
      if (x.success && x.data) {
        this.serviceProvider.taxistaLogado.disponivel = disponivel;

        if (this.serviceProvider.taxistaLogado.disponivel) {
          this.serviceProvider.enableBackground();
        } else {
          this.serviceProvider.disableBackground();
        }
      }
    });
    loading.dismiss();
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
    this.callNumber.callNumber("0" + this.telefonePassageiro.replace(/[^0-9]+/g, ''), true);
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
        return this.serviceProvider.fotoTaxista;
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

    this.global.showDetails = false;
    this.global.accept = false;
    this.global.running = false;

    this.serviceProvider.discartViagem();

    setTimeout(() => {
      this.serviceProvider.verificarFilaENotificar();
    }, 5000);
  }

  async initMap() {
    this.platform.ready().then(() => {
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
          this.angulo = resp.coords.heading;
        }

        this.serviceProvider.TaxistLat = resp.coords.latitude;
        this.serviceProvider.TaxistLng = resp.coords.longitude;
        this.serviceProvider.TaxistAngl = resp.coords.heading;

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
      this.global.showDetails = true;
    } else {
      var toast = await this.serviceProvider.presentToast("Nenhuma corrida para aceitar no momento.");
      toast.present();

      this.serviceProvider.verificarFilaENotificar();
    }

    this.serviceProvider.endNotification();
  }

  //present destination trip
  async presentDestinationModal() {
    this.serviceProvider.textoDestino = this.textoDestino;
    this.serviceProvider.textoOrigem = this.textoOrigem;
    this.serviceProvider.descDistanciaViagem = this.descDistanciaViagem;
    this.serviceProvider.descTempoViagem = this.descTempoViagem;
    this.serviceProvider.descValorCorrida = this.descValorCorrida;

    this.global.accept = true;

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

    //let DestinationModal = this.modalCtrl.create('DestinationModal', { userId: 8675309 });
    // DestinationModal.onDidDismiss(async () => {
    // });
    //DestinationModal.present();

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
      this.serviceProvider.filaSolicitacoes.length = 0;

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