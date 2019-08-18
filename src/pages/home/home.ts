import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController,  ViewController, ModalController, AlertController } from 'ionic-angular';
import { global } from '../../providers/global';

declare var google;

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class Home {
  @ViewChild('map') mapElement: ElementRef;
  map: any;
  start = 'chicago, il';
  end = 'chicago, il';
  directionsService = new google.maps.DirectionsService;
  directionsDisplay = new google.maps.DirectionsRenderer;
  showDetails;
  constructor(public navCtrl: NavController, public viewCtrl: ViewController, public modalCtrl: ModalController, public alertCtrl: AlertController, public global: global) {
    
  }

  ionViewDidLoad(){
    this.initMap();
  }
  initMap() {
    this.map = new google.maps.Map(this.mapElement.nativeElement, {
      zoom: 7,
      center: {lat: 41.85, lng: -87.65}
    });

    this.directionsDisplay.setMap(this.map);
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
        window.alert('Directions request failed due to ' + status);
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