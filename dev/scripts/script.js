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
		makeupApp.looksGallerySetup();
	});

	// setup listeners for main page
	$('#looks-filter').on('change', function() {
		let filter = $(this).val();
	});

	$('#looks-sort').on('change', function() {
		let sort = $(this).val();
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
		console.log('ajaxdone')
	});
};
// dynamically add looks-thumbnails to main page gallery
makeupApp.loadLooks = function() {
	var looksGallery = $('.looks-gallery');
	var lookTemplate = $('#look-template').html();
	makeupApp.looks.forEach(function(look) {
		var templateItem = $(lookTemplate);//magic
		templateItem.find('.look-type').text(look.lookType);
		templateItem.addClass(`${look.filter}`);
		// templateItem.find('.look-cell').addClass(hello);

		templateItem.find('.look-image').attr('src', look.imageURL);
		templateItem.find('.like-number').text(look.likes);
		// append info to DOM
		looksGallery.append(templateItem);
		// setup click listener for the look thumbnail
		templateItem.find('.overlay').on('click', function() {
			makeupApp.makeDetailedPage(look);
		});
	});
};

// building the detailed view based on look selected
makeupApp.makeDetailedPage = function(look){
	// filling in look details based on look selected
	$('.look-img-cell img').attr('src', look.imageURL);
	$('.look-name').text(look.name);
	$('.look-likes').text(look.likes);

	// filling product template with related products based on look selected
	var productGallery = $('.products-gallery');
	var productTemplate = $('#product-detail-template').html();
	for (var product in look.products) {
		// console.log(makeupApp.products[look.products[product]]);
		var productInfo = makeupApp.products[look.products[product]];
		var productTemplateItem = $(productTemplate);
		productTemplateItem.find('.product-img-cell img').attr('src', productInfo.image_link);
		productTemplateItem.find('.product-price').text(productInfo.price);
		productTemplateItem.find('.product-name').text(productInfo.name);

		productGallery.append(productTemplateItem);

		// fill in filters based on existing categories

	}
}

makeupApp.looksGallerySetup = function () {

	var looksGallery = $('.looks-gallery').isotope({
	  itemSelector: '.look-cell',
	  stagger: 10
	 
	});

	var filterButtons = $('.filter-container');

	filterButtons.on( 'click', 'button', function() {
	  var filterValue = $(this).attr('data-filter');
	  console.log(filterValue);
	  looksGallery.isotope({ filter: filterValue });
	  filterButtons.find('.is-checked').removeClass('is-checked');
	  $(this).addClass('is-checked');
	});    
}



// document ready
$(function() {
	makeupApp.init();
});
