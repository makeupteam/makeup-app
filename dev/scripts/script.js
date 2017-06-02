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

// App setup
var makeupApp = {};

makeupApp.looks = [];
makeupApp.products = [];

makeupApp.init = function() {
	// make API call to fetch products data
	makeupApp.getProductData();

	// load firebase data
	looksDB.once('value', function(res) {
		let data = res.val();
		for (var look in data) {
			makeupApp.looks.push(data[look]);
		}
		makeupApp.loadLooks();
	});

	// setup listeners for main page
	$('#looks-filter').on('change', function() {
		let filter = $(this).val();
	});

	$('#looks-sort').on('change', function() {
		let sort = $(this).val();
	});
};

// dynamically add looks-thumbnails to main page gallery
makeupApp.loadLooks = function() {
	var looksGallery = $('.looks-gallery');
	var lookTemplate = $('#look-template').html();
	makeupApp.looks.forEach(function(look) {
		var templateItem = $(lookTemplate);//magic
		templateItem.find('.look-type').text(look.lookType);
		templateItem.find('.look-image').attr('src', look.imageURL);
		templateItem.find('.like-number').text(look.likes);
		// append info to DOM
		looksGallery.append(templateItem);
		// setup click listener for the look thumbnail
		$(templateItem).find('.overlay').on('click', function() {
			// makeDetailedView(look); function that will build the detailed product view
		});
	});
};

// AJAX call to apiKey
makeupApp.getProductData = function() {
	$.ajax({
		url: 'http://makeup-api.herokuapp.com/api/v1/products.json',
		method: 'GET',
		dataType: 'json',
	}).then(function(res) {
		let productResults = res;
		productResults.forEach(function(result) {
			makeupApp.products[result.id] = result;
			// console.log(makeupApp.products[result.id]);
		});
	});
};

// document ready
$(function() {
	makeupApp.init();
});
