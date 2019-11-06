import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController,  ViewController, ModalController, AlertController, NavParams, Platform } from 'ionic-angular';
import { global } from '../../providers/global';
import { AuthGuard } from '../../auth/auth.guard';
import { OAuthService } from '../../../auth-oidc/src/oauth-service';
import { MouseEvent, MapsAPILoader, } from '@agm/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { AppServiceProvider } from '../../providers/app-service/app-service';
declare var google;

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class Home {
  // @ViewChild('map', {static: false}) mapElement: ElementRef;
  // map: any;
  start = 'Hospital Philadelfia - Avenida Doutor Júlio Rodrigues - Marajoara, Teófilo Otoni - MG';
  end = 'Sebrae Minas - Avenida Francisco Sá - Centro, Teófilo Otoni - MG';
  directionsService = new google.maps.DirectionsService;
  directionsDisplay = new google.maps.DirectionsRenderer;
  showDetails;
  zoom = 15;

  public lat: number;
  public lng: number;

  constructor(public navCtrl: NavController,
    private oauthService: OAuthService,
    public viewCtrl: ViewController,
    public modalCtrl: ModalController,
    public alertCtrl: AlertController,
    public global: global,
    private mapsAPILoader: MapsAPILoader,
    public geolocation: Geolocation,
    private platform: Platform,
    private serviceProvider: AppServiceProvider) {
    
  }

  async ionViewDidLoad(){
    await this.initMap();
  }
  async initMap() {
    await this.platform.ready().then(() => {
      //use the geolocation 
      this.geolocation.getCurrentPosition({ maximumAge: 10000, timeout: 10000, enableHighAccuracy: true }).then(resp => {
          const latLng = new google.maps.LatLng(resp.coords.latitude, resp.coords.longitude);
          const mapOptions = {
            center: latLng,
            zoom: 15,
            mapTypeId: google.maps.MapTypeId.ROADMAP
          };
          this.lat = resp.coords.latitude;
          this.lng = resp.coords.longitude;
          this.serviceProvider.originlatitude = this.lat;
          this.serviceProvider.originlongititude = this.lng;
          this.serviceProvider.directionlat = this.lat;
          this.serviceProvider.directionlng = this.lng;

          //loader.dismiss();
      }).catch((error) => {
        //loader.dismiss();
        //this.getCurrentLocation();
      });
    });
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