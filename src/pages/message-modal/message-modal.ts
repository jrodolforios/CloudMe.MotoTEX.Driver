import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { MensagemService } from '../../core/api/to_de_taxi/services';
import { AppServiceProvider } from '../../providers/app-service/app-service';


@IonicPage()
@Component({
  selector: 'page-message-modal',
  templateUrl: 'message-modal.html',
})
export class MessageModal {

  messages: Array<any>;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public viewCtrl: ViewController,
    private mensagemService: MensagemService,
    private serviceProvider: AppServiceProvider) {
    this.messages = [{text: 'Estou te esperando'}, {text: 'Estou à caminho'}, {text: 'Esperarei 5 minutos'}, {text: 'Obrigado!'}]
  }

  enviarMensagem(mensage: string){
    this.mensagemService.ApiV1MensagemEnviarPost({
      destinatarios:{
        idsUsuarios: [this.serviceProvider.idUsuarioPassageiro],
        idsGruposUsuarios: [ ]
      },
      mensagem: {
        id: '00000000-0000-0000-0000-000000000000',
        assunto: "Mensagem de corrida",
        corpo: mensage,
        idRemetente: this.serviceProvider.taxistaLogado.usuario.id
      },
    }).toPromise().then(x=>{
      console.log(JSON.stringify(x));

    });
  }

// close Modal
  dismiss() {
    this.viewCtrl.dismiss();
  }

}