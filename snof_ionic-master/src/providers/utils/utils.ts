import { Injectable } from '@angular/core';

/*
 
 LocalDataServiceProvider
 ========================
 
	* Delivers data to UI views
	
 */
@Injectable()
export class UtilsProvider {


	ucFirst(str){
		return str.charAt(0).toUpperCase() + str.slice(1);
	}
}