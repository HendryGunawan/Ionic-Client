import {Component, ViewChild} from '@angular/core';
import {Events, NavController, Platform} from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HomePage } from '../pages/home/home';
import {LoginPage} from "../pages/login/login";
import {TabsPage} from "../pages/tabs/tabs";
import {AuthService} from "../providers/auth-service";
@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any = LoginPage;
  tabsPage = TabsPage;
  @ViewChild('content') nav: NavController;

  constructor(platform: Platform,
              statusBar: StatusBar,
              splashScreen: SplashScreen,
              authService: AuthService,
              events: Events) {

    events.subscribe('user:login', () => {
      this.goLogin();
    });

    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
      authService.startupTokenRefresh();
    });
  }

  goLogin(){
    this.nav.setRoot(LoginPage);
  }

  goHome(){
    this.nav.setRoot(HomePage);
  }
}

