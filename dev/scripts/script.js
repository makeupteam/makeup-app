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

makeupApp.init = function () {
	// make API call to fetch products data
	makeupApp.getProductData();
	// $('.home').toggleClass('disable-buttons');

	// meanwhile load firebase data and then set up views
	looksDB.once('value', function (res) {
		let data = res.val();
		for (var look in data) {
			makeupApp.looks.push(data[look]);
		}
		makeupApp.loadLooks();
		makeupApp.looksGallerySetup();
		makeupApp.detailViewSetup();
	});

	// setup listeners for main page
	$('#looks-filter').on('change', function () {
		let filter = $(this).val();
	});

	$('#looks-sort').on('change', function () {
		let sort = $(this).val();
	});
};



// AJAX call to API
makeupApp.getProductData = function () {
	$.ajax({
		url: 'http://makeup-api.herokuapp.com/api/v1/products.json',
		method: 'GET',
		dataType: 'json',
	}).then(function (res) {
		$('.home').toggleClass('disable-buttons'); // allow interaction with the home view
		let productResults = res;
		productResults.forEach(function (result) {
			makeupApp.products[result.id] = result;
		});
		$('.loader-container').fadeOut();
		makeupApp.collapseHero();
		// $('body').css('overflow', 'show')
	});
};

// collapse hero once ajax call is done
makeupApp.collapseHero = function() {
	$('header').css({
		'height': '35vh'
		// 'margin-top': '20vh'
	});
	$('.header-content').css({
		'transform': 'scale(1.0)',
		'margin-top': '25vh',
		'margin-bottom': '10vh'
	})
}


// AJAX call to API
makeupApp.getProductData = function () {
	$.ajax({
		url: 'http://makeup-api.herokuapp.com/api/v1/products.json',
		method: 'GET',
		dataType: 'json',
	}).then(function (res) {
		$('.home').toggleClass('disable-buttons'); // allow interaction with the home view
		let productResults = res;
		productResults.forEach(function (result) {
			makeupApp.products[result.id] = result;
		});
		$('.loader-container').fadeOut();
		makeupApp.collapseHero();
	});
};

// collapse hero once ajax call is done
makeupApp.collapseHero = function() {
	$('header').css({
		'height': '35vh'
		// 'margin-top': '20vh'
	});
	$('.header-content').css({
		'transform': 'scale(1.0)',
		'margin-top': '25vh',
		'margin-bottom': '10vh'
	})
}



// dynamically add looks-thumbnails to main page gallery
makeupApp.loadLooks = function () {
	var looksGallery = $('.looks-gallery');
	var lookTemplate = $('#look-template').html();
	makeupApp.looks.forEach(function (look) {
		var templateItem = $(lookTemplate);//magic


		// fill the template with the look's info
		templateItem.find('.look-type').text(look.lookType);
		templateItem.addClass(`${look.filter}`);
		templateItem.attr('id', `likes-cell-${look.id}`)
		templateItem.attr('data-order-added', `${look.orderAdded}`)
		templateItem.find('.look-image').attr('src', look.imageURL);
		templateItem.find('.like-number').text(look.likes);
		templateItem.find('.like-button').on('click', function () {//selects template item
			//find the like button, on click, function runs
			if ($(`#likes-cell-${look.id} .like-button`).hasClass('liked')) {
				looksDB.update({//updates the DB with
					[`look${look.id}`]: Object.assign({}, look, {
						//corresponding look thats being clicked, goes into DB
						//assigns all previous values and updating likes value
						likes: look.likes -= 1,
						//update is being sent to DB
					})
				})
					.then(function () {
						$(`#likes-cell-${look.id} .like-number`).text(look.likes);
						$(`#likes-cell-${look.id} .like-icon`).attr('src', 'assets/heart.png');
					});
			} else {
				looksDB.update({//updates the DB with
					[`look${look.id}`]: Object.assign({}, look, {
						//corresponding look thats being clicked, goes into DB
						//assigns all previous values and updating likes value
						likes: look.likes += 1,
						//update is being sent to DB
					})
				})
					.then(function () {
						$(`#likes-cell-${look.id} .like-number`).text(look.likes);
						$(`#likes-cell-${look.id} .like-icon`).attr('src', 'assets/filled_heart.png');
					});
			}

			$(`#likes-cell-${look.id} .like-button`).toggleClass('liked')

		});

		// append info to DOM
		looksGallery.append(templateItem);

		// setup click listener for the look thumbnail
		templateItem.find('.overlay').on('click', function () {
			$('.home').toggleClass('disable-buttons'); // prevent accidental interaction with the home view while in look-details view
			makeupApp.makeDetailedPage(look);
			$('.look-details').toggleClass('hidden');
		});
	});
};

makeupApp.detailViewSetup = function () {
	// $('.add-to-wishlist').on('click', function () {
	// 	$('.master-wishlist').append(`<h1>WHATSUP</h1>`)
	// })

	// exit detail page
	$('.exit-detail').on('click', function () {
		$('.look-details').toggleClass('hidden');
		setTimeout(function () {
			$('.carousel-cell, .total-value, .products-gallery').empty();
			$('.look-img-cell img, .product-image__small').attr('src', '');
			$('.product-filters .filter-buttons').empty();
			$('.products-gallery').isotope('destroy');
			$('.dot').remove();
			$('.home').toggleClass('disable-buttons'); // allow interaction with the home view again
		}, 300);
	});

	makeupApp.productFilterSetup();
};

makeupApp.productFilterSetup = function () {

	var productGallery = $('.products-gallery');

	makeupApp.productfilters = {
		categories: [],
		brands: []
	};

	function customFilter() {
		var match = true;
		for (var filter in makeupApp.productfilters) {
			if (makeupApp.productfilters[filter].length > 0) {
				match = match && $(this).is(makeupApp.productfilters[filter].join(", "));
			}
		}
		return match;
	};

	$('.product-section .filter-container').on('click', 'button', function (event) {
		var $target = $(event.currentTarget);
		var type = $(event.delegateTarget).find("h4").text().toLowerCase();

		$target.toggleClass('is-selected');
		var isSelected = $target.hasClass('is-selected');
		var filter = $target.attr('data-filter');
		if (isSelected) {
			addFilter(filter, type);
		} else {
			removeFilter(filter, type);
		}
		// filter isotope
		productGallery.isotope({ filter: customFilter });
	});

	function addFilter(filter, type) {
		if (makeupApp.productfilters[type].indexOf(filter) == -1) {
			makeupApp.productfilters[type].push(filter);
		}
	}

	function removeFilter(filter, type) {
		var index = makeupApp.productfilters[type].indexOf(filter);
		if (index != -1) {
			makeupApp.productfilters[type].splice(index, 1);
		}
	}
}

// building the detailed view based on look selected
makeupApp.makeDetailedPage = function (look) {
	// filling in look details based on look selected
	$('.look-img-cell img').attr('src', look.imageURL);
	$('.look-name').text(look.name);
	$('.look-likes').text(look.likes);

	makeupApp.productGallerySetup(look);
};


// to set up the product gallery based on selected look
makeupApp.productGallerySetup = function (look) {

	// filling product template with related products based on look selected
	let totalArr = [];
	let pinnedItems = [];
	var productGallery = $('.products-gallery');
	var productTemplate = $('#product-detail-template').html();

	var categoryFilters = [];
	var brandFilters = [];

	for (var productID in look.products) {
		let productInfo = makeupApp.products[look.products[productID]];
		var productTemplateItem = $(productTemplate);

		productTemplateItem.find('.product-img-cell img').attr('src', productInfo.image_link);
		productTemplateItem.find('.product-price').text(productInfo.price);
		productTemplateItem.find('.product-name').text(productInfo.name);

		// set up classes for filtering
		var productType = productInfo.product_type;
		productType = productType.replace(/ /g, '-');
		var productBrand = productInfo.brand;
		productBrand = productBrand.replace(/ /g, '-');
		productBrand = productBrand.replace(/\./g, '');
		productBrand = productBrand.replace(/'/g, '');

		productTemplateItem.addClass(`${productType}`);
		productTemplateItem.addClass(`${productBrand}`);

		productGallery.append(productTemplateItem);

		// build the list of filters needed to be displayed
		updateFiltersLists(productInfo);

		// populate pinned product carousel
		var carousel = $('.main-carousel');
		var carouselTemplate = $('#product-carousel').html();
		productTemplateItem.find('.add-to-total').on('click', function () {
			var carouselTemplateItem = $(carouselTemplate);
			carouselTemplateItem.find('.product-image__small').attr('src', productInfo.image_link);
			carouselTemplateItem.find('.product-name__small').text(productInfo.name);
			carousel.flickity('prepend', $(carouselTemplateItem))
			let price = parseInt(productInfo.price);
			totalArr.unshift(price);

			// calculate total price of pinned item
			let totalValue = totalArr.reduce(function (acc, value) {
				return acc + value;
			}, 0);
			$('.total-value').text(totalValue);
			$(this).attr("disabled", true);

			// send pinned product to master wishlist
			pinnedItems.push(productInfo.id);
			makeupApp.makeWishlistPage(pinnedItems);
		});

	};

	makeupApp.makeWishlistPage = function (pinnedItems) {
		let item = pinnedItems;
		console.log(item);
		$('.add-to-wishlist').on('click', function() {
			for (var i = 0; i < pinnedItems.length; i++) {
				// filling in wishlist based on look selected
				console.log(makeupApp.products[item[i]].name);
				// $('.wishlist-look-cell img').attr('src', item.imageURL);
				$('.wishlist-product-list').append(makeupApp.products[item[i]].name, makeupApp.products[item[i]].price);
			}
		});
	};

	makeFilterButtons();

	function updateFiltersLists(productInfo) {
		var productCategory = productInfo.product_type.replace(/ /g, '-');
		if (categoryFilters.indexOf(productCategory) == -1) {
			categoryFilters.push(productCategory);
		}
		var productBrand = productInfo.brand.replace(/ /g, '-');
		productBrand = productBrand.replace(/\./g, '');
		productBrand = productBrand.replace(/'/g, '');
		if (brandFilters.indexOf(productBrand) == -1) {
			brandFilters.push(productBrand);
		}
	};

	function makeFilterButtons() {
		var categoryButtons = $('.categories .filter-buttons');
		var brandButtons = $('.brands .filter-buttons');

		categoryFilters.forEach(function (filter) {
			categoryButtons.append(`<button data-filter=".${filter}">${filter}</button>`)
		});
		brandFilters.forEach(function (filter) {
			brandButtons.append(`<button data-filter=".${filter}">${filter}</button>`)
		});

		productGallery.isotope({
			itemSelector: '.product-cell'
		});

		makeupApp.productfilters = {
			categories: [],
			brands: []
		};
	}
}


makeupApp.looksGallerySetup = function () {
	// Set up isotope.js on looks gallery
	var looksGallery = $('.looks-gallery').isotope({
		itemSelector: '.look-cell',
		layoutMode: 'fitRows',
		getSortData: {
			popular: function (itemElem) { // function
				var likes = $(itemElem).find('.like-number').text();
				return parseInt(likes);
			},
			newest: function (itemElem) { // function
				var orderAdded = $(itemElem).attr('data-order-added')
				return parseInt(orderAdded);
			},
			oldest: function (itemElem) { // function
				var orderAdded = $(itemElem).attr('data-order-added')
				return parseInt(orderAdded);
			}
		}
	});

	var filterButtons = $('main .filter-container');
	var filters = [];

	// Set up click listener for filter buttons
	filterButtons.on('click', 'button', function () {
		var button = $(this);
		var filterValue = button.attr('data-filter');

		if (filterValue !== '*') { // if a filter other than All is clicked
			button.toggleClass('is-selected');
			var isSelected = button.hasClass('is-selected');

			if (isSelected) {
				removeFilter('*');
				addFilter(filterValue);
			} else {
				removeFilter(filterValue);
			}
		} else { // if All is clicked
			filterButtons.find('.is-selected').removeClass('is-selected');
			filters = [];
			addFilter(filterValue);
		}

		looksGallery.isotope({ filter: filters.join(', ') });
	});

	function addFilter(filter) {
		if (filters.indexOf(filter) == -1) {
			filters.push(filter);
		}
	}

	function removeFilter(filter) {
		var index = filters.indexOf(filter);
		if (index != -1) {
			filters.splice(index, 1);
		}
	}

	$('#looks-sort').on('change', function () {
		var sortValue = $(this).val();
		var ascending = sortOrder(sortValue);
		looksGallery.isotope({
			sortBy: sortValue,
			sortAscending: ascending
		})
	});

	function sortOrder(sortValue) {
		if (sortValue === 'newest') {
			return false;
		} else if (sortValue === 'oldest') {
			return true;
		} else {
			return false;
		}
	}

	looksGallery.isotope({
		sortBy: 'popular',
		sortAscending: false
	})
};

// document ready
$(function () {
	makeupApp.init();
});
