


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
	https://draemm.li/various/place-atlas/license.txt
	
	========================================================================
*/

var mobile = false;

var innerContainer = document.getElementById("innerContainer");
var container = document.getElementById("container");
var canvas = document.getElementById("highlightCanvas");
var context = canvas.getContext("2d");

var zoom = 1;
var zoomOrigin = [0, 0];

var dragging = false;
var lastPosition = [0, 0];

var viewportSize = [0, 0];

function applyView(){

	//console.log(zoom);

	innerContainer.style.height = (zoom*1000)+"px";
	innerContainer.style.width = (zoom*1000)+"px";
	
	innerContainer.style.left = (container.clientWidth/2 - innerContainer.clientWidth/2 + zoomOrigin[0] + container.offsetLeft)+"px";
	innerContainer.style.top = (container.clientHeight/2 - innerContainer.clientHeight/2 + zoomOrigin[1] + container.offsetTop)+"px";
}

init();

function init(){

	//console.log(document.documentElement.clientWidth, document.documentElement.clientHeight);

	zoomOrigin = [0, 0];
	applyView();

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

	if(mode=="view"){
		/*document.getElementById("viewLink").className = "current";
		document.getElementById("drawLink").className = "";
		document.getElementById("aboutLink").className = "";*/
		
		document.getElementById("drawControlsContainer").style.display = "none";
		document.getElementById("entriesListContainer").style.display = "flex";
		document.getElementById("entriesListBackground").style.display = "block";
		document.getElementById("hideListButton").style.display = "block";
		document.getElementById("objectsList").style.display = "block";
		
		/*
		document.getElementById("container").style.width = "100vw";
		document.getElementById("drawControls").style.display = "none";
		document.getElementById("entriesListContainer").style.display = "none";
		document.getElementById("entriesListBackground").style.display = "none";
		document.getElementById("author").style.display = "none";
		document.getElementById("zoomControls").style.right = "10px";
		document.getElementById("zoomControls").style.top = "10px";
		document.getElementById("hideListButton").style.display = "none";
		document.getElementById("objectsList").style.display = "none";
		*/

		initView();
		
	} else if(mode=="draw"){
		/*document.getElementById("viewLink").className = "";
		document.getElementById("drawLink").className = "current";
		document.getElementById("aboutLink").className = "";*/
		
		document.getElementById("drawControlsContainer").style.display = "block";
		document.getElementById("entriesListContainer").style.display = "none";
		document.getElementById("entriesListBackground").style.display = "none";
		document.getElementById("hideListButton").style.display = "none";

		initDraw();
	} else if(mode=="about"){
		window.location = "./about.html";
	}

	function zoomOut(x, y){

		zoomOrigin[0] += x - container.clientWidth/2;//((x/container.clientWidth)*2-1);
		zoomOrigin[1] += y - container.clientHeight/2;//((y/container.clientHeight)*2-1);

		zoomOrigin[0] = zoomOrigin[0]/2;
		zoomOrigin[1] = zoomOrigin[1]/2;
	
		zoom = zoom / 2;

		applyView();
	}

	function zoomIn(x, y){
		
		zoomOrigin[0] = zoomOrigin[0]*2;
		zoomOrigin[1] = zoomOrigin[1]*2;

		zoomOrigin[0] -= x - container.clientWidth/2;//((x/container.clientWidth)*2-1);
		zoomOrigin[1] -= y - container.clientHeight/2;//((y/container.clientHeight)*2-1);
		
		zoom = zoom * 2;

		applyView();
	}

	document.getElementById("zoomInButton").addEventListener("click", function(e){
		zoomIn(container.clientWidth/2, container.clientHeight/2);
	});

	document.getElementById("zoomOutButton").addEventListener("click", function(e){
		zoomOut(container.clientWidth/2, container.clientHeight/2);
	});

	document.getElementById("zoomResetButton").addEventListener("click", function(e){
		zoom = 1;
		zoomOrigin = [0, 0];
		applyView();
	});

	container.addEventListener("dblclick", function(e){
		if(e.ctrlKey){

			zoomOut(e.layerX, e.layerY);
			
		} else {
			
			zoomIn(e.layerX, e.layerY);
		}
		
		e.preventDefault();
	});


	container.addEventListener("wheel", function(e){
		
		if(e.deltaY > 0){

			zoomOut(e.layerX, e.layerY);
			
		} else if(e.deltaY < 0){
			
			zoomIn(e.layerX, e.layerY);
		}

		e.preventDefault();
	});

	container.addEventListener("mousedown", function(e){
		lastPosition = [e.clientX, e.clientY];
		dragging = true;
		e.preventDefault();
	});

	window.addEventListener("mousemove", function(e){
		if(dragging){
			var deltaX = e.clientX - lastPosition[0];
			var deltaY = e.clientY - lastPosition[1];
			lastPosition = [e.clientX, e.clientY];

			zoomOrigin[0] += deltaX;
			zoomOrigin[1] += deltaY;

			applyView();

			e.preventDefault();
		}
	});

	window.addEventListener("mouseup", function(e){
		if(dragging){
			dragging = false;
			e.preventDefault();
		}
	});

	window.addEventListener("resize", function(){
		//console.log(document.documentElement.clientWidth, document.documentElement.clientHeight);

		
		
		applyView();
	});
	
}
