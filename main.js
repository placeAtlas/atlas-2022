


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


var innerContainer = document.getElementById("innerContainer");
var container = document.getElementById("container");
var canvas = document.getElementById("highlightCanvas");
var context = canvas.getContext("2d");

var zoom = 1;
var zoomOrigin = [0, 50];

var dragging = false;
var lastPosition = [0, 0];


init();

function init(){

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
		document.getElementById("viewLink").className = "current";
		document.getElementById("drawLink").className = "";
		document.getElementById("aboutLink").className = "";
		document.getElementById("drawControls").style.display = "none";
		document.getElementById("aboutContainer").style.display = "none";

		initView();
		
	} else if(mode=="draw"){
		document.getElementById("viewLink").className = "";
		document.getElementById("drawLink").className = "current";
		document.getElementById("aboutLink").className = "";
		document.getElementById("drawControls").style.display = "block";
		document.getElementById("aboutContainer").style.display = "none";

		initDraw();
	} else if(mode=="about"){
		document.getElementById("viewLink").className = "";
		document.getElementById("drawLink").className = "";
		document.getElementById("aboutLink").className = "current";
		document.getElementById("drawControls").style.display = "none";
		document.getElementById("aboutContainer").style.display = "block";
	}

	applyView();

	function applyView(){

		//console.log(zoom);

		innerContainer.style.height = (zoom*1000)+"px";
		innerContainer.style.width = (zoom*1000)+"px";
		
		innerContainer.style.left = (container.clientWidth/2 - innerContainer.clientWidth/2 + zoomOrigin[0])+"px";
		innerContainer.style.top = (container.clientHeight/2 - innerContainer.clientHeight/2 + zoomOrigin[1])+"px";
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
		zoomOrigin = [0, 50];
		applyView();
	});

	container.addEventListener("dblclick", function(e){
		if(e.ctrlKey){

			zoomOut(e.layerX, e.layerY);
			
		} else {
			
			zoomIn(e.layerX, e.layerY);
		}
	});


	container.addEventListener("wheel", function(e){
		
		if(e.deltaY > 0){

			zoomOut(e.layerX, e.layerY);
			
		} else if(e.deltaY < 0){
			
			zoomIn(e.layerX, e.layerY);
		}
	});

	container.addEventListener("mousedown", function(e){
		lastPosition = [e.clientX, e.clientY];
		dragging = true;
	});

	window.addEventListener("mousemove", function(e){
		if(dragging){
			var deltaX = e.clientX - lastPosition[0];
			var deltaY = e.clientY - lastPosition[1];
			lastPosition = [e.clientX, e.clientY];

			zoomOrigin[0] += deltaX;
			zoomOrigin[1] += deltaY;

			applyView();
		}
	});

	window.addEventListener("mouseup", function(e){
		if(dragging){
			dragging = false;
		}
	});

	window.addEventListener("resize", applyView);
	
}
