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

var finishButton = document.getElementById("finishButton");
var resetButton = document.getElementById("resetButton");
var undoButton = document.getElementById("undoButton");
var redoButton = document.getElementById("redoButton");
var highlightUnchartedLabel = document.getElementById("highlightUnchartedLabel");
var entryId = 0

var objectInfoBox = document.getElementById("objectInfo");
var hintText = document.getElementById("hint");

var periodsStatus = document.getElementById('periodsStatus')
var periodGroups = document.getElementById('periodGroups')
var periodGroupTemplate = document.getElementById('period-group').content.firstElementChild.cloneNode(true)
var periodsAdd = document.getElementById('periodsAdd')	

var exportButton = document.getElementById("exportButton");
var cancelButton = document.getElementById("cancelButton");

var exportOverlay = document.getElementById("exportOverlay");
var exportCloseButton = document.getElementById("exportCloseButton");
var exportBackButton = document.getElementById("exportBackButton")

var path = [];
var center = [1000, 1000];

var pathWithPeriods = []
var periodGroupElements = []

var disableDrawingOverride = false
var drawing = true;

[...document.querySelectorAll("#drawControlsContainer textarea")].forEach(el => {
	el.addEventListener("input", function() {
		this.style.height = "auto";
		this.style.height = (this.scrollHeight) + "px"
	})
})

function initDraw(){
	
	wrapper.classList.remove('listHidden')

	window.render = render
	window.renderBackground = renderBackground
	window.updateHovering = updateHovering

	// var startPeriodField = document.getElementById('startPeriodField')
	// var endPeriodField = document.getElementById('endPeriodField')
	// var periodVisbilityInfo = document.getElementById('periodVisbilityInfo')

	var rShiftPressed = false;
	var lShiftPressed = false;
	var shiftPressed = false;

	var highlightUncharted = true;

	renderBackground();
	applyView();

	container.style.cursor = "crosshair";
	
	var undoHistory = [];

	render(path);

	container.addEventListener("mousedown", function(e){
		lastPos = [
			 e.clientX,
			e.clientY
		];
	});

	function getCanvasCoords(x, y){
		x = x - container.offsetLeft;
		y = y - container.offsetTop;

		var pos = [
			~~((x - (container.clientWidth/2  - innerContainer.clientWidth/2  + zoomOrigin[0]))/zoom)+0.5,
			~~((y - (container.clientHeight/2 - innerContainer.clientHeight/2 + zoomOrigin[1]))/zoom)+0.5
		];
		
		if(shiftPressed && path.length > 0){
			var previous = path[path.length-1];
			
			if(Math.abs(pos[1] - previous[1]) > Math.abs(pos[0] - previous[0]) ){
				pos[0] = previous[0];
			} else {
				pos[1] = previous[1];
			}
		}

		return pos;
	}

	container.addEventListener("mouseup", function(e){
		

		if(Math.abs(lastPos[0] - e.clientX) + Math.abs(lastPos[1] - e.clientY) <= 4 && drawing){

			var coords = getCanvasCoords(e.clientX, e.clientY);
			
			path.push(coords);
			render(path);

			undoHistory = [];
			redoButton.disabled = true;
			undoButton.disabled = false;

			if(path.length >= 3){
				finishButton.disabled = false;
			}

			updatePath()
		}
	});

	window.addEventListener("mousemove", function(e){
		
		if(!dragging && drawing && path.length > 0){

			var coords = getCanvasCoords(e.clientX, e.clientY);
			render(path.concat([coords]));
		}
		
	});

	window.addEventListener("keyup", function(e){
		if(e.key == "Enter"){
			finish();
		} else if(e.key == "z" && e.ctrlKey){
			undo();
		} else if(e.key == "y" && e.ctrlKey){
			redo();
		} else if(e.key == "Escape"){
			exportOverlay.style.display = "none";
		} else if (e.key === "Shift" ){
			if(e.code === "ShiftRight"){
				rShiftPressed = false;
			} else if(e.code === "ShiftLeft"){
				lShiftPressed = false;
			}
			shiftPressed = rShiftPressed || lShiftPressed;
		}
	});

	window.addEventListener("keydown", function(e){
		if (e.key === "Shift" ){
			if(e.code === "ShiftRight"){
				rShiftPressed = true;
			} else if(e.code === "ShiftLeft"){
				lShiftPressed = true;
			}
			shiftPressed = rShiftPressed || lShiftPressed;
		}
	});

	finishButton.addEventListener("click", function(e){
		finish();
	});

	undoButton.addEventListener("click", function(e){
		undo();
	});

	redoButton.addEventListener("click", function(e){
		redo();
	});

	resetButton.addEventListener("click", function(e){
		reset();
	});
	
	cancelButton.addEventListener("click", function(e){
		back();
	});

	document.getElementById("nameField").addEventListener("keyup", function(e){
		if(e.key == "Enter"){
			exportJson();
		}
	});

	// document.getElementById("websiteField").addEventListener("keyup", function(e){
	// 	if(e.key == "Enter"){
	// 		exportJson();
	// 	}
	// });

	// document.getElementById("subredditField").addEventListener("keyup", function(e){
	// 	if(e.key == "Enter"){
	// 		exportJson();
	// 	}
	// });

	exportButton.addEventListener("click", function(e){
		exportJson();
	});

	exportCloseButton.addEventListener("click", function(e){
		reset();
		exportOverlay.style.display = "none";
	});

	exportBackButton.addEventListener("click", function(e){
		finish();
		exportOverlay.style.display = "none";
	});

	document.getElementById("highlightUncharted").addEventListener("click", function(e){
		highlightUncharted = this.checked;
		render(path);
	});

	function exportJson(){		
		var exportObject = {
			id: entryId,
			name: document.getElementById("nameField").value,
			description: document.getElementById("descriptionField").value,
			links: {},
			center: {},
			path: {},
		};

		pathWithPeriodsTemp = pathWithPeriods.concat()

		// console.log(pathWithPeriodsTemp)

		//  calculateCenter(path)

		for (let i = pathWithPeriodsTemp.length - 1; i > 0; i--) {
			for (let j = 0; j < i; j++) {
				if (JSON.stringify(pathWithPeriodsTemp[i][1]) === JSON.stringify(pathWithPeriodsTemp[j][1])) {
					pathWithPeriodsTemp[j][0] = pathWithPeriodsTemp[i][0] + ', ' + pathWithPeriodsTemp[j][0]
					pathWithPeriodsTemp.splice(i, 1)
					break
				}
			}
		}

		pathWithPeriodsTemp.forEach(([key, value]) => {
			// TODO: Compress periods on something like 0-13, 14.
			exportObject.path[key] = value
			exportObject.center[key] = calculateCenter(value)
		})

		let inputWebsite = document.getElementById("websiteField").value.split('\n').map(line => line.trim()).filter(line => line)
		let inputSubreddit = document.getElementById("subredditField").value.split('\n').map(line => line.trim().replace(/^\/?r\//, '')).filter(line => line)

		if (inputWebsite.length) exportObject.links.website = inputWebsite
		if (inputSubreddit.length) exportObject.links.subreddit = inputSubreddit

		var jsonString = JSON.stringify(exportObject, null, "\t");
		var textarea = document.getElementById("exportString");
		jsonString = jsonString.split("\n");
		jsonString = jsonString.join("\n    ");
		jsonString = "    "+jsonString;
		textarea.value = jsonString;
		var directPostUrl = "https://www.reddit.com/r/placeAtlas2/submit?selftext=true&title=New%20Submission&text="+encodeURIComponent(document.getElementById("exportString").value);
		if (jsonString.length > 7493) {
			directPostUrl = "https://www.reddit.com/r/placeAtlas2/submit?selftext=true&title=New%20Submission&text="+encodeURIComponent("    " + JSON.stringify(exportObject));
		}
		document.getElementById("exportDirectPost").href=directPostUrl;

		exportOverlay.style.display = "flex";
		
		textarea.focus();
		textarea.select();
	}

	function undo(){
		if(path.length > 0 && drawing){
			undoHistory.push(path.pop());
			redoButton.disabled = false;
			updatePath()
		}
	}

	function redo(){
		if(undoHistory.length > 0 && drawing){
			path.push(undoHistory.pop());
			undoButton.disabled = false;
			updatePath()
		}
	}

	function finish(){
		if (objectInfoBox.style.display === "block") return
		updatePath()
		drawing = false;
		disableDrawingOverride = true;
		objectInfoBox.style.display = "block";
		objectDraw.style.display = "none";
		hintText.style.display = "none";
		[...document.querySelectorAll("#drawControlsContainer textarea")].forEach(el => {
			if (el.value) el.style.height = (el.scrollHeight) + "px"
		})			
		// if (isOnPeriod()) {
		// 	periodVisbilityInfo.textContent = ""
		// } else {
		// 	periodVisbilityInfo.textContent = "Not visible during this period!"
		// }
	}

	function reset(){
		updatePath([])
		undoHistory = [];
		drawing = true;
		disableDrawingOverride = false;
		objectInfoBox.style.display = "none";
		objectDraw.style.display = "block";
		hintText.style.display = "block";

		document.getElementById("nameField").value = "";
		document.getElementById("descriptionField").value = "";
		document.getElementById("websiteField").value = "";
		document.getElementById("subredditField").value = "";
	}

	function back(){
		drawing = true;
		disableDrawingOverride = false;
		updatePath()
		objectInfoBox.style.display = "none";
		objectDraw.style.display = "block";
		hintText.style.display = "block";
	}

	function renderBackground(){

		backgroundContext.clearRect(0, 0, canvas.width, canvas.height);
			
		backgroundContext.fillStyle = "rgba(0, 0, 0, 1)";
		//backgroundContext.fillRect(0, 0, canvas.width, canvas.height);
		
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
			
			backgroundContext.fill();
		}
	}

	function render(path){

		context.globalCompositeOperation = "source-over";
		context.clearRect(0, 0, canvas.width, canvas.height);
		
		if(highlightUncharted){
			context.drawImage(backgroundCanvas, 0, 0);
			context.fillStyle = "rgba(0, 0, 0, 0.4)";
		} else {
			context.fillStyle = "rgba(0, 0, 0, 0.6)";
		}
		
		context.fillRect(0, 0, canvas.width, canvas.height);

		context.beginPath();

		if(path[0]){
			context.moveTo(path[0][0], path[0][1]);
		}
		
		for(var i = 1; i < path.length; i++){
			context.lineTo(path[i][0], path[i][1]);
		}

		context.closePath();

		context.strokeStyle = "rgba(255, 255, 255, 1)";
		context.stroke();

		context.globalCompositeOperation = "destination-out";

		context.fillStyle = "rgba(0, 0, 0, 1)";
		context.fill();
		
	}
	
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

	const getEntry = id => {
		const entries = atlasAll.filter(entry => entry.id === id)
		if (entries.length === 1) return entries[0]
		return {}
	}

	let params = new URLSearchParams(document.location.search)

	if (params.has('id')) {
		entry = getEntry(params.get('id'))
		document.getElementById("nameField").value = entry.name
		document.getElementById("descriptionField").value = entry.description
		document.getElementById("websiteField").value = entry.links.website.join('\n')
		document.getElementById("subredditField").value = entry.links.subreddit.map(sub => '/r/' + sub).join('\n')
		pathWithPeriods = Object.entries(entry.path)
		redoButton.disabled = true;
		undoButton.disabled = false;
		entryId = params.get('id')

		if (typeof entry.period === "string") {
            entry.period.split(', ').some(period => {
                if (period.search('-') + 1) {
                    var [before, after] = period.split('-')
                    startPeriodField.value = before
					endPeriodField.value = after
					// console.log(before, after)
					return
                }
            })
        }

	} else {
		pathWithPeriods.push([defaultPeriod, []])
	}

	initPeriodGroups()

	zoom = 4;

	zoomOrigin = [
		innerContainer.clientWidth/2  - center[0] * zoom,// + container.offsetLeft
		innerContainer.clientHeight/2 - center[1] * zoom// + container.offsetTop
	];

	scaleZoomOrigin = [
	   2000/2 - center[0],// + container.offsetLeft
	   2000/2 - center[1]// + container.offsetTop
	];

   applyView();

	document.addEventListener('timeupdate', (event) => {
		renderBackground()
		updatePeriodGroups()
	})

	periodsAdd.addEventListener('click', () => {
		pathWithPeriods.push([defaultPeriod, []])
		initPeriodGroups()
	})

}

function calculateCenter(path){

	var area = 0,
		i,
		j,
		point1,
		point2,
		x = 0,
		y = 0,
		f;

	for (i = 0, j = path.length - 1; i < path.length; j=i,i++) {
		point1 = path[i];
		point2 = path[j];
		f = point1[0] * point2[1] - point2[0] * point1[1];
		area += f;
		x += (point1[0] + point2[0]) * f;
		y += (point1[1] + point2[1]) * f;
	}
	area *= 3;

	return [Math.floor(x / area)+0.5, Math.floor(y / area)+0.5];
}

function isOnPeriod(start = parseInt(startPeriodField.value), end = parseInt(endPeriodField.value), current = period) {
	// console.log(start, end, current, current >= start && current <= end)
	return current >= start && current <= end
}

function initPeriodGroups() {

	periodGroupElements = []
	periodGroups.textContent = ''

	// console.log(pathWithPeriods)

	pathWithPeriods.forEach(([period, path], index) => {
		let periodGroupEl = periodGroupTemplate.cloneNode(true)
		periodGroupEl.id = "periodGroup" + index

		let startPeriodEl = periodGroupEl.querySelector('.period-start')
		let endPeriodEl = periodGroupEl.querySelector('.period-end')
		let periodVisibilityEl = periodGroupEl.querySelector('.period-visible')
		let periodDeleteEl = periodGroupEl.querySelector('.period-delete')
		let periodDuplicateEl = periodGroupEl.querySelector('.period-duplicate')

		let [start, end] = parsePeriod(period)

		startPeriodEl.id = "periodStart" + index
		startPeriodEl.previousSibling.for = startPeriodEl.id
		endPeriodEl.id = "periodEnd" + index
		endPeriodEl.previousSibling.for = endPeriodEl.id
		periodVisibilityEl.id = "periodVisibility" + index

		startPeriodEl.value = start
		startPeriodEl.max = maxPeriod
		endPeriodEl.value = end
		endPeriodEl.max = maxPeriod

		startPeriodEl.addEventListener('input', event => {
			timelineSlider.value = parseInt(event.target.value)
			updateTime(parseInt(event.target.value))
			// console.log(parseInt(event.target.value))
		})
		endPeriodEl.addEventListener('input', event => {
			timelineSlider.value = parseInt(event.target.value)
			updateTime(parseInt(event.target.value))
			// console.log(parseInt(event.target.value))
		})
		periodDeleteEl.addEventListener('click', () => {
			if (pathWithPeriods.length === 1) return
			pathWithPeriods = pathWithPeriods.filter((_, i) => i !== index)
			initPeriodGroups()
		})
		periodDuplicateEl.addEventListener('click', () => {
			pathWithPeriods.push([pathWithPeriods[index][0], [...pathWithPeriods[index][1]]])
			initPeriodGroups()
		})

		periodGroups.appendChild(periodGroupEl)
		periodGroupElements.push({
			periodGroupEl,
			startPeriodEl,
			endPeriodEl,
			periodVisibilityEl
		})
	})
	// console.log(periodGroupTemplate)

	updatePeriodGroups()

}

function updatePeriodGroups() {
	// console.log('updatePeriodGroups')
	var pathToActive = []
	var lastActivePathIndex
	var currentActivePathIndex 
	var currentActivePathIndexes = []

	periodGroupElements.forEach((elements, index) => {
		let {
			periodGroupEl,
			startPeriodEl,
			endPeriodEl,
			periodVisibilityEl
		} = elements

		if (periodGroupEl.dataset.active === "true") lastActivePathIndex = index
		periodGroupEl.dataset.active = ""

		if (isOnPeriod(
			parseInt(startPeriodEl.value), 
			parseInt(endPeriodEl.value),
			period
		)) {
			pathToActive = pathWithPeriods[index][1]
			currentActivePathIndex = index
			currentActivePathIndexes.push(index)
			periodGroupEl.dataset.active = "true"
		}

		pathWithPeriods[index][0] = formatPeriod(
			parseInt(startPeriodEl.value), 
			parseInt(endPeriodEl.value),
			period
		)
	})

	// console.log('updatePeriodGroups searcher', pathToActive, lastActivePathIndex, currentActivePathIndex, period)

	periodsStatus.textContent = ""

	// if (currentActivePathIndexes.length > 1) {
	// 	periodsStatus.textContent = "Collision detected! Please resolve it."
	// 	currentActivePathIndexes.forEach(index => {
	// 		periodGroupElements[index].periodGroupEl.dataset.status = "error"
	// 	})
	// 	currentActivePathIndex = undefined
	// } 
	
	// console.log(lastActivePathIndex)
	if (lastActivePathIndex !== undefined) {
		if (lastActivePathIndex === currentActivePathIndex) {
			// just update the path
			pathWithPeriods[currentActivePathIndex] = [
				formatPeriod(
					parseInt(periodGroupElements[currentActivePathIndex].startPeriodEl.value),
					parseInt(periodGroupElements[currentActivePathIndex].endPeriodEl.value)
				),
				path
			]
			updatePath()
		} else if (currentActivePathIndex === undefined) {
			pathWithPeriods[lastActivePathIndex][1] = path
			updatePath([])
		} else {
			// switch the path
			pathWithPeriods[lastActivePathIndex][1] = path
			updatePath(pathToActive)

		}
	} else {
		console.log('direct active', pathToActive)
		updatePath(pathToActive)
	}

	drawing = disableDrawingOverride ? false : currentActivePathIndex !== undefined
	
}

function parsePeriod(periodString) {
	periodString = periodString + ""
	// TODO: Support for multiple/alternative types of canvas
	if (periodString.search('-') + 1) {
		var [start, end] = periodString.split('-').map(i => parseInt(i))
		return [start, end]
	} else {
		let periodNew = parseInt(periodString)
		return [periodNew, periodNew]
	}
}

function formatPeriod(start, end) {
	if (start === end) return start
	else return start + "-" + end
}

function updatePath(newPath) {
	// console.log('updatePath', path, newPath)
	if (newPath) path = newPath
	// console.log('updatePath', path, newPath)
	if (path.length > 3) center = calculateCenter(path)
	render(path)
	undoButton.disabled = path.length == 0; // Maybe make it undo the cancel action in the future
	undoHistory = []

	updateErrors()
}

function updateErrors() {
	if (path.length === 0) {
		periodsStatus.textContent = "No paths available on this period!"
	}

	let [conflicts, invalidPaths, allErrors] = getErrors()

	if (allErrors.length > 0) {
		periodsStatus.textContent = `Problems detected. Please check the groups indicated by red.`
		if (conflicts.length > 0) {
			periodsStatus.textContent += `\nConflicts on ${conflicts.join(', ')}.`
			currentActivePathIndex = undefined
		}
		if (invalidPaths.length > 0) periodsStatus.textContent += `\nInsufficient paths on ${invalidPaths.join(', ')}.`
		allErrors.forEach(index => {
			periodGroupElements[index].periodGroupEl.dataset.status = "error"
		})
		finishButton.disabled = true
	} else {
		periodsStatus.textContent = ``
		finishButton.disabled = false
		periodGroupElements.forEach((elements, index) => {
			let {
				periodGroupEl,
				startPeriodEl,
				endPeriodEl,
				periodVisibilityEl
			} = elements
			if (periodGroupEl.dataset.active === "true") periodGroupEl.dataset.status = "active"
			else periodGroupEl.dataset.status = ""
		})
	}
}
 
function getConflicts() {

	let conflicts = new Set()
	
	for (let i = pathWithPeriods.length - 1; i > 0; i--) {
		for (let j = 0; j < i; j++) {
			let [start1, end1] = parsePeriod(pathWithPeriods[i][0])
			let [start2, end2] = parsePeriod(pathWithPeriods[j][0])
			if (
				(start2 <= start1 && start1 <= end2) ||
				(start2 <= end1 && end1 <= end2) ||
				(start1 <= start2 && start2 <= end1) ||
				(start1 <= end2 && end2 <= end1)
			) {
				conflicts.add(i)
				conflicts.add(j)
			}
		}
	}

	conflicts = [...conflicts]

	return conflicts

}

function getErrors() {
	let conflicts = getConflicts()
	let invalidPaths = []

	pathWithPeriods.forEach(([period, path], i) => {
		if (path.length < 3) invalidPaths.push(i)
	})
	
	// console.info('conflicts', conflicts)
	// console.info('invalid paths', invalidPaths)

	return [conflicts, invalidPaths, [...new Set([...conflicts, ...invalidPaths])]]
}

// function compressPeriod(periodsString) {
// 	let periodStrings = periodsString.split(", ")
// 	let validPeriods = new Set()
// 	periodStrings.forEach(periodString => {
// 		let [start, end] = parsePeriod(periodString)
// 		for (var i = start; i <= end; i++) {
// 			validPeriods.add(i)
// 		}
// 	})
// 	validPeriods = [...validPeriods].sort()
// }