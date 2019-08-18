import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ActionSheetController } from 'ionic-angular';


@IonicPage()
@Component({
  selector: 'page-setting',
  templateUrl: 'setting.html',
})
export class Setting {

  constructor(public navCtrl: NavController, public navParams: NavParams,public actionSheetCtrl: ActionSheetController) {
  }

  presentEmergency() {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Emergency Contacts',
      buttons: [
        {
          text: 'Driver',
          role: 'Driver',
          handler: () => {
            console.log('Driver clicked');
          }
        },{
          text: 'Technical support',
          handler: () => {
            console.log('Technical clicked');
          }
        },{
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });
    actionSheet.present();
  }

}