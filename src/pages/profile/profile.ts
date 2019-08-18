import { Component, Renderer } from '@angular/core';
import { IonicPage, NavController, ViewController } from 'ionic-angular';
import $ from "jquery";
import 'intl-tel-input';
@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class Profile {

  tabs = "history";
  history: Array<any>;
  notification: Array<any>;
  notify: Array<any>;
  headerbg: any;
  darkHeader: any;
  public isDisabled:boolean = true;


  constructor(public navCtrl: NavController, public viewCtrl: ViewController, public renderer: Renderer) {
    this.history =[{from: '243 Joanie Pine', to: '8753 Mauricio Walks', date: 'Today at 3:26 pm', cash: '$ 50.13'}, {from: '243 Joanie Pine', to: '8753 Mauricio Walks', date: 'Today at 3:26 pm', cash: '$ 50.13'}]

    this.notify =[{from: '243 Joanie Pine', to: '8753 Mauricio Walks', date: 'Today at 3:26 pm'}]
  }


  // remove item of list
  removeItem(item){
    for(var i = 0; i < this.notify.length; i++) {
      if(this.notify[i] == item){
        this.notify.splice(i, 1);
      }
 
    }
  } 

  //scroll header function
  ngAfterViewInit() {
    var lengthHeader=document.getElementsByClassName("toolbar-md").length -1;
    this.headerbg = document.getElementsByClassName("toolbar-md")[lengthHeader];
  }

  scrollingFun(ev){
    ev.domWrite(() => {
        this.updateHeader(ev);
      //
    }); 
  }
  updateHeader(ev) { 
  if (ev.scrollTop > 0) {
    this.darkHeader = ev.scrollTop / 380; 
  }

  this.renderer.setElementStyle(this.headerbg, 'background', 'rgba(158,158,158,' + this.darkHeader +')');
  }

//enable input for edit
  changeData(){
    this.isDisabled =! this.isDisabled;
  }

// intlTelInput for select country id
  ngOnInit(): any {
    let output = $("#output");
    let telInput = $("#phone");

    // telInput.intlTelInput();
    $("#phone").intlTelInput("setCountry", "gb");
    $("#phone").intlTelInput("setNumber", "+447733123456");

    console.log(telInput.intlTelInput("getNumber"))
    telInput.on("keyup change", function() {
      var intlNumber = telInput.intlTelInput("getNumber");
      if (intlNumber) {
        output.text("International: " + intlNumber);
      } else {
        output.text("Please enter a number below");
      }
    });
  }
   
}