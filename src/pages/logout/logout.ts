import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { LoginPage } from "../login/login";
import { LocalDataServiceProvider } from '../../providers/local-data-service/local-data-service';

@Component({
  selector: 'page-logout',
  templateUrl: 'logout.html'
})

export class LogoutPage {

  constructor(public navCtrl: NavController, public localDataService: LocalDataServiceProvider) {
  }

  logout() {
    this.localDataService.logoutUser();
    this.navCtrl.setRoot(LoginPage);
  }

}