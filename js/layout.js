
document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {

	store.clearAll();
	$('#rating').material_select();
	$('.modal').modal();

	var message = "";
	var name = "";
	var imgPath = "";
	var rating = "";
	var notes = "";
	var time = "";
	var loc = "";

	var test = new entry("Noodle Bowl", "./img/bowl.jpg", "5", "Its a bowl of ramen!", "june52016", "RamenShop");
	var test2 = new entry("Spicy Chicken", "./img/chicken.jpg", "4", "Spicy grilled chicken, its'a nice!", "june52016", "ChopHouse");
	var test3 = new entry("Prawn and Veggies", "img/prawn.jpg", "3", "Its food!", "june52016", "Miku");

	store.set("Noodle Bowl", JSON.stringify(test));
	store.set("Prawn and Veggies", JSON.stringify(test3));
	store.set("Spicy Chicken", JSON.stringify(test2));

	var currentEntry;
	var locOptions = { };

    updateCatalog();


	function updateCatalog() {
		catalogHTML = "";
		row = 0;
		store.each(function(value, key) {
			var entry = $.parseJSON(value);
		    if(row == 0) {
		    	catalogHTML += "<div class='row'>"
		    }	else if(row % 2 == 2 || row == 2) {
		    	 console.log("second " + row);
		    	catalogHTML += "</div>";
		  	    catalogHTML += "<div class='row'>"
		    }  
		    	catalogHTML += "<div class='col s6'>";
		    	catalogHTML += "<a href='#view' class='entry' data-name='" + key + "'>";
		    	catalogHTML += "<div class='card hoverable'> <div class='card-image'> <img src='" + entry.img + "'>";
		    	catalogHTML += "<span class='card-title' id='card-text'>"+ key +"</span></div><div class='card-content'>" + getRatingHTML(entry.rating) + 
		    				   "<div class='entry-location'><i class='material-icons' id='loc-pin'>person_pin</i><p>" + entry.loc + 
		    				   "</p></div></div></div></a></div>";
		    	row++;


		    	////// This is a mess and I wish it wasn't -- but it works
		});

		$("#entries").html(catalogHTML);
	}

	
	function getRatingHTML(ratingN) {
		var t = "";
		for(var x = 0; x < ratingN; x++) {
			t += "<i class='material-icons' id='stars'>star</i>"
		}
		return t;
	}


	$("body").delegate('.entry', 'click', function() {
		var e = $.parseJSON(store.get(this.dataset.name));	
		currentEntry = e;
        console.log(currentEntry.name);
		$("#dish-image").html("<img src='"+ e.img + "'/><span class='card-title' id='dish-name'>" + e.name + 
							  "</span> <a id='delete' class='btn-floating halfway-fab waves-effect waves-light red'> <i class='material-icons'>delete</i></a>")
		$("#dish-rating").html(getRatingHTML(e.rating));
		$("#dish-notes").html("<h5>Notes</h5>" + e.notes);
		$("#dish-location").html("<i class='material-icons' id='loc-pin'>person_pin</i><p>" + e.loc + "</p></div>");
	
			$("#delete").on("click", function() {
				console.log(currentEntry.name);
				store.remove(currentEntry.name);
				updateCatalog();
				$.mobile.navigate("#catalog");
			});
	});

	function entry(name, img, rating, notes, time, loc) {
	    this.name = name;
	    this.img = img;
	    this.rating = rating;
	    this.notes = notes;
	    this.time = time;
	    this.loc = loc;
	}

	$("#save").on("click", function() {
		name = $("#name").val();
		rating = $("#rating").val();
		notes = $("#notes").val();
		loc = $('#loc').val();
		time = $.now();

		if(name === "") {
			message = "Please enter a name for the dish";
		}else if(imgPath === "") {
			message = "Please add a picture of the dish";
		}else if(rating == "") {
			message = "Please rate the dish";
		} else if(loc == "") {
			message = "Please select the location you ordered the dish";
		}else {
			var e = new entry(name, imgPath, rating, notes, time, loc);
			store.set(name, JSON.stringify(e));
			message = "Added new entry";
			name = "";
			imgPath = "";
			rating = "";
			notes = "";
			time = "";
			loc = "";
			updateCatalog();
			$.mobile.navigate("#catalog");
		}

		updateMessageView();
	});

	$("#new").on("click", function() {
		//$("#take-photo").show();
		navigator.geolocation.getCurrentPosition(locSuccess, error, locOptions);
	});

	$("#take-photo").on("click", function() {
		navigator.device.capture.captureImage(imgSuccess, error);
	});

	function imgSuccess(img) {
		$("#take-photo").hide();
		imgPath = img[0].fullPath;
		$('#photo').prepend($('<img>',{id:'entry-img',src: imgPath}))
	}

	function locSuccess(pos) {

		var map = new google.maps.Map($('#map'));
		var service;
		var h = "";
	 	var p = new google.maps.LatLng(pos.coords.latitude,pos.coords.longitude);
		var request = {
		    location: p,
		    radius: '25',
		    query: 'restaurant'
		};

		service = new google.maps.places.PlacesService(map);
	    service.textSearch(request, callback);

	    function callback(results, status) {
			if (status == google.maps.places.PlacesServiceStatus.OK) {
			  		
			h += "<option value='' disabled selected>Choose a restaurant</option>";
			 for (var i = 0; i < results.length; i++) {
			    h += "<option value='" + results[i].name.replace("'s", "s") + "'>" +results[i].name+ "</option>";
			}
			$('#loc').html(h);
			$('#loc').material_select();

			}
		}
	}

	function error(err) {
   		navigator.notification.alert('Error code: ' + err.code, null, 'Error');
	}

	function updateMessageView() {
		$("#message").text(message);
		$('#error').modal('open');
	}
}