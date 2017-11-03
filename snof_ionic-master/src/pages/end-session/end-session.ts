import { Component } from '@angular/core';
import { NavController, NavParams, ToastController } from 'ionic-angular';
import { TabsRacing } from '../tabs/tabs-racing';
import { LocalDataServiceProvider } from "../../providers/local-data-service/local-data-service";


@Component({
    selector: 'page-end-session',
    templateUrl: 'end-session.html'
})

export class EndSession {

    // nav param
    public session_user_id: string;

    public session_user: any;
    public isReady: boolean;

    public firstName: string;
    public lastName: string;
    public name: string;
    public totalTime: string;
    public completedRuns: string;
    public averageScore: string;
    public overallComment: string;
    public reasonForEndingSession: string;

    public userThumb: string;

    constructor(public navCtrl: NavController,
        private navParams: NavParams,
        private localDataService: LocalDataServiceProvider,
        private toastCtrl: ToastController) { 

            this.session_user_id = navParams.get("session_user_id");

            this.loadData();
        }


    loadData(){

        let that = this;

        that.isReady = false;
        let setScreenData = function(){

            that.firstName = that.session_user.user.firstName;
            that.lastName = that.session_user.user.lastName;
            that.name = that.firstName+' '+that.lastName;
            that.totalTime = "4:12:12";
            that.completedRuns = "32";
            that.averageScore = "12";
            that.userThumb = that.session_user.user.thumbBase64;
            that.isReady = true;
        }

        this.localDataService.getObject('session_user', this.session_user_id).then((session_user: any) => {

            that.session_user = session_user;
            setScreenData();

        })


    }

    cancel(): void {
        this.navCtrl.pop();
    }

    endSession(): void {

        this.session_user.isEnded = true;
        this.session_user.endedReason = "Completion";
        this.session_user.overallComment = this.overallComment;

        this.localDataService.setObject('session_user', this.session_user).then((res: any) => {

            this.navCtrl.pop();
        });

    }

    showErrorToast(errorMessage): void {
        let toast = this.toastCtrl.create({
            message: errorMessage,
            duration: 2000,
            position: 'bottom'
        });

        toast.onDidDismiss(() => {
            console.log('Dismissed toast');
        });

        toast.present();
    }



}