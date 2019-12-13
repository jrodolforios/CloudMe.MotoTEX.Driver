import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as signalR from "@aspnet/signalr";
import { TaxistaService } from '../../core/api/to_de_taxi/services';
import { Platform, AlertController, ModalController } from 'ionic-angular';
import { OAuthService } from '../../../auth-oidc/src/oauth-service';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { AppServiceProvider } from '../app-service/app-service';
import { EmergenciaSummary, TaxistaSummary } from '../../core/api/to_de_taxi/models';
import { CallNumber } from '@ionic-native/call-number/ngx';
import { LaunchNavigator } from '@ionic-native/launch-navigator/ngx';

/*
  Generated class for the SignalRserviceServiceProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class SignalRserviceServiceProvider {
  private hubConnection: signalR.HubConnection
  private _reconnection_timeout = 15000;
  private intentionalTrackingStop = false;
  private idTaxista: string = ''
  private serviceProvider: AppServiceProvider
  constructor(private taxistaService: TaxistaService,
    private platform: Platform,
    public alertCtrl: AlertController,
    public geolocation: Geolocation,
    private oAuthService: OAuthService,
    public modalCtrl: ModalController,) {
  }

  public startConnection = () => {
    try {
      this.intentionalTrackingStop = false;

      if (this.hubConnection && this.hubConnection.state == signalR.HubConnectionState.Connected)
        return;

      this.hubConnection = new signalR.HubConnectionBuilder()
        .withUrl("https://api.todetaxi.com.br/notifications/localizacao_taxista", { accessTokenFactory: () => this.oAuthService.getAccessToken() })
        .build();

      Object.defineProperty(WebSocket, 'OPEN', { value: 1, });

      this.hubConnection.onclose(() => {
        try {
          if (!this.intentionalTrackingStop) {
            this.reconnect();
          }
        } catch (err) {
          console.log(JSON.stringify(err));
        }
      });

      this.hubConnection
        .start()
        .then(() => console.log('Connection started'))
        .catch(err => {
          console.log(JSON.stringify(err));
          this.reconnect();
        })
    } catch (err) {
      console.log(JSON.stringify(err));
    }
  }
  private reconnect() {
    try {
      const self = this;
      setTimeout(async () => {
        try {
          await self.startConnection();
          await self.getCurrentLocation(this.idTaxista, this.serviceProvider);
        } catch (err) {
          console.log(JSON.stringify(err));
        }
      },
        self._reconnection_timeout);
    } catch (err) {
      console.log(JSON.stringify(err));
    }
  }


  public getCurrentLocation = (taxistaId: string, localServiceProvider: AppServiceProvider) => {
    this.idTaxista = taxistaId;
    this.serviceProvider = localServiceProvider
    try {
      try {
        this.hubConnection.off("EnviarLocalizacao");
      }
      catch (err) {
        console.log(JSON.stringify(err));
      }
      this.hubConnection.on('EnviarLocalizacao', async (data) => {
        try {
          var latitude: string = '';
          var longitude: string = '';

          this.taxistaService.ApiV1TaxistaInformarLocalizacaoByIdPost({
            id: this.idTaxista,
            localizacao: {
              latitude: this.serviceProvider.TaxistLat,
              longitude: this.serviceProvider.TaxistLng,
            }
          }).toPromise().then(x => {
            console.log(x.success)
          });
        } catch (err) {
          console.log(JSON.stringify(err));
        }
      });

      try {
        this.hubConnection.off("panico");
      }
      catch (err) {
        console.log(JSON.stringify(err));
      }
      this.hubConnection.on('panico', async (data: EmergenciaSummary) => {
        try {
          if (data.idTaxista != this.serviceProvider.taxistaLogado.id) {
            this.serviceProvider.emergenciaRecebida = data;
            this.serviceProvider.callNotification();
            
            let DestinationModal = this.modalCtrl.create('PanicPage', { userId: 8675309 });
            DestinationModal.present()
          }
        } catch (err) {
          console.log(JSON.stringify(err));
        }
      });
    } catch (err) {
      console.log(JSON.stringify(err));
    }
  }

  public disconnect = () => {
    try {
      this.intentionalTrackingStop = true;
      if (this.hubConnection && this.hubConnection.state == signalR.HubConnectionState.Connected)
        this.hubConnection.stop();
    } catch (err) {
      console.log(JSON.stringify(err));
    }
  }

}
