import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import $ from "jquery";
import 'intl-tel-input';


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
    let telInput = $("#phone");

    telInput.intlTelInput();
    // listen to "keyup", but also "change" to update when the user selects a country
    telInput.on("keyup change", function() {
      // var intlNumber = telInput.intlTelInput("getNumber");
    });
  }

}