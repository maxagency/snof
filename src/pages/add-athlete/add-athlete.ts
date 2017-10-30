import { Component } from '@angular/core';
import { NavController, NavParams, ToastController } from 'ionic-angular';
import { LocalDataServiceProvider } from "../../providers/local-data-service/local-data-service";


@Component({
    selector: 'page-add-athlete',
    templateUrl: 'add-athlete.html'
})


export class AddAthlete {

    public session_id: string;

    public attendeeSearchTerm: string;
    public filteredAttendees: any;
    public attendees: any;

    constructor(private navCtrl: NavController,
        private toastCtrl: ToastController,
        private navParams: NavParams,
        private localDataService: LocalDataServiceProvider
    ) {

        this.session_id = navParams.get('session_id');

        this.attendeeSearchTerm = '';
        this.attendees = [];
        this.refreshFilteredAttendees();

    }

    addAttendee(attendee): void {
        // Make sure attendee not already added
        let attendeeFullName = "${attendee.firstName} ${attendee.lastName}";
        for (let i = 0; i < this.attendees.length; i++) {
            let indexFullName = "${this.attendees[i].firstName} ${this.attendees[i].lastName}";
            if (attendeeFullName === indexFullName) {
                return;
            }
        }
        // Then add attendee if not already added
        this.attendees.push(attendee);
    }

    saveChanges(): void {
        alert('Changes Saved');
    }

    refreshFilteredAttendees(): void {
        // copy by value not reference to keep orig data
        let that = this;
        this.localDataService.queryObjects('user', {}).then((users: any) => {
            console.log(users);
            that.filteredAttendees = users.filter(function (user) {
                let alltext = (user.firstName + ' ' + user.lastName).toLowerCase();
                return alltext.indexOf(that.attendeeSearchTerm.toLowerCase()) !== -1;
            });
            console.log('query: ' + that.attendeeSearchTerm);
            console.log(that.filteredAttendees);
        });
    }

    onSearchCancel(ev) {
        //this.attendeeSearchTerm = '';
        //this.refreshFilteredAttendees();
    }

    removeAttendee(attendee): void {
        for (let i = 0; i < this.attendees.length; i++) {
            if (this.attendees[i].name === attendee.name) {
                this.attendees.splice(i, 1);
                return;
            }
        }
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

    complete(): void {

        let ps = [];
        for (var i = 0; i < this.attendees.length; i++) {

            ps.push(this.localDataService.addUserToSession(this.attendees[i].id, this.session_id));

        }

        Promise.all(ps).then((res: any) => {
            this.navCtrl.pop();
        });


    }

}