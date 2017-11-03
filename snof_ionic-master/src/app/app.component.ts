import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { TabsRacing } from '../pages/tabs/tabs-racing';
import { TabsAdmin } from '../pages/tabs/tabs-admin';
import { LoginPage } from "../pages/login/login";
import { DevPage } from "../pages/dev/dev";
import { LocalDataServiceProvider } from '../providers/local-data-service/local-data-service';
import { WelcomeScreenPage } from '../pages/welcome-screen/welcome-screen';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage: any;

  constructor(platform: Platform,
    statusBar: StatusBar,
    public localDataService: LocalDataServiceProvider,
    splashScreen: SplashScreen) {


    //this.rootPage = LoginPage;
    //this.rootPage = DevPage;
    // Go to Welcome Screen First
    this.rootPage = WelcomeScreenPage;
    //this.rootPage = DevPage;

    /*

        this.localDataService.getCurUser().then((curUser: any) => {

          if(curUser){
            // login success
            this.rootPage = TabsRacing;
          }
          else{
            // no login
            this.rootPage = LoginPage;
          }

        }, error => {
          // error
          this.rootPage = LoginPage;

        });
    */    

    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
    });

  }
}
