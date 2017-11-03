import { Component } from '@angular/core';
import { NavController, NavParams, ToastController, AlertController } from 'ionic-angular';
import { TabsRacing } from '../tabs/tabs-racing';
import { LocalDataServiceProvider } from "../../providers/local-data-service/local-data-service";
import { LoginPage } from '../login/login';


@Component({
    selector: 'page-forgot-password',
    templateUrl: 'forgot-password.html'
})

export class ForgotPasswordPage {

    public pageState: string;
    public comfirmationEmail: string;
    public confirmationNumber: string;

    constructor(private navCtrl: NavController,
        private navParams: NavParams,
        private localDataService: LocalDataServiceProvider,
        private toastCtrl: ToastController,
        private alertCtrl: AlertController) {

        this.pageState = "get_email";

    }

    sendPasswordResetEmail(): void {
        this.showEmailSentAlert();
        this.pageState = "confirm_number";
    }

    confirmPhoneNumber(): void {
        this.pageState = "create_password";
    }

    createPassword(): void {
        this.navCtrl.push(LoginPage);
    }

    showEmailSentAlert(): void {
        this.showAlertDialogue('Email Confirmation Sent', `Message sent to ${this.comfirmationEmail}`);
    }

    showAlertDialogue(title: string, message: string): void {
        let confirm = this.alertCtrl.create({
            title: title,
            message: message,
            buttons: [
                {
                    text: 'OK',
                    handler: () => {
                        console.log('OK clicked');
                    }
                }
            ]
        });
        confirm.present();
    }






}