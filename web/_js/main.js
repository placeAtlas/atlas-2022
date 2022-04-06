


/*
	========================================================================
	The /r/place Atlas
	
	An Atlas of Reddit's /r/place, with information to each
	artwork	of the canvas provided by the community.
	
	Copyright (C) 2017 Roland Rytz <roland@draemm.li>
	Licensed under the GNU Affero General Public License Version 3
	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as
	published by the Free Software Foundation, either version 3 of the
	License, or (at your option) any later version.
	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
	For more information, see:
	http://place-atlas.stefanocoding.me/license.txt
	
	========================================================================
*/


var innerContainer = document.getElementById("innerContainer");
var container = document.getElementById("container");
var canvas = document.getElementById("highlightCanvas");
var context = canvas.getContext("2d");

var zoom = 1;

if(window.devicePixelRatio){
	zoom = 1/window.devicePixelRatio;
}

var maxZoom = 128;
var minZoom = 0.1;

var zoomOrigin = [0, 0];
var scaleZoomOrigin = [0, 0];

var dragging = false;
var lastPosition = [0, 0];

var viewportSize = [0, 0];

document.getElementById("donateButton").addEventListener("click", function(e){
	document.getElementById("bitcoinQR").src = "./_img/bitcoinQR.png?from=index";
	document.getElementById("donateOverlay").style.display = "flex";
});

document.getElementById("closeBitcoinButton").addEventListener("click", function(e){
	document.getElementById("donateOverlay").style.display = "none";
});

function applyView(){
	
	//console.log(zoomOrigin, scaleZoomOrigin);
	//console.log(scaleZoomOrigin[0]);

	scaleZoomOrigin[0] = Math.max(-1000, Math.min(1000, scaleZoomOrigin[0]));
	scaleZoomOrigin[1] = Math.max(-1000, Math.min(1000, scaleZoomOrigin[1]));

	zoomOrigin = [scaleZoomOrigin[0]*zoom, scaleZoomOrigin[1]*zoom];

	innerContainer.style.height = (~~(zoom*2000))+"px";
	innerContainer.style.width = (~~(zoom*2000))+"px";
	
	innerContainer.style.left = ~~(container.clientWidth/2 - innerContainer.clientWidth/2 + zoomOrigin[0] + container.offsetLeft)+"px";
	innerContainer.style.top = ~~(container.clientHeight/2 - innerContainer.clientHeight/2 + zoomOrigin[1] + container.offsetTop)+"px";
	
}

var atlas = null;

init();

async function init(){
	// For Reviewing Reddit Changes
	//let resp = await fetch("../tools/temp_atlas.json");
	let resp = await fetch(".atlas.json");
	atlas = await resp.json();
	atlas.sort(function (a, b) {
		if (a.center[1] < b.center[1]) {
			return -1;
		}
		if (a.center[1] > b.center[1]) {
			return 1;
		}
		// a must be equal to b
		return 0;
	});
	

	//console.log(document.documentElement.clientWidth, document.documentElement.clientHeight);

	zoomOrigin = [0, 0];
	applyView();

	var initialPinchDistance = 0;
	var initialPinchZoom = 0;
	var initialPinchZoomOrigin = [0, 0];

	var desiredZoom;
	var zoomAnimationFrame;

	var mode = "view";

	var args = window.location.search;
	if(args){
		mode = args.split("mode=")[1];
		if(mode){
			mode = mode.split("&")[0];
		} else {
			mode = "view";
		}
	}

	if(mode == "view"){
		
		wrapper.className = wrapper.className.replace(/ drawMode/g, "");
		initView();
		
	} else if(mode=="draw"){
		
		wrapper.className += " draw";
		initDraw();
		
	} else if(mode=="about"){
		window.location = "./about.html";
	} else if(mode=="overlap"){
		wrapper.className = wrapper.className.replace(/ drawMode/g, "");
		if(initOverlap){
			initOverlap();
		}
	}
	
	function changeOverlapMode(){
		console.log(mode)
		switch(mode){
			case "overlap":
				window.location.href = "?mode=explore"
				break;
			case "explore":
				window.location.href = "?"
				break;
			default:
				window.location.href = "?mode=overlap"
				break;
		}

		return false;
	}

	const modeMap = {
		"view": "Overlap",
		"overlap": "Explore",
		"explore": "Atlas"
	}

	const toggleMode = document.getElementById("toggleMode");
	toggleMode.onclick = changeOverlapMode;
	toggleMode.innerHTML = modeMap[mode];

	document.getElementById("loading").style.display = "none";

	document.getElementById("zoomInButton").addEventListener("click", function(e){

		/*if(zoomAnimationFrame){
			window.cancelAnimationFrame(zoomAnimationFrame);
		}*/
		
		var x = container.clientWidth/2;
		var y = container.clientHeight/2;

		initialPinchZoomOrigin = [
			scaleZoomOrigin[0],
			scaleZoomOrigin[1]
		];

		initialPinchZoom = zoom;
		
		lastPosition = [x, y];
		zoom = zoom * 2;
		zoom = Math.max(minZoom, Math.min(maxZoom, zoom));
		
		applyZoom(x, y, zoom);
		
	});

	document.getElementById("zoomOutButton").addEventListener("click", function(e){

		/*if(zoomAnimationFrame){
			window.cancelAnimationFrame(zoomAnimationFrame);
		}*/
		
		var x = container.clientWidth/2;
		var y = container.clientHeight/2;

		initialPinchZoomOrigin = [
			scaleZoomOrigin[0],
			scaleZoomOrigin[1]
		];

		initialPinchZoom = zoom;
		
		lastPosition = [x, y];
		zoom = zoom / 2;
		zoom = Math.max(minZoom, Math.min(maxZoom, zoom));
		
		applyZoom(x, y, zoom);
	});

	document.getElementById("zoomResetButton").addEventListener("click", function(e){
		zoom = 1;
		zoomOrigin = [0, 0];
		scaleZoomOrigin = [0, 0];
		updateLines();
		applyView();
	});

	container.addEventListener("dblclick", function(e){
		/*if(zoomAnimationFrame){
			window.cancelAnimationFrame(zoomAnimationFrame);
		}*/

		var x = e.clientX - container.offsetLeft;
		var y = e.clientY - container.offsetTop;

		initialPinchZoomOrigin = [
			scaleZoomOrigin[0],
			scaleZoomOrigin[1]
		];

		initialPinchZoom = zoom;
		
		lastPosition = [x, y];

		if(e.ctrlKey){

			zoom = zoom / 2;
			
		} else {
			
			zoom = zoom * 2;
		}

		zoom = Math.max(minZoom, Math.min(maxZoom, zoom));
		applyZoom(x, y, zoom);

		e.preventDefault();
	});


	container.addEventListener("wheel", function(e){

		/*if(zoomAnimationFrame){
			window.cancelAnimationFrame(zoomAnimationFrame);
		}*/

		var x = e.clientX - container.offsetLeft;
		var y = e.clientY - container.offsetTop;

		initialPinchZoomOrigin = [
			scaleZoomOrigin[0],
			scaleZoomOrigin[1]
		];

		initialPinchZoom = zoom;
		
		lastPosition = [x, y];
		
		if(e.deltaY > 0){

			zoom = zoom / 2;
			
		} else if(e.deltaY < 0){
			
			zoom = zoom * 2;
		}

		zoom = Math.max(minZoom, Math.min(maxZoom, zoom));
		applyZoom(x, y, zoom);

		e.preventDefault();
	});

	/*function setDesiredZoom(x, y, target){
		zoom = (zoom*2 + target)/3;
		//console.log(zoom);
		if(Math.abs(1 - zoom/target) <= 0.01){
			zoom = target;
		}
		applyZoom(x, y, zoom);
		if(zoom != target){
			zoomAnimationFrame = window.requestAnimationFrame(function(){
				setDesiredZoom(x, y, target);
			});
		}
	}*/

	container.addEventListener("mousedown", function(e){
		mousedown(e.clientX, e.clientY);
		e.preventDefault();
	});
	
	container.addEventListener("touchstart", function(e){

		if(e.touches.length == 2){
			e.preventDefault();
		}

		touchstart(e);

	});

	function mousedown(x, y){
		lastPosition = [x, y];
		dragging = true;
	}

	function touchstart(e){
		
		if(e.touches.length == 1){
			
			mousedown(e.touches[0].clientX, e.touches[0].clientY);
			
		} else if(e.touches.length == 2){
			
			initialPinchDistance = Math.sqrt(
				  Math.pow(e.touches[0].clientX - e.touches[1].clientX, 2)
				+ Math.pow(e.touches[0].clientY - e.touches[1].clientY, 2)
			);

			initialPinchZoom = zoom;
			initialPinchZoomOrigin = [
				scaleZoomOrigin[0],
				scaleZoomOrigin[1]
			];
			
			mousedown(
				(e.touches[0].clientX + e.touches[1].clientX)/2,
				(e.touches[0].clientY + e.touches[1].clientY)/2
			);
			
		}
		
	}

	window.addEventListener("mousemove", function(e){
		updateLines();
		mousemove(e.clientX, e.clientY);
		if(dragging){
			e.preventDefault();
		}
	});
	window.addEventListener("touchmove", function(e){

		if(e.touches.length == 2 || e.scale > 1){
			e.preventDefault();
		}

		touchmove(e);

	},
	{passive: false}
	);

	function mousemove(x, y){
		if(dragging){
			var deltaX = x - lastPosition[0];
			var deltaY = y - lastPosition[1];
			lastPosition = [x, y];

			zoomOrigin[0] += deltaX;
			zoomOrigin[1] += deltaY;

			scaleZoomOrigin[0] += deltaX/zoom;
			scaleZoomOrigin[1] += deltaY/zoom;

			previousZoomOrigin = [zoomOrigin[0], zoomOrigin[1]];
			previousScaleZoomOrigin = [scaleZoomOrigin[0], scaleZoomOrigin[1]];

			updateLines();
			applyView();
		}
	}

	function touchmove(e){

		updateLines();
		
		if(e.touches.length == 1){
			
			mousemove(e.touches[0].clientX, e.touches[0].clientY);
			
		} else if(e.touches.length == 2){
			
			var newPinchDistance = Math.sqrt(
				  Math.pow(e.touches[0].clientX - e.touches[1].clientX, 2)
				+ Math.pow(e.touches[0].clientY - e.touches[1].clientY, 2)
			);

			zoom = initialPinchZoom * newPinchDistance / initialPinchDistance;

			var x = (e.touches[0].clientX + e.touches[1].clientX)/2 - container.offsetLeft;
			var y = (e.touches[0].clientY + e.touches[1].clientY)/2 - container.offsetTop;

			applyZoom(x, y, zoom);
			
		}
		
	}

	function applyZoom(x, y, zoom){

		var deltaX = x - lastPosition[0];
		var deltaY = y - lastPosition[1];

		var pinchTranslateX = (x - container.clientWidth/2 - deltaX);
		var pinchTranslateY = (y - container.clientHeight/2 - deltaY);

		scaleZoomOrigin[0] = initialPinchZoomOrigin[0] + deltaX/zoom + pinchTranslateX/zoom - pinchTranslateX/initialPinchZoom;
		scaleZoomOrigin[1] = initialPinchZoomOrigin[1] + deltaY/zoom + pinchTranslateY/zoom - pinchTranslateY/initialPinchZoom;

		zoomOrigin[0] = scaleZoomOrigin[0]*zoom;
		zoomOrigin[1] = scaleZoomOrigin[1]*zoom;
		
		applyView();
		updateLines();
	}

	window.addEventListener("mouseup", function(e){
		if(dragging){
			e.preventDefault();
		}
		mouseup(e.clientX, e.clientY);
	});
	window.addEventListener("touchend", touchend);

	function mouseup(x, y){
		if(dragging){
			dragging = false;
		}
	}

	function touchend(e){
		
		if(e.touches.length == 0){
			
			mouseup();
			
		} else if(e.touches.length == 1){
			initialPinchZoom = zoom;
			lastPosition = [e.touches[0].clientX, e.touches[0].clientY];
		}
		
	}

	window.addEventListener("resize", function(){
		//console.log(document.documentElement.clientWidth, document.documentElement.clientHeight);
		
		applyView();
	});
	
}
