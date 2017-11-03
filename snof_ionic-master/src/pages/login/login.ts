import { Component } from '@angular/core';
import {
  IonicPage,
  NavController,
  LoadingController,
  Loading,
  AlertController,
  ToastController
} from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LocalDataServiceProvider } from '../../providers/local-data-service/local-data-service';
import { TabsRacing } from "../tabs/tabs-racing";
import { ForgotPasswordPage } from '../forgot-password/forgot-password';


//@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})

export class LoginPage {

  public loginForm: FormGroup;
  public loading: Loading;

  constructor(private navCtrl: NavController,
    private localDataService: LocalDataServiceProvider,
    private formBuilder: FormBuilder,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController) {

    this.loginForm = formBuilder.group({
      email: ['', Validators.compose([Validators.required, null])],
      password: ['', Validators.compose([Validators.minLength(6), Validators.required])]
    });
  }

  loginUser(): void {
    if (!this.loginForm.valid) {
      console.log(this.loginForm.value);
      this.showToast('Invalid username or password');
    } else {
      this.localDataService.loginUser(this.loginForm.value.email, this.loginForm.value.password)
        .then((curUser: any) => {
          this.navCtrl.setRoot(TabsRacing);
        }, error => {
          this.loading.dismiss().then(() => {
            let alert = this.alertCtrl.create({
              message: "Invalid username or password",
              buttons: [
                {
                  text: "Ok",
                  role: 'cancel'
                }
              ]
            });
            alert.present();
          });
        });

      this.loading = this.loadingCtrl.create({
        dismissOnPageChange: true,
      });
      this.loading.present();
    }
  }

  goToResetPassword(): void {
    this.navCtrl.push(ForgotPasswordPage);
  }

  createAccount(): void {
    alert('add create account');
  }

  showToast(message): void {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: 'top'
    });

    toast.onDidDismiss(() => {
      console.log('Dismissed toast');
    });

    toast.present();
  }

}