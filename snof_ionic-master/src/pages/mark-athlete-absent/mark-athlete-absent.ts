import { Component } from '@angular/core';
import { NavController, NavParams, ToastController } from 'ionic-angular';
import { LocalDataServiceProvider } from "../../providers/local-data-service/local-data-service";


@Component({
    selector: 'page-mark-athlete-absent',
    templateUrl: 'mark-athlete-absent.html'
})

export class MarkAthleteAbsent {

	// nav param
	public session_user_id: string;


	public session_user: any;
	public isReady: boolean;

    public name: string;
    public reasonForAbsence: string;
    public overallComment: string;
    public userThumb: string;

    constructor(public navCtrl: NavController,
        private navParams: NavParams,
        private toastCtrl: ToastController,
        private localDataService: LocalDataServiceProvider) { 

        	this.session_user_id = navParams.get("session_user_id");
        	this.loadData();
        }

    loadData(){

    	let that = this;

    	that.isReady = false;
    	let setScreenData = function(){

            that.name = that.session_user.user.firstName+' '+that.session_user.user.lastName;
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

    markAbsent(): void {

    	this.session_user.isAbsent = true;
    	this.session_user.absentReason = "Competition";
    	this.session_user.overallComment = this.overallComment;

    	this.localDataService.setObject('session_user', this.session_user).then((res: any) => {

        	this.navCtrl.pop();
    	});

    }

}