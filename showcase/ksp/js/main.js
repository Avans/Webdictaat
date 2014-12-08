/*
	Main JavaScript file for KSP.
	We make use of the jQuery JavaScript Library (http://jquery.com/).
*/

$("body").ready(function() {
	checkHead(); //Call function checkHead when DOM is ready.
	scrollMenu(); //Call function scrollMenu when DOM is ready.

	$(window).scroll(function() { //Call functions resizeHead and scrollMenu when the user scrolls.
		resizeHead();
		scrollMenu();
	});

	$(window).resize(function() { //Call functions checkHead and scrollMenu when the user resizes the window.
		checkHead();
		scrollMenu();
	});

	function checkHead() { //Checks the window width. If lower or equal to 1280, add class scrolled to menu_head. If higher than 1280, call function resizeHead.
		if ($(window).width() <= 1280 && !$("#menu_head").hasClass("scrolled")) {
			$("#menu_head").addClass("scrolled");
		} else {
			resizeHead();
		}
	}

	function resizeHead() { //Checks the window width. If higher than 1280, check if the user has scrolled. If the user has, add class scrolled to menu_head, if not, remove class scrolled from menu_head.
		if ($(window).width() > 1280) {
			if ($(window).scrollTop() && !$("#menu_head").hasClass("scrolled")) {
				$("#menu_head").addClass("scrolled");
			} else if (!$(window).scrollTop() && $("#menu_head").hasClass("scrolled")) {
				$("#menu_head").removeClass("scrolled");
			}
		}
	}

	function scrollMenu() { //Scrolls the menu down to how far the user has scrolled.
		if ($(window).width() > 1280 && $(document).scrollTop() > 15) {
			$("#container_left").css("margin-top", ($(document).scrollTop() - 15) + "px");
		} else {
			$("#container_left").css("margin-top", "");
		}
	}
});