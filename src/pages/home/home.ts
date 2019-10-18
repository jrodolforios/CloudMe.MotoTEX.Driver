import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController,  ViewController, ModalController, AlertController, NavParams } from 'ionic-angular';
import { global } from '../../providers/global';
import { AuthGuard } from '../../auth/auth.guard';
import { OAuthService } from 'angular-oauth2-oidc';

declare var google;

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class Home {
  @ViewChild('map') mapElement: ElementRef;
  map: any;
  start = 'Hospital Philadelfia - Avenida Doutor Júlio Rodrigues - Marajoara, Teófilo Otoni - MG';
  end = 'Sebrae Minas - Avenida Francisco Sá - Centro, Teófilo Otoni - MG';
  directionsService = new google.maps.DirectionsService;
  directionsDisplay = new google.maps.DirectionsRenderer;
  showDetails;
  constructor(public navCtrl: NavController, private oauthService: OAuthService, public viewCtrl: ViewController, public modalCtrl: ModalController, public alertCtrl: AlertController, public global: global) {
    
  }

  ionViewDidLoad(){
    this.initMap();
  }
  initMap() {
    this.map = new google.maps.Map(this.mapElement.nativeElement, {
      zoom: 15,
      center: {lat: -17.8663175, lng: -41.5115479}
    });

    this.directionsDisplay.setMap(this.map);
  }

  ionViewCanEnter(){
    var authGuard: AuthGuard = new AuthGuard(this.navCtrl, this.oauthService)

    authGuard.canActivate();
  }

  calculateAndDisplayRoute() {
    this.directionsService.route({
      origin: this.start,
      destination: this.end,
      travelMode: 'DRIVING'
    }, (response, status) => {
      if (status === 'OK') {
        this.directionsDisplay.setDirections(response);
      } else {
        window.alert('Requisição de rota falhou: ' + status);
      }
    });
  }


//show details of trip
    activeTrip(){
      this.showDetails = !this.showDetails;
    }

//present destination trip
    presentDestinationModal() {
      let DestinationModal = this.modalCtrl.create('DestinationModal', { userId: 8675309 });
      DestinationModal.present();
      
    }

//present message
    presentMessageModal() {
      let MessageModal = this.modalCtrl.create('MessageModal');
      MessageModal.present();
    } 

// cancle trip
  cancelAlert() {
    let alert = this.alertCtrl.create({
      subTitle: 'Are you sure you want to cancel this trip?',
      buttons: ['No' , 'Yes']
    });
    alert.present();
  }       
  
}