import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TaxistaSummary } from 'src/core/api/to_de_taxi/models';
import { ToastController } from 'ionic-angular';

/*
  Generated class for the AppServiceProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable({
  providedIn: 'root'
})
export class AppServiceProvider {
  originlatitude: any;
  originlongititude: any;
  
  directionlat: any;
  directionlng: any;

  taxistaLogado: TaxistaSummary;

  constructor(public http: HttpClient,
    public toastCtrl: ToastController,) {
   
  }

  async presentToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000
    });
    return toast;
  }

  formatData(d: Date) {
    var strData =
    ("00" + d.getDate()).slice(-2) + '/' +
    ("00" + (d.getMonth() + 1)).slice(-2) + "/" +
    d.getFullYear() + " " +       
    ("00" + d.getHours()).slice(-2) + ":" +
    ("00" + d.getMinutes()).slice(-2) + ":" +
    ("00" + d.getSeconds()).slice(-2);

    return strData;
  }

}