import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import $ from "jquery";


@IonicPage()
@Component({
  selector: 'page-register',
  templateUrl: 'register.html',
})
export class Register {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

// back function
  backButtonClick(){
    this.navCtrl.pop();
  }

// intlTelInput for select country id
  ngOnInit(): any {

  }

}