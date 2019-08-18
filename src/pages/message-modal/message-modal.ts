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
    this.messages = [{text: 'I”m waiting.'}, {text: 'I”m on my way.'}, {text: 'I wait 5 minutes.'}, {text: 'Thanks.'}]
  }

// close Modal
  dismiss() {
    this.viewCtrl.dismiss();
  }

}