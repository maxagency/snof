user
----------

{
	"id": "trainer-1",

	"userType": "HEAD COACH",
	"firstName": "Anders",
	"lastName": "Kitson",
	"misc": "Free Ski",
	"thumb": "image-1",				// references "image" object
	"email": "head1@snofolio.com",
	"password": "snowisgood",
	"program": "program-1"

	"timeCreated": {int}			// convert to date: new Date(user.timeCreated).toISOString()
	"timeModified": {int}			// new Date(user.timeModified).toLocaleString(), etc.
	"timeDeleted": {int}	
}



* LocalDataServiceProvider._unpackUser
----
- loads user.thumb via getObject('image', user.thumb)
- makes user.thumb, and user.thumbBase64 available


restApi.getObject('user', userId).then((user: any) => {
	
	user.thumb.base64 = ''


	restApi.getObject('program', user.program).then((program: any) => {

		program.location
		program.name
		etc.

	});

});