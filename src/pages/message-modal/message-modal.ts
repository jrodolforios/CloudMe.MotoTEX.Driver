import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';


@IonicPage()
@Component({
  selector: 'page-message-modal',
  templateUrl: 'message-modal.html',
})
export class MessageModal {

  messages: Array<any>;

  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController) {
    this.messages = [{text: 'Estou te esperando'}, {text: 'Estou à caminho'}, {text: 'Esperarei 5 minutos'}, {text: 'Obrigado!'}]
  }

// close Modal
  dismiss() {
    this.viewCtrl.dismiss();
  }

}