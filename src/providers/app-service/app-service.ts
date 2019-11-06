import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TaxistaSummary } from 'src/core/api/to_de_taxi/models';

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

  constructor(public http: HttpClient) {
   
  }

}
