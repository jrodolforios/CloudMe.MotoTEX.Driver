import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { global } from '../../providers/global';


@IonicPage()
@Component({
  selector: 'page-destination-modal',
  templateUrl: 'destination-modal.html',
})
export class DestinationModal {

  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController, public global: global) {
  }

 // Active Accept Trip function
 AcceptTrip(){
    console.log(this.global.accept)
    this.global.accept = true;
  }

  // close Modal
  dismiss() {
    this.viewCtrl.dismiss();
  }

}