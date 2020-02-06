import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as signalR from "@aspnet/signalr";
import { TaxistaService } from '../../core/api/to_de_taxi/services';
import { Platform, AlertController, ModalController } from 'ionic-angular';
import { OAuthService } from '../../../auth-oidc/src/oauth-service';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { AppServiceProvider } from '../app-service/app-service';
import { EmergenciaSummary, TaxistaSummary, SolicitacaoCorridaSummary } from '../../core/api/to_de_taxi/models';
import { CallNumber } from '@ionic-native/call-number/ngx';
import { LaunchNavigator } from '@ionic-native/launch-navigator/ngx';
/*
  Generated class for the SignalRserviceServiceProvider provider.
  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class SolicitacaoServiceProvider {
  private hubConnection: signalR.HubConnection
  private _reconnection_timeout = 15000;
  private intentionalTrackingStop = false;
  private idTaxista: string = ''
  private serviceProvider: AppServiceProvider;
  private solicitacaoAnterior: string;
  constructor(private taxistaService: TaxistaService,
    private platform: Platform,
    public alertCtrl: AlertController,
    public geolocation: Geolocation,
    private oAuthService: OAuthService,
    public modalCtrl: ModalController, ) {
  }
  public startConnection = () => {
    try {
      this.intentionalTrackingStop = false;
      if (this.hubConnection && this.hubConnection.state == signalR.HubConnectionState.Connected)
        return;
      this.hubConnection = new signalR.HubConnectionBuilder()
        .withUrl("https://api.mototex.cloudme.com.br/notifications", { accessTokenFactory: () => this.oAuthService.getAccessToken() })
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
          await self.watchSolicitacoes(this.idTaxista, this.serviceProvider);
        } catch (err) {
          console.log(JSON.stringify(err));
        }
      },
        self._reconnection_timeout);
    } catch (err) {
      console.log(JSON.stringify(err));
    }
  }
  public watchSolicitacoes = (taxistaId: string, localServiceProvider: AppServiceProvider) => {
    this.idTaxista = taxistaId;
    this.serviceProvider = localServiceProvider
    try {
      try {
        this.hubConnection.off("sol_corr_ativar_tx");
      }
      catch (err) {
        console.log(JSON.stringify(err));
      }
      this.hubConnection.on('sol_corr_ativar_tx', async (summary_solicitacao: SolicitacaoCorridaSummary) => {
        try {
          if (summary_solicitacao.situacao != 4 && this.solicitacaoAnterior != summary_solicitacao.id) {
            if (!this.serviceProvider.solicitacaoCorridaEmQuestao) {
              this.serviceProvider.notificarCorrida(summary_solicitacao);
            }
            else if (!this.serviceProvider.corridaEmQuestao) {
              if (!this.serviceProvider.filaSolicitacoes.find(x => x.id == summary_solicitacao.id))
                this.serviceProvider.filaSolicitacoes.push(summary_solicitacao);
            }
            this.solicitacaoAnterior = summary_solicitacao.id;
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