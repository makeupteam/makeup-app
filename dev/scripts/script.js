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

	// meanwhile load firebase data
	looksDB.once('value', function(res) {
		let data = res.val();
		for (var look in data) {
			makeupApp.looks.push(data[look]);
		}
		makeupApp.loadLooks();
		makeupApp.looksGallerySetup();
		makeupApp.detailViewSetup();
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
		$('.home').toggleClass('disable-buttons'); // allow interaction with the home view
		let productResults = res;
		productResults.forEach(function(result) {
			makeupApp.products[result.id] = result;
		});
	});
};
// dynamically add looks-thumbnails to main page gallery
makeupApp.loadLooks = function() {
	var looksGallery = $('.looks-gallery');
	var lookTemplate = $('#look-template').html();
	makeupApp.looks.forEach(function(look) {
		var templateItem = $(lookTemplate);//magic

		// fill the template with the look's info
		templateItem.find('.look-type').text(look.lookType);
		templateItem.addClass(`${look.filter}`);
		templateItem.find('.look-image').attr('src', look.imageURL);
		templateItem.find('.like-number').text(look.likes);

		// append info to DOM
		looksGallery.append(templateItem);

		// setup click listener for the look thumbnail
		templateItem.find('.overlay').on('click', function() {
			$('.home').toggleClass('disable-buttons'); // prevent accidental interaction with the home view while in look-details view
			makeupApp.makeDetailedPage(look);
			$('.look-details').toggleClass('hidden');
		});
	});
};

makeupApp.detailViewSetup = function () {
	$('.add-to-wishlist').on('click', function() {
		$('.master-wishlist').append(`<h1>WHATSUP</h1>`)
	})

	// exit detail page
	$('.exit-detail').on('click', function(){
		$('.look-details').toggleClass('hidden');
		setTimeout(function() {
			$('.carousel-cell, .total-value, .products-gallery').empty();
		    $('.look-img-cell img, .product-image__small').attr('src', '');
		    $('.dot').remove();
			$('.home').toggleClass('disable-buttons'); // allow interaction with the home view again
		}, 300);
	});
};

// building the detailed view based on look selected
makeupApp.makeDetailedPage = function(look){
	// filling in look details based on look selected
	$('.look-img-cell img').attr('src', look.imageURL);
	$('.look-name').text(look.name);
	$('.look-likes').text(look.likes);

	makeupApp.productGallerySetup(look);
};

// to set up the product gallery based on selected look
makeupApp.productGallerySetup = function (look){

	// filling product template with related products based on look selected
	let totalArr = [];
	let pinnedItem = [];
	var productGallery = $('.products-gallery');
	var productTemplate = $('#product-detail-template').html();
	for (var product in look.products) {
		let productInfo = makeupApp.products[look.products[product]];

		var productTemplateItem = $(productTemplate);
		productTemplateItem.find('.product-img-cell img').attr('src', productInfo.image_link);
		productTemplateItem.find('.product-price').text(productInfo.price);
		productTemplateItem.find('.product-name').text(productInfo.name);

		productGallery.append(productTemplateItem);


		// fill in filters based on existing categories

		// populate pinned product carousel
		// let pinnedItem = [];
		var carousel = $('.main-carousel');
		var carouselTemplate = $('#product-carousel').html();
		productTemplateItem.find('.add-to-total').on('click', function() {
			var carouselTemplateItem = $(carouselTemplate);
			carouselTemplateItem.find('.product-image__small').attr('src', productInfo.image_link);
			carouselTemplateItem.find('.product-name__small').text(productInfo.name);
			carousel.flickity('prepend',$(carouselTemplateItem))
			let price = parseInt(productInfo.price);
			totalArr.unshift(price);
			// console.log(totalArr);

			// calculate total price of pinned item
			let totalValue = totalArr.reduce(function(acc, value) {
				return acc + value;
			}, 0);
			$('.total-value').text(totalValue);
			$(this).attr("disabled", true);

			// send pinned product to master wishlist
			pinnedItem.push(productInfo.id);
		});

	};
}

makeupApp.looksGallerySetup = function () {
	// Set up isotope.js on looks gallery
	var looksGallery = $('.looks-gallery').isotope({
	  itemSelector: '.look-cell',
	  stagger: 10
	});

	var filterButtons = $('.filter-container');

	// Set up click listener to for filter buttons
	filterButtons.on( 'click', 'button', function() {
	  var filterValue = $(this).attr('data-filter');
	  looksGallery.isotope({ filter: filterValue });
	  filterButtons.find('.is-checked').removeClass('is-checked');
	  $(this).addClass('is-checked');
	});
};

// document ready
$(function() {
	makeupApp.init();
});
