import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as signalR from "@aspnet/signalr";
import { TaxistaService } from '../../core/api/to_de_taxi/services';
import { Platform } from 'ionic-angular';
import { OAuthService } from '../../../auth-oidc/src/oauth-service';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { AppServiceProvider } from '../app-service/app-service';

/*
  Generated class for the SignalRserviceServiceProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class SignalRserviceServiceProvider {
  private hubConnection: signalR.HubConnection
  private _reconnection_timeout = 5000;
  private intentionalTrackingStop = false;

  constructor(private taxistaService: TaxistaService,
    private platform: Platform,
    public geolocation: Geolocation,
    private oAuthService: OAuthService) {
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
        } catch (err) {
          console.log(JSON.stringify(err));
        }
      },
        self._reconnection_timeout);
    } catch (err) {
      console.log(JSON.stringify(err));
    }
  }


  public getCurrentLocation = (IdTaxista: string, serviceProvider: AppServiceProvider) => {
    try {
      this.hubConnection.on('EnviarLocalizacao', async (data) => {
        try {
          var latitude: string = '';
          var longitude: string = '';

          this.taxistaService.ApiV1TaxistaInformarLocalizacaoByIdPost({
            id: IdTaxista,
            localizacao: {
              latitude: serviceProvider.taxistLat,
              longitude: serviceProvider.Taxistlng,
            }
          }).toPromise().then(x => {
            console.log(x.success)
          });
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
