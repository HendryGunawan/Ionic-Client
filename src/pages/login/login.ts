import { Component } from '@angular/core';
import {NgForm} from "@angular/forms";
import {AlertController, LoadingController, NavController} from "ionic-angular";
import {AuthService} from "../../providers/auth-service";
import {Storage} from "@ionic/storage";
import {HomePage} from "../home/home";


@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  constructor(public alertCtrl: AlertController,
              public loadingCtrl: LoadingController,
              public authservice: AuthService,
              public storage: Storage,
              public navCtrl: NavController) {
  }


  onSignin(form: NgForm){
    const loading = this.loadingCtrl.create({
      content: 'Signing you in..'
    });
    loading.present();
    this.authservice.login(form.value)
      .then((data) => {
        this.setHomePage();
        loading.dismiss();
      })
      .catch(error => {
        console.log(error);
        loading.dismiss();
        const alert = this.alertCtrl.create({
          title: 'Sign in failed!!',
          message: error.statusText,
          buttons: ['Ok']
        });
        alert.present();
      });
  }

  public setHomePage(){
    this.navCtrl.setRoot(HomePage);
  }

}
