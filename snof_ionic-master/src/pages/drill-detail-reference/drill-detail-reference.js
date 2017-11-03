var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component } from '@angular/core';
import { NavController, ToastController } from 'ionic-angular';
import { DatabaseService } from "../../providers/databaseservice/databaseservice";
import { ImagePicker } from '@ionic-native/image-picker';
import { Camera } from '@ionic-native/camera';
var DrillDetailReference = (function () {
    function DrillDetailReference(navCtrl, toastCtrl, imagePicker, databaseService, camera) {
        this.navCtrl = navCtrl;
        this.toastCtrl = toastCtrl;
        this.imagePicker = imagePicker;
        this.databaseService = databaseService;
        this.camera = camera;
        this.title = "Linking Wedge Turns in the Fall Line";
        this.description = "The Skier enters the track at GS speed";
        this.objectives = "Using flextion and extension of the lower body";
        this.terrain = "Beginer slope";
        this.variations = "Whatever stuff goes here";
    }
    return DrillDetailReference;
}());
DrillDetailReference = __decorate([
    Component({
        selector: 'page-drill-detail-reference',
        templateUrl: 'drill-detail-reference.html'
    }),
    __metadata("design:paramtypes", [NavController, ToastController, ImagePicker, DatabaseService, Camera])
], DrillDetailReference);
export { DrillDetailReference };
//# sourceMappingURL=drill-detail-reference.js.map