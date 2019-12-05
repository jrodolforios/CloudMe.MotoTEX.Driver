import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as signalR from "@aspnet/signalr";
import { OAuthService } from '../../../auth-oidc/src/oauth-service';
import { AppServiceProvider } from '../app-service/app-service';
import { DetalhesMensagem } from '../../core/api/to_de_taxi/models';
import { MensagemService } from '../../core/api/to_de_taxi/services';
import { AlertController } from 'ionic-angular';
/*
  Generated class for the MessageServiceProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class MessageServiceProvider {
  private hubConnection: signalR.HubConnection;
  private serviceProvider: AppServiceProvider;
  private _reconnection_timeout = 5000;
  private intentionalTrackingStop = false;
  constructor(public http: HttpClient,
    private oAuthService: OAuthService,
    private mensagemService: MensagemService,
    public alertCtrl: AlertController, ) {
    console.log('Hello MessageServiceProvider Provider');
  }

  public startConnection = () => {
    try {
      this.intentionalTrackingStop = false;

      if (this.hubConnection && this.hubConnection.state == signalR.HubConnectionState.Connected)
        return;

      this.hubConnection = new signalR.HubConnectionBuilder()
        .withUrl("https://api.todetaxi.com.br/notifications/mensagens", { accessTokenFactory: () => this.oAuthService.getAccessToken() })
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
          await self.listenMessages(this.serviceProvider);
        } catch (err) {
          console.log(JSON.stringify(err));
        }
      },
        self._reconnection_timeout);
    } catch (err) {
      console.log(JSON.stringify(err));
    }
  }

  public listenMessages = (localServiceProvider: AppServiceProvider) => {
    this.serviceProvider = localServiceProvider
    try {
      try {
        this.hubConnection.off("msg_usr");
      }
      catch (err) {
        console.log(JSON.stringify(err));
      }
      this.hubConnection.on('msg_usr', async (data: DetalhesMensagem) => {
        this.mensagemService.ApiV1MensagemAlterarStatusMsgPost({
          idMensagem: data.idMensagem,
          idUsuario: this.serviceProvider.taxistaLogado.usuario.id,
          status: 4
        });

        if (data && !data.dataLeitura) {
          this.showMessage(data);
        }

      });

      try {
        this.hubConnection.off("msg_grp_usr");
      }
      catch (err) {
        console.log(JSON.stringify(err));
      }
      this.hubConnection.on('msg_grp_usr', async (data: DetalhesMensagem) => {
        this.mensagemService.ApiV1MensagemAlterarStatusMsgPost({
          idMensagem: data.idMensagem,
          idUsuario: this.serviceProvider.taxistaLogado.usuario.id,
          status: 4
        });

        if (data && !data.dataLeitura) {
          this.showMessage(data);
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

  async showMessage(message: DetalhesMensagem) {
    const alert = await this.alertCtrl.create({
      title: message.assunto,
      message: message.corpo,
      buttons: [
        {
          text: 'Fechar',
          handler: (blah) => {

          }
        }
      ]
    });
    return await alert.present();
  }
}
