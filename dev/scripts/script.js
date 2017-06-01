// Initialize Firebase
var config = {
	apiKey: "AIzaSyCBglzrqevMRAKJWrr_-ZWWJj7lCGqJEso",
	authDomain: "makeup-app-d1fac.firebaseapp.com",
	databaseURL: "https://makeup-app-d1fac.firebaseio.com",
	projectId: "makeup-app-d1fac",
	storageBucket: "makeup-app-d1fac.appspot.com",
	messagingSenderId: "220771434860"
};
firebase.initializeApp(config);

let looksDB = firebase.database().ref('looks');

var makeupApp = {};

makeupApp.looks = [];

makeupApp.init = function() {
	looksDB.once('value', function(res){
		// makeupApp.looks = res.val();
		let data = res.val();
		for (var look in data) {
			makeupApp.looks.push(data[look]);
		}
	})
};

// docready
$(function(){
	makeupApp.init();
})
