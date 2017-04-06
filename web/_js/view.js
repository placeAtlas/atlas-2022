


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

function initView(){

	var objectsContainer = document.getElementById("objectsList");

	var linesCanvas = document.getElementById("linesCanvas");
	var linesContext = linesCanvas.getContext("2d");

	var backgroundCanvas = document.createElement("canvas");
	backgroundCanvas.width = 1000;
	backgroundCanvas.height = 1000;
	var backgroundContext = backgroundCanvas.getContext("2d");

	var filterInput = document.getElementById("searchList");

	var entriesList = document.getElementById("entriesList");
	var hideListButton = document.getElementById("hideListButton");
	var entriesListShown = true;

	var entriesLimit = 50;
	var entriesOffset = 0;
	var moreEntriesButton = document.createElement("button");
	moreEntriesButton.innerHTML = "Show "+entriesLimit+" more";
	moreEntriesButton.id = "moreEntriesButton";
	moreEntriesButton.onclick = function(){
		buildObjectsList();
	};
	//entriesList.appendChild(moreEntriesButton);

	var hovered = [];

	var lastPos = [0, 0];

	var fixed = false; // Fix hovered items in place, so that clicking on links is possible

	renderBackground();
	render();

	buildObjectsList();

	// parse linked atlas entry id from link hash
	/*if (window.location.hash.substring(3)){
		zoom = 4;
		applyView();
		highlightEntryFromUrl();
	}*/

	var args = window.location.search;
	if(args){
		id = args.split("id=")[1];
		if(id){
			highlightEntryFromUrl();
		}
	}

	container.addEventListener("mousemove", function(e){
		updateHovering(e);
	});

	filterInput.addEventListener("input", function(e){
		entriesOffset = 0;
		entriesList.innerHTML = "";
		entriesList.appendChild(moreEntriesButton);

		buildObjectsList(this.value.toLowerCase());

	});

	document.getElementById("sort").addEventListener("input", function(e){
		entriesOffset = 0;
		entriesList.innerHTML = "";
		entriesList.appendChild(moreEntriesButton);

		buildObjectsList(filterInput.value.toLowerCase());

	});
	
	hideListButton.addEventListener("click", function(e){
		entriesListShown = !entriesListShown;
		if(entriesListShown){
			hideListButton.className = "";
			document.getElementById("container").style.width = "calc(100% - 360px)";
			document.getElementById("container").style.marginLeft = "360px";
			document.getElementById("entriesListContainer").style.display = "flex";
			document.getElementById("entriesListBackground").style.display = "block";
			document.getElementById("zoomControls").style.left = "370px";
		} else {
			hideListButton.className = "reverse";
			document.getElementById("container").style.width = "100%";
			document.getElementById("container").style.marginLeft = "0px";
			document.getElementById("entriesListContainer").style.display = "none";
			document.getElementById("entriesListBackground").style.display = "none";
			document.getElementById("zoomControls").style.left = "10px";
		}
		applyView();
		updateHovering(e);
		render();
		updateLines();
	});

	function createInfoBlock(entry){
		var element = document.createElement("div");
		element.className = "object";

		var html = '<h2><a href="?id='+entry.id+'">'+entry.name+'</a></h2>';
		
		if(entry.description){
			html += '<p>'+entry.description+'</p>';
		}
		if(entry.website){
			html += '<a target="_blank" href='+entry.website+'>Website</a>';
		}
		if(entry.subreddit){
			if(entry.subreddit.substring(0, 2) == "r/"){
				entry.subreddit = "/" + entry.subreddit;
			} else if(entry.subreddit.substring(0, 1) != "/"){
				entry.subreddit = "/r/" + entry.subreddit;
			}
			html += '<a target="_blank" href=https://reddit.com'+entry.subreddit+'>'+entry.subreddit+'</a>';
		}
		element.innerHTML += html;
		
		return element;
	}

	function highlightEntryFromUrl(){

		var objectsContainer = document.getElementById("objectsList");

		var id = 0;
		
		var args = window.location.search;
		if(args){
			id = args.split("id=")[1];
			if(id){
				id = parseInt(id.split("&")[0]);
			}
		}

		//var id = parseInt(window.location.hash.substring(3));
		
		var entry = atlas.filter(function(e){
			return e.id === id;
		});

		if (entry.length === 1){
			entry = entry[0];
			var infoElement = createInfoBlock(entry);
			objectsContainer.innerHTML = "";
			objectsContainer.appendChild(infoElement);

			//console.log(entry.center[0]);
			//console.log(entry.center[1]);

			zoom = 4;
			applyView();
			
			zoomOrigin = [
				 innerContainer.clientWidth/2  - entry.center[0]* zoom// + container.offsetLeft
				,innerContainer.clientHeight/2 - entry.center[1]* zoom// + container.offsetTop
			];

			//console.log(zoomOrigin);
			
			applyView();
			hovered = [entry];
			render();
			hovered[0].element = infoElement;
			updateLines();
			fixed = true;
		}
	}

	function updateHovering(e){
		if(!dragging && !fixed){
			var pos = [
				 (e.clientX - (container.clientWidth/2 - innerContainer.clientWidth/2 + zoomOrigin[0] + container.offsetLeft))/zoom
				,(e.clientY - (container.clientHeight/2 - innerContainer.clientHeight/2 + zoomOrigin[1] + container.offsetTop))/zoom
			];

			if(pos[0] <= 1100 && pos[0] >= -100 && pos[0] <= 1100 && pos[0] >= -100){
				var newHovered = [];
				for(var i = 0; i < atlas.length; i++){
					if(pointIsInPolygon(pos, atlas[i].path)){
						newHovered.push(atlas[i]);
					}
				}

				var changed = false;

				if(hovered.length == newHovered.length){
					for(var i = 0; i < hovered.length; i++){
						if(hovered[i].id != newHovered[i].id){
							changed = true;
							break;
						}
					}
				} else {
					changed = true;
				}

				if(changed){
					hovered = newHovered;

					objectsContainer.innerHTML = "";

					for(var i in hovered){
						var element = createInfoBlock(hovered[i]);

						objectsContainer.appendChild(element);

						hovered[i].element = element;
					}


					render();
				}
			}
		}
	}

	function renderBackground(){

		backgroundContext.clearRect(0, 0, canvas.width, canvas.height);

		backgroundContext.fillStyle = "rgba(0, 0, 0, 0.6)";
		backgroundContext.fillRect(0, 0, canvas.width, canvas.height);

		for(var i = 0; i < atlas.length; i++){

			var path = atlas[i].path;

			backgroundContext.beginPath();

			if(path[0]){
				backgroundContext.moveTo(path[0][0], path[0][1]);
			}

			for(var p = 1; p < path.length; p++){
				backgroundContext.lineTo(path[p][0], path[p][1]);
			}

			backgroundContext.closePath();

			backgroundContext.strokeStyle = "rgba(255, 255, 255, 0.8)";
			backgroundContext.stroke();
		}
	}

	function buildObjectsList(filter){

		if(entriesList.contains(moreEntriesButton)){
			entriesList.removeChild(moreEntriesButton);
		}

		var sortedAtlas;

		if(filter){
			sortedAtlas = atlas.filter(function(value){
				return (value.name.toLowerCase().indexOf(filter) !== -1);
			});
			document.getElementById("atlasSize").innerHTML = "Found "+sortedAtlas.length+" entries.";
		} else {
			sortedAtlas = atlas.concat();
			document.getElementById("atlasSize").innerHTML = "The Atlas contains "+sortedAtlas.length+" entries.";
		}

		var sort = document.getElementById("sort").value;

		var sortFunction;

		switch(sort){
			case "alphaAsc":
				sortFunction = function(a, b){
					if (a.name < b.name) {
						return -1;
					}
					if (a.name > b.name) {
						return 1;
					}
						// a must be equal to b
					return 0;
				}
			break;
			case "alphaDesc":
				sortFunction = function(a, b){
					if (a.name < b.name) {
						return 1;
					}
					if (a.name > b.name) {
						return -1;
					}
						// a must be equal to b
					return 0;
				}
			break;
			case "newest":
				sortFunction = function(a, b){
					if (a.id > b.id) {
						return -1;
					}
					if (a.id < b.id) {
						return 1;
					}
						// a must be equal to b
					return 0;
				}
			break;
			case "oldest":
				sortFunction = function(a, b){
					if (a.id < b.id) {
						return -1;
					}
					if (a.id > b.id) {
						return 1;
					}
						// a must be equal to b
					return 0;
				}
			break;
		}

		sortedAtlas.sort(sortFunction);

		for(var i = entriesOffset; i < entriesOffset+entriesLimit; i++){

			if(i >= sortedAtlas.length){
				break;
			}


			var element = createInfoBlock(sortedAtlas[i]);

			element.entry = sortedAtlas[i];

			element.addEventListener("mouseenter", function(e){
				if(!fixed){
					objectsContainer.innerHTML = "";
					zoomOrigin = [
						 innerContainer.clientWidth/2  - this.entry.center[0]* zoom// + container.offsetLeft
						,innerContainer.clientHeight/2 - this.entry.center[1]* zoom// + container.offsetTop
					]

					//console.log(zoomOrigin);

					
					applyView();
					hovered = [this.entry];
					render();
					hovered[0].element = this;
					updateLines();
				}

			});

			element.addEventListener("mouseleave", function(e){
				if(!fixed){
					hovered = [];
					updateLines();
					render();
				}
			});

			entriesList.appendChild(element);

		}

		entriesOffset += entriesLimit;

		if(sortedAtlas.length > entriesOffset){
			moreEntriesButton.innerHTML = "Show "+Math.min(entriesLimit, sortedAtlas.length - entriesOffset)+" more";
			entriesList.appendChild(moreEntriesButton);
		}
	}

	function render(){
		context.globalCompositeOperation = "source-over";
		context.clearRect(0, 0, canvas.width, canvas.height);

		if(hovered.length > 0){
			container.style.cursor = "pointer";
		} else {
			container.style.cursor = "default";
		}


		for(var i = 0; i < hovered.length; i++){


			var path = hovered[i].path;

			context.beginPath();

			if(path[0]){
				context.moveTo(path[0][0], path[0][1]);
			}

			for(var p = 1; p < path.length; p++){
				context.lineTo(path[p][0], path[p][1]);
			}

			context.closePath();

			context.globalCompositeOperation = "source-over";

			context.fillStyle = "rgba(0, 0, 0, 1)";
			context.fill();
		}

		context.globalCompositeOperation = "source-out";
		context.drawImage(backgroundCanvas, 0, 0);

		for(var i = 0; i < hovered.length; i++){

			var path = hovered[i].path;

			context.beginPath();

			if(path[0]){
				context.moveTo(path[0][0], path[0][1]);
			}

			for(var p = 1; p < path.length; p++){
				context.lineTo(path[p][0], path[p][1]);
			}

			context.closePath();

			context.globalCompositeOperation = "source-over";

			context.strokeStyle = "rgba(0, 0, 0, 1)";
			context.stroke();
		}


	}

	function toggleFixed(e){
		if(!fixed && hovered.length == 0){
			return 0;
		}
		fixed = !fixed;
		if(!fixed){
			updateHovering(e);
			render();
		}
	}

	function updateLines(){

		linesCanvas.width = linesCanvas.clientWidth;
		linesCanvas.height = linesCanvas.clientHeight;
		linesContext.lineCap = "round";
		linesContext.lineWidth = Math.max(Math.min(zoom*1.5, 16*1.5), 6);
		linesContext.strokeStyle = "#000000";

		for(var i = 0; i < hovered.length; i++){
			var element = hovered[i].element;

			linesContext.beginPath();
			//linesContext.moveTo(element.offsetLeft + element.clientWidth - 10, element.offsetTop + 20);
			linesContext.moveTo(
				 element.getBoundingClientRect().left + document.documentElement.scrollLeft + element.clientWidth/2
				,element.getBoundingClientRect().top + document.documentElement.scrollTop + 20
			);
			linesContext.lineTo(
				 ~~(hovered[i].center[0]*zoom) + innerContainer.offsetLeft
				,~~(hovered[i].center[1]*zoom) + innerContainer.offsetTop
			);
			linesContext.stroke();
		}

		linesContext.lineWidth = Math.max(Math.min(zoom, 16), 4);
		linesContext.strokeStyle = "#FFFFFF";

		for(var i = 0; i < hovered.length; i++){
			var element = hovered[i].element;

			linesContext.beginPath();
			linesContext.moveTo(
				 element.getBoundingClientRect().left + document.documentElement.scrollLeft + element.clientWidth/2
				,element.getBoundingClientRect().top + document.documentElement.scrollTop + 20
			);
			linesContext.lineTo(
				 ~~(hovered[i].center[0]*zoom) + innerContainer.offsetLeft
				,~~(hovered[i].center[1]*zoom) + innerContainer.offsetTop
			);
			linesContext.stroke();
		}
	}

	window.addEventListener("resize", updateLines);
	window.addEventListener("mousemove", updateLines);
	window.addEventListener("dblClick", updateLines);
	window.addEventListener("wheel", updateLines);

	container.addEventListener("mousedown", function(e){
		lastPos = [
			 e.clientX
			,e.clientY
		];
	});

	container.addEventListener("mouseup", function(e){
		if(Math.abs(lastPos[0] - e.clientX) + Math.abs(lastPos[1] - e.clientY) <= 4){
			toggleFixed(e);
		}
	});

	objectsContainer.addEventListener("scroll", function(e){
		updateLines();
	});

}
