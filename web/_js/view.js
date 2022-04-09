/*
	========================================================================
	The 2022 /r/place Atlas

	An Atlas of Reddit's 2022 /r/place, with information to each
	artwork	of the canvas provided by the community.

	Copyright (c) 2017 Roland Rytz <roland@draemm.li>
	Copyright (c) 2022 r/placeAtlas2 contributors

	Licensed under the GNU Affero General Public License Version 3
	https://place-atlas.stefanocoding.me/license.txt
	========================================================================
*/

var linesCanvas = document.getElementById("linesCanvas");
var linesContext = linesCanvas.getContext("2d");
var hovered = [];

var previousZoomOrigin = [0, 0];
var previousScaleZoomOrigin = [0, 0];

var backgroundCanvas = document.createElement("canvas");
backgroundCanvas.width = 2000;
backgroundCanvas.height = 2000;
var backgroundContext = backgroundCanvas.getContext("2d");

function updateLines(){

	linesCanvas.width = linesCanvas.clientWidth;
	linesCanvas.height = linesCanvas.clientHeight;
	linesContext.lineCap = "round";
	linesContext.lineWidth = Math.max(Math.min(zoom*1.5, 16*1.5), 6);
	linesContext.strokeStyle = "#000000";

	for(var i = 0; i < hovered.length; i++){
		var element = hovered[i].element;

		if(element.getBoundingClientRect().left != 0){

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
	}

	linesContext.lineWidth = Math.max(Math.min(zoom, 16), 4);
	linesContext.strokeStyle = "#FFFFFF";

	for(var i = 0; i < hovered.length; i++){
		var element = hovered[i].element;

		if(element.getBoundingClientRect().left != 0){
				
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
}

function renderBackground(atlas){

	backgroundContext.clearRect(0, 0, canvas.width, canvas.height);

	//backgroundCanvas.width = 1000 * zoom;
	//backgroundCanvas.height = 1000 * zoom;

	//backgroundContext.lineWidth = zoom;
	
	backgroundContext.fillStyle = "rgba(0, 0, 0, 0.6)";
	backgroundContext.fillRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);

	for(var i = 0; i < atlas.length; i++){

		var path = atlas[i].path;

		backgroundContext.beginPath();

		if(path[0]){
			//backgroundContext.moveTo(path[0][0]*zoom, path[0][1]*zoom);
			backgroundContext.moveTo(path[0][0], path[0][1]);
		}

		for(var p = 1; p < path.length; p++){
			//backgroundContext.lineTo(path[p][0]*zoom, path[p][1]*zoom);
			backgroundContext.lineTo(path[p][0], path[p][1]);
		}

		backgroundContext.closePath();

		var bgStrokeStyle;
		switch (atlas[i].diff) {
			case "add":
				bgStrokeStyle = "rgba(0, 255, 0, 1)";
				backgroundContext.lineWidth = 2;
				break;
			case "edit":
				bgStrokeStyle = "rgba(255, 255, 0, 1)";
				backgroundContext.lineWidth = 2;
				break;
			case "delete":
				bgStrokeStyle = "rgba(255, 0, 0, 1)";
				backgroundContext.lineWidth = 2;
				break;
			default:
				bgStrokeStyle = "rgba(255, 255, 255, 0.8)";
				break;
		}
		backgroundContext.strokeStyle = bgStrokeStyle;
		backgroundContext.stroke();
		backgroundContext.lineWidth = 1;
	}
}

function initView(){
	
	var wrapper = document.getElementById("wrapper");
	
	var objectsContainer = document.getElementById("objectsList");
	var closeObjectsListButton = document.getElementById("closeObjectsListButton");

	var filterInput = document.getElementById("searchList");

	var entriesList = document.getElementById("entriesList");
	var hideListButton = document.getElementById("hideListButton");
	var entriesListShown = true;

	var sortedAtlas;

	var entriesLimit = 50;
	var entriesOffset = 0;
	var moreEntriesButton = document.createElement("button");
	moreEntriesButton.innerHTML = "Show "+entriesLimit+" more";
	moreEntriesButton.id = "moreEntriesButton";
	moreEntriesButton.onclick = function(){
		buildObjectsList(null, null);
	};

	var defaultSort = "shuffle";
	document.getElementById("sort").value = defaultSort;

	var lastPos = [0, 0];

	var fixed = false; // Fix hovered items in place, so that clicking on links is possible

	renderBackground(atlas);
	render();

	buildObjectsList(null, null);

	timeCallback = (tempAtlas) => {
		renderBackground(tempAtlas);
		render();
	}

	// parse linked atlas entry id from link hash
	/*if (window.location.hash.substring(3)){
		zoom = 4;
		applyView();
		highlightEntryFromUrl();
	}*/

	if(document.documentElement.clientWidth > 2000){
		entriesListShown = true;
		wrapper.className = wrapper.className.replace(/ listHidden/g, "");
	}

	if(document.documentElement.clientWidth < 2000){
		entriesListShown = false;
		wrapper.className += " listHidden";
	}

	applyView();
	render();
	updateLines();

	

	var args = window.location.search;
	if(args){
		id = args.split("id=")[1];
		if(id){
			highlightEntryFromUrl();
		}
	}

	container.addEventListener("mousemove", function(e){
		if(e.sourceCapabilities){
			if(!e.sourceCapabilities.firesTouchEvents){
				updateHovering(e);
			}
		} else {
			updateHovering(e);
		}
	});

	filterInput.addEventListener("input", function(e){
		entriesOffset = 0;
		entriesList.innerHTML = "";
		entriesList.appendChild(moreEntriesButton);

		if(this.value === ""){
			document.getElementById("relevantOption").disabled = true;
			sortedAtlas = atlas.concat();
			buildObjectsList(null, null);
		} else {
			document.getElementById("relevantOption").disabled = false;
			buildObjectsList(this.value.toLowerCase(), "relevant");
		}

	});

	document.getElementById("sort").addEventListener("input", function(e){
		entriesOffset = 0;
		entriesList.innerHTML = "";
		entriesList.appendChild(moreEntriesButton);

		if(this.value != "relevant"){
			defaultSort = this.value;
		}

		buildObjectsList(filterInput.value.toLowerCase(), this.value);

	});
	
	hideListButton.addEventListener("click", function(e){
		entriesListShown = !entriesListShown;
		if(entriesListShown){
			wrapper.className = wrapper.className.replace(/ listHidden/g, "");
		} else {
			wrapper.className += " listHidden";
		}
		updateHovering();
		applyView();
		render();
		updateLines();
		return false;
	});

	closeObjectsListButton.addEventListener("click", function(e){
		hovered = [];
		objectsContainer.innerHTML = "";
		updateLines();
		closeObjectsListButton.className = "hidden";
		fixed = false;
		render();
	});

	function shuffle(){
		//console.log("shuffled atlas");
		for (var i = sortedAtlas.length - 1; i > 0; i--) {
			var j = Math.floor(Math.random() * (i + 1));
			var temp = sortedAtlas[i];
			sortedAtlas[i] = sortedAtlas[j];
			sortedAtlas[j] = temp;
		}
	}

	function highlightEntryFromUrl(){

		var objectsContainer = document.getElementById("objectsList");

		var id = 0;
		
		var args = window.location.search;
		if(args){
			id = args.split("id=")[1];
			if(id){
				id = id.split("&")[0];
			}
		}

		//var id = parseInt(window.location.hash.substring(3));
		
		var entries = atlas.filter(function(e){
			return e.id === id;
		});

		if (entries.length === 1){
			let entry = entries[0];

			document.title = entry.name + " on the 2022 /r/place Atlas";
			
			var infoElement = createInfoBlock(entry);
			objectsContainer.innerHTML = "";
			objectsContainer.appendChild(infoElement);

			//console.log(entry.center[0]);
			//console.log(entry.center[1]);

			zoom = 4;
			renderBackground(atlas);
			applyView();
			
			zoomOrigin = [
				 innerContainer.clientWidth/2  - entry.center[0]* zoom// + container.offsetLeft
				,innerContainer.clientHeight/2 - entry.center[1]* zoom// + container.offsetTop
			];

			scaleZoomOrigin = [
				2000/2 - entry.center[0]// + container.offsetLeft
				,2000/2 - entry.center[1]// + container.offsetTop
			];

			//console.log(zoomOrigin);
			
			applyView();
			hovered = [entry];
			render();
			hovered[0].element = infoElement;
			closeObjectsListButton.className = "";
			updateLines();
			fixed = true;
		}
	}

	function updateHovering(e, tapped){
		
		if(!dragging && (!fixed || tapped)){
			var pos = [
				 (e.clientX - (container.clientWidth/2 - innerContainer.clientWidth/2 + zoomOrigin[0] + container.offsetLeft))/zoom
				,(e.clientY - (container.clientHeight/2 - innerContainer.clientHeight/2 + zoomOrigin[1] + container.offsetTop))/zoom
			];
			var coords_p = document.getElementById("coords_p");
			coords_p.innerText = Math.ceil(pos[0]) + ", " + Math.ceil(pos[1]);

			if(pos[0] <= 2200 && pos[0] >= -100 && pos[0] <= 2200 && pos[0] >= -100){
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
					hovered = newHovered.sort(function(a, b){
						return calcPolygonArea(a.path) - calcPolygonArea(b.path);
					});

					objectsContainer.innerHTML = "";

					for(var i in hovered){
						var element = createInfoBlock(hovered[i]);

						objectsContainer.appendChild(element);

						hovered[i].element = element;
					}

					if(hovered.length > 0){
						closeObjectsListButton.className = "";
					} else {
						closeObjectsListButton.className = "hidden";
					}


					render();
				}
			}
		}
	}

	function buildObjectsList(filter, sort){

		if(entriesList.contains(moreEntriesButton)){
			entriesList.removeChild(moreEntriesButton);
		}

		if(!sortedAtlas){
			sortedAtlas = atlas.concat();
			document.getElementById("atlasSize").innerHTML = "The Atlas contains "+sortedAtlas.length+" entries.";
		}

		if(filter){
			sortedAtlas = atlas.filter(function(value){
				return (
					   value.name.toLowerCase().indexOf(filter) !== -1
					|| value.description.toLowerCase().indexOf(filter) !== -1
					|| value.subreddit && value.subreddit.toLowerCase().indexOf(filter) !== -1
				);
			});
			document.getElementById("atlasSize").innerHTML = "Found "+sortedAtlas.length+" entries.";
		} else {
			document.getElementById("atlasSize").innerHTML = "The Atlas contains "+sortedAtlas.length+" entries.";
		}

		if(sort === null){
			sort = defaultSort;
		}

		renderBackground(sortedAtlas);
		render();

		document.getElementById("sort").value = sort;

		//console.log(sort);

		var sortFunction;

		//console.log(sort);

		switch(sort){
			case "shuffle":
				sortFunction = null;
				if(entriesOffset == 0){
					shuffle();
				}
			break;
			case "alphaAsc":
				sortFunction = function(a, b){
					return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
				}
			break;
			case "alphaDesc":
				sortFunction = function(a, b){
					return b.name.toLowerCase().localeCompare(a.name.toLowerCase());
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
			case "area":
				sortFunction = function(a, b){
					return calcPolygonArea(b.path) - calcPolygonArea(a.path);
				}
			break;
			case "relevant":
				sortFunction = function(a, b){
					if(a.name.toLowerCase().indexOf(filter) !== -1 && b.name.toLowerCase().indexOf(filter) !== -1){
						if (a.name.toLowerCase().indexOf(filter) < b.name.toLowerCase().indexOf(filter)) {
							return -1;
						}
						else if (a.name.toLowerCase().indexOf(filter) > b.name.toLowerCase().indexOf(filter)) {
							return 1;
						} else {
							return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
						}
					} else if(a.name.toLowerCase().indexOf(filter) !== -1){
						return -1;
					} else if(b.name.toLowerCase().indexOf(filter) !== -1){
						return 1;
					} else {
						if (a.description.toLowerCase().indexOf(filter) < b.description.toLowerCase().indexOf(filter)) {
							return -1;
						}
						else if (a.description.toLowerCase().indexOf(filter) > b.description.toLowerCase().indexOf(filter)) {
							return 1;
						} else {
							return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
						}
					}
				}
			break;
		}

		if(sortFunction){
			sortedAtlas.sort(sortFunction);
		}

		for(var i = entriesOffset; i < entriesOffset+entriesLimit; i++){

			if(i >= sortedAtlas.length){
				break;
			}


			var element = createInfoBlock(sortedAtlas[i]);

			element.entry = sortedAtlas[i];

			element.addEventListener("mouseenter", function(e){
				if(!fixed && !dragging){
					objectsContainer.innerHTML = "";
					
					previousZoomOrigin = [zoomOrigin[0], zoomOrigin[1]];
					previousScaleZoomOrigin = [scaleZoomOrigin[0], scaleZoomOrigin[1]];

					applyView();
					
					zoomOrigin = [
						 innerContainer.clientWidth/2  - this.entry.center[0]* zoom// + container.offsetLeft
						,innerContainer.clientHeight/2 - this.entry.center[1]* zoom// + container.offsetTop
					]

					scaleZoomOrigin = [
						2000/2  - this.entry.center[0]
						,2000/2  - this.entry.center[1]
					]

					//console.log(zoomOrigin);

					
					applyView();
					hovered = [this.entry];
					render();
					hovered[0].element = this;
					updateLines();
				}

			});

			element.addEventListener("click", function(e){
				toggleFixed(e);
				if(fixed){
					previousZoomOrigin = [zoomOrigin[0], zoomOrigin[1]];
					previousScaleZoomOrigin = [scaleZoomOrigin[0], scaleZoomOrigin[1]];
					applyView();
				}
				if(document.documentElement.clientWidth < 500){
					objectsContainer.innerHTML = "";

					entriesListShown = false;
					wrapper.className += " listHidden";

					zoom = 4;
					renderBackground(atlas);
					applyView();
					updateHovering();
					
					zoomOrigin = [
						 innerContainer.clientWidth/2  - this.entry.center[0]* zoom// + container.offsetLeft
						,innerContainer.clientHeight/2 - this.entry.center[1]* zoom// + container.offsetTop
					]

					scaleZoomOrigin = [
						2000/2  - this.entry.center[0]
						,2000/2  - this.entry.center[1]
					]

					previousZoomOrigin = [zoomOrigin[0], zoomOrigin[1]];
					previousScaleZoomOrigin = [scaleZoomOrigin[0], scaleZoomOrigin[1]];

					fixed = true;

					hovered = [this.entry];
					hovered[0].element = this;
					
					applyView();
					render();
					updateLines();
					
				}
				
			});

			element.addEventListener("mouseleave", function(e){
				if(!fixed && !dragging){
					zoomOrigin = [previousScaleZoomOrigin[0]*zoom, previousScaleZoomOrigin[1]*zoom];
					scaleZoomOrigin = [previousScaleZoomOrigin[0], previousScaleZoomOrigin[1]];
					applyView();
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

	async function render(){

		context.clearRect(0, 0, canvas.width, canvas.height);

		//canvas.width = 1000*zoom;
		//canvas.height = 1000*zoom;
		
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
				//context.moveTo(path[0][0]*zoom, path[0][1]*zoom);
				context.moveTo(path[0][0], path[0][1]);
			}

			for(var p = 1; p < path.length; p++){
				//context.lineTo(path[p][0]*zoom, path[p][1]*zoom);
				context.lineTo(path[p][0], path[p][1]);
			}

			context.closePath();

			context.globalCompositeOperation = "source-over";

			context.fillStyle = "rgba(0, 0, 0, 1)";
			context.fill();
		}

		context.globalCompositeOperation = "source-out";
		context.drawImage(backgroundCanvas, 0, 0);

		if(hovered.length === 1 && hovered[0].path.length && hovered[0].overrideImage){
			let undisputableHovered = hovered[0];
			// Find the left-topmost point of all the paths
			let entryPosition = getPositionOfEntry(undisputableHovered);
			if(entryPosition){
				const [startX, startY] = entryPosition;
				let overrideImage = new Image();
				const loadingPromise = new Promise((res, rej) => {
					overrideImage.onerror = rej;
					overrideImage.onload = res;
				});
				overrideImage.src = "imageOverrides/" + undisputableHovered.overrideImage;
				try{
					await loadingPromise;
					context.globalCompositeOperation = "source-over";
					context.drawImage(overrideImage, startX, startY);
				}catch(ex){
					console.log("Cannot override image.");
					console.log(ex);
				}
			}
		}

		for(var i = 0; i < hovered.length; i++){

			var path = hovered[i].path;

			context.beginPath();

			if(path[0]){
				//context.moveTo(path[0][0]*zoom, path[0][1]*zoom);
				context.moveTo(path[0][0], path[0][1]);
			}

			for(var p = 1; p < path.length; p++){
				//context.lineTo(path[p][0]*zoom, path[p][1]*zoom);
				context.lineTo(path[p][0], path[p][1]);
			}

			context.closePath();

			context.globalCompositeOperation = "source-over";

			var hoverStrokeStyle;
			switch (hovered[i].diff) {
				case "add":
					hoverStrokeStyle = "rgba(0, 155, 0, 1)";
					break;
				case "edit":
					hoverStrokeStyle = "rgba(155, 155, 0, 1)";
					break;
				default:
					hoverStrokeStyle = "rgba(0, 0, 0, 1)";
					break;
			}
			context.strokeStyle = hoverStrokeStyle;
			//context.lineWidth = zoom;
			context.stroke();
		}


	}

	function toggleFixed(e, tapped){
		if(!fixed && hovered.length == 0){
			return 0;
		}
		fixed = !fixed;
		if(!fixed){
			updateHovering(e, tapped);
			render();
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

	container.addEventListener("touchstart", function(e){
		if(e.touches.length == 1){
			lastPos = [
				 e.touches[0].clientX
				,e.touches[0].clientY
			];
		}
	},{passive: true} );

	container.addEventListener("mouseup", function(e){
		if(Math.abs(lastPos[0] - e.clientX) + Math.abs(lastPos[1] - e.clientY) <= 4){
			toggleFixed(e);
		}
	});

	container.addEventListener("touchend", function(e){
		e.preventDefault()

		//console.log(e);
		//console.log(e.changedTouches[0].clientX);
		if(e.changedTouches.length == 1){
			e = e.changedTouches[0];
			//console.log(lastPos[0] - e.clientX);
			if(Math.abs(lastPos[0] - e.clientX) + Math.abs(lastPos[1] - e.clientY) <= 4){
				//console.log("Foo!!");
				dragging = false;
				fixed = false;
				setTimeout(
					function(){
						updateHovering(e, true);
					}
				, 10);
			}
		}
	});

	objectsContainer.addEventListener("scroll", function(e){
		updateLines();
	});

	window.addEventListener("resize", function(){
		//console.log(document.documentElement.clientWidth, document.documentElement.clientHeight);

		var viewportWidth = document.documentElement.clientWidth;

		if(document.documentElement.clientWidth > 2000 && viewportWidth <= 2000){
			entriesListShown = true;
			wrapper.className = wrapper.className.replace(/ listHidden/g, "");
		}

		if(document.documentElement.clientWidth < 2000 && viewportWidth >= 2000){
			entriesListShown = false;
			wrapper.className += " listHidden";
		}
		updateHovering();

		viewportWidth = document.documentElement.clientWidth;
		
		applyView();
		render();
		updateLines();
		
	});

}

function initExplore(){
	
	var wrapper = document.getElementById("wrapper");
	
	var objectsContainer = document.getElementById("objectsList");
	var closeObjectsListButton = document.getElementById("closeObjectsListButton");

	var filterInput = document.getElementById("searchList");

	var entriesList = document.getElementById("entriesList");
	var hideListButton = document.getElementById("hideListButton");
	var entriesListShown = true;

	var defaultSort = "shuffle";
	document.getElementById("sort").value = defaultSort;

	var lastPos = [0, 0];

	var fixed = false; // Fix hovered items in place, so that clicking on links is possible

	renderBackground(atlas);

	timeCallback = (tempAtlas) => {
		renderBackground(tempAtlas);
	}

	if(document.documentElement.clientWidth > 2000){
		entriesListShown = true;
		wrapper.className = wrapper.className.replace(/ listHidden/g, "");
	}

	if(document.documentElement.clientWidth < 2000){
		entriesListShown = false;
		wrapper.className += " listHidden";
	}

	applyView();

	container.addEventListener("mousemove", function(e){
		if(e.sourceCapabilities){
			if(!e.sourceCapabilities.firesTouchEvents){
				updateHovering(e);
			}
		} else {
			updateHovering(e);
		}
	});


	filterInput.addEventListener("input", function(e){
		entriesOffset = 0;
		entriesList.innerHTML = "";
		entriesList.appendChild(moreEntriesButton);

		if(this.value === ""){
			document.getElementById("relevantOption").disabled = true;
			sortedAtlas = atlas.concat();
		} else {
			document.getElementById("relevantOption").disabled = false;
		}

	});

	document.getElementById("sort").addEventListener("input", function(e){
		entriesOffset = 0;
		entriesList.innerHTML = "";
		entriesList.appendChild(moreEntriesButton);

		if(this.value != "relevant"){
			defaultSort = this.value;
		}

	});
	
	hideListButton.addEventListener("click", function(e){
		entriesListShown = !entriesListShown;
		if(entriesListShown){
			wrapper.className = wrapper.className.replace(/ listHidden/g, "");
		} else {
			wrapper.className += " listHidden";
		}
		updateHovering();
		applyView();
		return false;
	});

	closeObjectsListButton.addEventListener("click", function(e){
		hovered = [];
		objectsContainer.innerHTML = "";
		closeObjectsListButton.className = "hidden";
		fixed = false;
	});

	function updateHovering(e, tapped){
		
		if(!dragging && (!fixed || tapped)){
			var pos = [
				 (e.clientX - (container.clientWidth/2 - innerContainer.clientWidth/2 + zoomOrigin[0] + container.offsetLeft))/zoom
				,(e.clientY - (container.clientHeight/2 - innerContainer.clientHeight/2 + zoomOrigin[1] + container.offsetTop))/zoom
			];
			var coords_p = document.getElementById("coords_p");
			coords_p.innerText = Math.ceil(pos[0]) + ", " + Math.ceil(pos[1]);
		}
	}

	function toggleFixed(e, tapped){
		if(!fixed && hovered.length == 0){
			return 0;
		}
		fixed = !fixed;
	}

	container.addEventListener("mousedown", function(e){
		lastPos = [
			 e.clientX
			,e.clientY
		];
	});

	container.addEventListener("touchstart", function(e){
		if(e.touches.length == 1){
			lastPos = [
				 e.touches[0].clientX
				,e.touches[0].clientY
			];
		}
	},{passive: true} );

	container.addEventListener("mouseup", function(e){
		if(Math.abs(lastPos[0] - e.clientX) + Math.abs(lastPos[1] - e.clientY) <= 4){
			toggleFixed(e);
		}
	});

	container.addEventListener("touchend", function(e){
		e.preventDefault()

		//console.log(e);
		//console.log(e.changedTouches[0].clientX);
		if(e.changedTouches.length == 1){
			e = e.changedTouches[0];
			//console.log(lastPos[0] - e.clientX);
			if(Math.abs(lastPos[0] - e.clientX) + Math.abs(lastPos[1] - e.clientY) <= 4){
				//console.log("Foo!!");
				dragging = false;
				fixed = false;
			}
		}
	});

	window.addEventListener("resize", function(){
		//console.log(document.documentElement.clientWidth, document.documentElement.clientHeight);

		var viewportWidth = document.documentElement.clientWidth;

		if(document.documentElement.clientWidth > 2000 && viewportWidth <= 2000){
			entriesListShown = true;
			wrapper.className = wrapper.className.replace(/ listHidden/g, "");
		}

		if(document.documentElement.clientWidth < 2000 && viewportWidth >= 2000){
			entriesListShown = false;
			wrapper.className += " listHidden";
		}

		viewportWidth = document.documentElement.clientWidth;
		
		applyView();
		
	});

}