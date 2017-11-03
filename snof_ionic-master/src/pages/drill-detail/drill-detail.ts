import { Component } from '@angular/core';
import { NavController, NavParams, ToastController } from 'ionic-angular';
import { DrillDetailReference } from "../drill-detail-reference/drill-detail-reference";
import { DashboardPage } from '../dashboard/dashboard';
import { TabsRacing } from '../tabs/tabs-racing';
import { TrainingScreen } from '../training-screen/training-screen';
import { LocalDataServiceProvider } from "../../providers/local-data-service/local-data-service";
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';


@Component({
    selector: 'page-drill-detail',
    templateUrl: 'drill-detail.html'
})

export class DrillDetail {

    // Nav Params
    public session_id: string;
    public session_user_id: string;
    // Case 1 - Loading Drill Evaluation
    public user_drill_id: string;

    // Case 2 - Creating Drill Evaluation
    public user_id: string;
    public drill_id: string;


    //
    public isReady: boolean;

    // objects
    public session: any;
    public locations: any;
    public user_drill: any;
    public venue: any;
    public currStudent: any;

    public isVideoLoaded: any;
    public videoSrc: any;

    public title: string;
    public drillName: string;
    public firstName: string;
    public feedbackPlaceholder: string;

    public snowQuality: string;
    public techniqueScore: number;
    public balanceScore: number;
    public rotaryScore: number;
    public edgingScore: number;
    public pressureControlScore: number;

    public location: string;
    public turnShape: string;
    public feedback: string;


    constructor(private navCtrl: NavController,
        private navParams: NavParams,
        private toastCtrl: ToastController,
        private localDataService: LocalDataServiceProvider,
        private sanitizer: DomSanitizer) {

        this.session_id = navParams.get('session_id');
        this.session_user_id = navParams.get('session_user_id');

        // create new evaluation
        this.drill_id = navParams.get('drill_id');
        this.user_id = navParams.get('user_id');

        // editing evalutaion
        this.user_drill_id = navParams.get("user_drill_id");

        this.isReady = false;
        this.isVideoLoaded = false;

    }

    ionViewDidEnter() {

        this.loadData();
    }

    loadData() {

        if (!this.user_drill_id && !this.drill_id) return;

        this.isVideoLoaded = false;
        let that = this;

        let loadVideo = function () {

            that.localDataService.getObject('video', that.user_drill.video).then((video: any) => {

                console.log('getObject(video)');
                console.log(video);
                if (video && video.fileName) {
                    that.videoSrc = that.sanitizer.bypassSecurityTrustResourceUrl(video.nativeURL);
                    that.isVideoLoaded = true;

                    /*
                    that.localDataService.readFileAsBase64(video.fileName).then((base64: string) => {

                        console.log('.. loaded base64');
                        //console.log(base64);
                        debugger;
                        //that.videoSrc = 'assets/videos/Chamonix_ski_lift_09.mp4';
                        //that.videoSrc = that.sanitizer.bypassSecurityTrustResourceUrl(base64);
                        //that.videoSrc = that.sanitizer.bypassSecurityTrustResourceUrl(video.localURL);
                        //that.videoSrc = that.sanitizer.bypassSecurityTrustResourceUrl(video.nativeURL);
                        //that.videoSrc = video.nativeURL;
                        that.videoSrc = that.sanitizer.bypassSecurityTrustResourceUrl(video.nativeURL);
                        console.log('.. video src');
                        //console.log(that.videoSrc);
                        //$('#video-player-small').
                        //$('#video-player-small').src = that.sanitizer.bypassSecurityTrustResourceUrl(base64);
                        that.isVideoLoaded = true;

                    });
                    */
                }
                else {
                    console.log('default video..');
                    that.videoSrc = 'assets/videos/Chamonix_ski_lift_09.mp4';
                    that.isVideoLoaded = true;
                }

            });


        }

        let setScreenData = function () {

            if (!that.currStudent) {
                that.currStudent = {
                    firstName: "Anderson",
                    lastName: "Nguyen"
                }
            }

            that.drillName = that.user_drill.drill.name;
            that.firstName = (that.currStudent) ? that.currStudent.firstName : '';
            that.feedbackPlaceholder = `How did ${that.firstName} do? How can he/she improve?`;
            that.title = `Evaluating ${that.firstName}`;

            that.techniqueScore = that.user_drill.techniqueScore;
            that.balanceScore = that.user_drill.balanceScore;
            that.rotaryScore = that.user_drill.rotaryScore;
            that.edgingScore = that.user_drill.edgingScore;
            that.pressureControlScore = that.user_drill.pressureControlScore;

            that.location = that.user_drill.location_id;
            that.snowQuality = that.user_drill.snowQuality;
            that.turnShape = that.user_drill.turnShape;
            that.feedback = that.user_drill.feedback;

            loadVideo();

            that.isReady = true;

        }

        let doStepA = function () {

            if (!that.user_drill_id) {

                let user_drill = {
                    user_id: that.user_id,
                    drill_id: that.drill_id,
                    session_id: that.session_id
                };

                // resolve reference to drill
                that.localDataService.setObject('user_drill', user_drill).then((user_drill: any) => {
                    that.localDataService.unpackObject('user_drill', user_drill).then((user_drill: any) => {
                        doStepB(user_drill);
                    });
                });
            }
            else {

                that.localDataService.getObject('user_drill', that.user_drill_id).then((user_drill: any) => {

                    doStepB(user_drill);

                });

            }
        }

        let doStepB = function (user_drill) {

            that.user_drill = user_drill;

            // resolve reference to user
            that.localDataService.getObject('user', user_drill.user_id).then((user: any) => {

                that.user_drill.user = user;
                that.currStudent = user;

                setScreenData();

            });

        }

        that.localDataService.queryObjects('location', {}).then(res => {

            that.locations = res;
            that.localDataService.getObject('session', this.session_id).then((session: any) => {

                that.session = session;
                doStepA();

            });

        });

        that.isReady = false;



    }

    finish(): void {

        this.navCtrl.push(TabsRacing);
    }

    doSave(): void {

        let that = this;

        // this.navCtrl.push(AttachVideoPage);
        this.user_drill.techniqueScore = (this.techniqueScore) ? this.techniqueScore : 0;
        this.user_drill.balanceScore = (this.balanceScore) ? this.balanceScore : 0;
        this.user_drill.rotaryScore = (this.rotaryScore) ? this.rotaryScore : 0;
        this.user_drill.edgingScore = (this.edgingScore) ? this.edgingScore : 0;
        this.user_drill.pressureControlScore = (this.pressureControlScore) ? this.pressureControlScore : 0;

        this.user_drill.location = this.location;
        this.user_drill.turnShape = this.turnShape;
        this.user_drill.feedback = this.feedback;

        this.user_drill.averageRating = (this.techniqueScore + this.balanceScore + this.rotaryScore + this.edgingScore + this.pressureControlScore) / 5;

        this.localDataService.setObject('user_drill', this.user_drill).then((res: any) => {

            // add user_drill to session_user
            this.localDataService.getObject('session_user', this.session_user_id).then((session_user: any) => {

                let foundUserDrill: any = session_user.user_drills.filter(function (user_drill) {
                    return user_drill.id == that.user_drill.id;
                });
                if (foundUserDrill && foundUserDrill.length < 1) {
                    session_user.user_drills.push(that.user_drill);
                }

                this.localDataService.setObject('session_user', session_user).then((res: any) => {
                    that.navCtrl.pop();
                })

            });

        });


    }

    goToDrillDetailReference(): void {
        this.navCtrl.push(DrillDetailReference, {
            drill_id: this.user_drill.drill_id
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

    isActive(section: string, index: number): boolean {
        // When N/A (index = 0)
        if (index === 0) {
            switch (section) {
                case "technique":
                    //return this.techniqueScore >= 0;
                    //return false;
                    return this.techniqueScore === 0;
                case "balance":
                    return this.balanceScore >= 0;
                case "rotary":
                    return this.rotaryScore >= 0;
                case "edging":
                    return this.edgingScore >= 0;
                case "pressure":
                    return this.pressureControlScore >= 0;
                default:
                    console.log(`ERROR! ${section} is not a valid section`);
                    return false;
            }
        }

        // When not N/A (index is a number > 0)
        switch (section) {
            case "technique":
                return index <= this.techniqueScore;
            case "balance":
                return index <= this.balanceScore;
            case "rotary":
                return index <= this.rotaryScore;
            case "edging":
                return index <= this.edgingScore;
            case "pressure":
                return index <= this.pressureControlScore;
            default:
                console.log(`ERROR! ${section} is not a valid section`);
                return false;
        }
    }

    isBolded(section: string, index: number) {
        switch (section) {
            case "technique":
                return index === this.techniqueScore;
            case "balance":
                return index === this.balanceScore;
            case "rotary":
                return index === this.rotaryScore;
            case "edging":
                return index === this.edgingScore;
            case "pressure":
                return index === this.pressureControlScore;
            default:
                console.log(`ERROR! ${section} is not a valid section`);
                return false;
        }
    }

    setTechniqueScore(score: number): void {
        this.techniqueScore = score;
    }

    setBalanceScore(score: number): void {
        this.balanceScore = score;
    }

    setRotaryScore(score: number): void {
        this.rotaryScore = score;
    }

    setEdgingScore(score: number): void {
        this.edgingScore = score;
    }

    setPressureControlScore(score: number): void {
        this.pressureControlScore = score;
    }

}