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
const finishButton = document.getElementById("finishButton");
const resetButton = document.getElementById("resetButton");
const undoButton = document.getElementById("undoButton");
const redoButton = document.getElementById("redoButton");
const highlightUnchartedLabel = document.getElementById("highlightUnchartedLabel");
let entryId = 0

const objectInfoBox = document.getElementById("objectInfo");

var drawControlsBody = document.getElementById("offcanvasDraw-drawControls");
var objectInfoBody = document.getElementById("offcanvasDraw-objectInfo");
var objectInfoForm = document.getElementById("objectInfo");

const hintText = document.getElementById("hint");

const periodsStatus = document.getElementById('periodsStatus')
const periodGroups = document.getElementById('periodGroups')
const periodGroupTemplate = document.getElementById('period-group').content.firstElementChild.cloneNode(true)
const periodsAdd = document.getElementById('periodsAdd')

const exportButton = document.getElementById("exportButton");
const cancelButton = document.getElementById("cancelButton");

const exportModal = new bootstrap.Modal(document.getElementById("exportModal"))
const exportModalElement = document.getElementById("exportModal")

const exportOverlay = document.getElementById("exportOverlay");
const exportCloseButton = document.getElementById("exportCloseButton");
const exportBackButton = document.getElementById("exportBackButton")

const nameField = document.getElementById("nameField")
const descriptionField = document.getElementById("descriptionField")
const websiteField = document.getElementById("websiteField")
const subredditField = document.getElementById("subredditField")
const discordField = document.getElementById("discordField")
const wikiField = document.getElementById("wikiField")
const exportArea = document.getElementById("exportString");

let path = [];
let center = [1000, 1000];

let pathWithPeriods = []
let periodGroupElements = []

let disableDrawingOverride = false
let drawing = true;

let undoHistory = [];

const periodClipboard = {
	"index": null,
	"path": null
}

	;[...document.querySelectorAll("#objectInfo textarea")].forEach(el => {
		el.addEventListener("input", function () {
			this.style.height = "auto";
			this.style.height = (this.scrollHeight) + "px"
		})
	})

window.initDraw = initDraw
function initDraw() {

	wrapper.classList.remove('listHidden')

	var backButton = document.getElementById("showListButton");
	backButton.insertAdjacentHTML("afterend", '<button class="btn btn-outline-primary" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasDraw" aria-controls="offcanvasDraw">Edit</button><a id="drawBackButton" class="btn btn-outline-primary" href="./">Exit Draw Mode</a>');
	backButton.remove();

	var myOffcanvas = document.getElementById("offcanvasDraw");
	var bsOffcanvas = new bootstrap.Offcanvas(myOffcanvas);
	bsOffcanvas.show();

	window.render = render
	window.renderBackground = renderBackground
	window.updateHovering = updateHovering

	// let startPeriodField = document.getElementById('startPeriodField')
	// let endPeriodField = document.getElementById('endPeriodField')
	// let periodVisbilityInfo = document.getElementById('periodVisbilityInfo')

	let rShiftPressed = false;
	let lShiftPressed = false;
	let shiftPressed = false;

	let highlightUncharted = true;

	renderBackground();
	applyView();

	container.style.cursor = "crosshair";

	render(path);

	container.addEventListener("mousedown", function (e) {
		lastPos = [
			e.clientX,
			e.clientY
		];
	});

	function getCanvasCoords(x, y) {
		x = x - container.offsetLeft;
		y = y - container.offsetTop;

		const pos = [
			~~((x - (container.clientWidth / 2 - innerContainer.clientWidth / 2 + zoomOrigin[0])) / zoom) + 0.5,
			~~((y - (container.clientHeight / 2 - innerContainer.clientHeight / 2 + zoomOrigin[1])) / zoom) + 0.5
		];

		if (shiftPressed && path.length > 0) {
			const previous = path[path.length - 1];

			if (Math.abs(pos[1] - previous[1]) > Math.abs(pos[0] - previous[0])) {
				pos[0] = previous[0];
			} else {
				pos[1] = previous[1];
			}
		}

		return pos;
	}

	container.addEventListener("mouseup", function (e) {


		if (Math.abs(lastPos[0] - e.clientX) + Math.abs(lastPos[1] - e.clientY) <= 4 && drawing) {

			const coords = getCanvasCoords(e.clientX, e.clientY);

			path.push(coords);
			render(path);

			undoHistory = [];
			redoButton.disabled = true;
			undoButton.disabled = false;

			if (path.length >= 3) {
				finishButton.disabled = false;
			}

			updatePath()
		}
	});

	window.addEventListener("mousemove", function (e) {

		if (!dragging && drawing && path.length > 0) {

			const coords = getCanvasCoords(e.clientX, e.clientY);
			render(path.concat([coords]));
		}

	});

	window.addEventListener("keyup", function(e){
		if (e.key == "z" && e.ctrlKey){
			undo();
		} else if (e.key == "y" && e.ctrlKey) {
			redo();
		} else if (e.key === "Shift" ){
			if(e.code === "ShiftRight"){
				rShiftPressed = false;
			} else if (e.code === "ShiftLeft") {
				lShiftPressed = false;
			}
			shiftPressed = rShiftPressed || lShiftPressed;
		}
	});

	window.addEventListener("keydown", function(e) {
		if (e.key === "Shift") {
			if (e.code === "ShiftRight") {
				rShiftPressed = true;
			} else if (e.code === "ShiftLeft") {
				lShiftPressed = true;
			}
			shiftPressed = rShiftPressed || lShiftPressed;
		}
	});

	finishButton.addEventListener("click", function (e) {
		finish();
	});

	undoButton.addEventListener("click", function (e) {
		undo();
	});

	redoButton.addEventListener("click", function (e) {
		redo();
	});

	resetButton.addEventListener("click", function (e) {
		reset();
	});

	cancelButton.addEventListener("click", function (e) {
		back();
	});

	// refocus on button when modal is closed
	exportModalElement.addEventListener('hidden.bs.modal', function() {
		document.getElementById("exportButton").focus();
	});

	exportModalElement.addEventListener('shown.bs.modal', function() {
		document.getElementById("exportButton").focus();
	});

	// bind it the same as you bind a button, but on submit
	objectInfoForm.addEventListener('submit', function(e) {
		e.preventDefault()
		exportJson()
	});

	document.getElementById("highlightUncharted").addEventListener("click", function(e){
		highlightUncharted = this.checked;
		render(path);
	});

	function exportJson() {
		const exportObject = {
			id: entryId,
			name: nameField.value,
			description: descriptionField.value,
			links: {},
			center: {},
			path: {},
		};

		const pathWithPeriodsTemp = pathWithPeriods.concat()

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

		const inputWebsite = websiteField.value.split('\n').map(line => line.trim()).filter(line => line)
		const inputSubreddit = subredditField.value.split('\n').map(line => line.trim().replace(/(?:(?:(?:(?:https?:\/\/)?(?:(?:www|old|new|np)\.)?)?reddit\.com)?\/)?[rR]\/([A-Za-z0-9][A-Za-z0-9_]{2,20})(?:\/[^" ]*)*/, '$1')).filter(line => line)
		const inputDiscord = discordField.value.split('\n').map(line => line.trim().replace(/(?:https?:\/\/)?(?:www\.)?(?:(?:discord)?\.?gg|discord(?:app?)\.com\/invite)\/([^\s/]+?)(?=\b)/, '$1')).filter(line => line)
		const inputWiki = wikiField.value.split('\n').map(line => line.trim().replace(/ /g, '_')).filter(line => line)

		if (inputWebsite.length) exportObject.links.website = inputWebsite
		if (inputSubreddit.length) exportObject.links.subreddit = inputSubreddit
		if (inputDiscord.length) exportObject.links.discord = inputDiscord
		if (inputWiki.length) exportObject.links.wiki = inputWiki

		let jsonString = JSON.stringify(exportObject, null, "\t");
		jsonString = jsonString.split("\n");
		jsonString = jsonString.join("\n    ");
		jsonString = "    " + jsonString;
		exportArea.value = jsonString;
		let directPostUrl = "https://www.reddit.com/r/placeAtlas2/submit?selftext=true&title=New%20Submission&text=" + encodeURIComponent(exportArea.value);
		if (jsonString.length > 7493) {
			directPostUrl = "https://www.reddit.com/r/placeAtlas2/submit?selftext=true&title=New%20Submission&text=" + encodeURIComponent("    " + JSON.stringify(exportObject));
		}
		document.getElementById("exportDirectPost").href = directPostUrl;

		exportModal.show();
	}

	function undo() {
		if (path.length > 0 && drawing) {
			undoHistory.push(path.pop());
			redoButton.disabled = false;
			updatePath()
		}
	}

	function redo() {
		if (undoHistory.length > 0 && drawing) {
			path.push(undoHistory.pop());
			undoButton.disabled = false;
			updatePath()
		}
	}

	function finish() {
		if (objectInfoBox.style.display === "block") return
		updatePath()
		drawing = false;
		disableDrawingOverride = true;
		objectInfoBody.removeAttribute("style");
		drawControlsBody.style.display = "none";
		[...document.querySelectorAll("#objectInfo textarea")].forEach(el => {
			if (el.value) el.style.height = (el.scrollHeight) + "px"
		})
		// if (isOnPeriod()) {
		// 	periodVisbilityInfo.textContent = ""
		// } else {
		// 	periodVisbilityInfo.textContent = "Not visible during this period!"
		// }
	}

	function reset() {
		updatePath([])
		undoHistory = [];
		drawing = true;
		disableDrawingOverride = false;
		objectInfoBody.style.display = "none";
		drawControlsBody.removeAttribute("style");

		nameField.value = "";
		descriptionField.value = "";
		websiteField.value = "";
		subredditField.value = "";
	}

	function back() {
		drawing = true;
		disableDrawingOverride = false;
		updatePath()
		objectInfoBody.style.display = "none";
		drawControlsBody.removeAttribute("style");
	}

	function renderBackground() {

		backgroundContext.clearRect(0, 0, canvas.width, canvas.height);

		backgroundContext.fillStyle = "rgba(0, 0, 0, 1)";
		//backgroundContext.fillRect(0, 0, canvas.width, canvas.height);

		for (let i = 0; i < atlas.length; i++) {

			const path = atlas[i].path;

			backgroundContext.beginPath();

			if (path[0]) {
				backgroundContext.moveTo(path[0][0], path[0][1]);
			}

			for (let p = 1; p < path.length; p++) {
				backgroundContext.lineTo(path[p][0], path[p][1]);
			}

			backgroundContext.closePath();

			backgroundContext.fill();
		}
	}

	function render(path) {

		if (!Array.isArray(path)) return

		context.globalCompositeOperation = "source-over";
		context.clearRect(0, 0, canvas.width, canvas.height);

		if (highlightUncharted) {
			context.drawImage(backgroundCanvas, 0, 0);
			context.fillStyle = "rgba(0, 0, 0, 0.4)";
		} else {
			context.fillStyle = "rgba(0, 0, 0, 0.6)";
		}

		context.fillRect(0, 0, canvas.width, canvas.height);

		context.beginPath();

		if (path[0]) {
			context.moveTo(path[0][0], path[0][1]);
		}

		for (let i = 1; i < path.length; i++) {
			context.lineTo(path[i][0], path[i][1]);
		}

		context.closePath();

		context.strokeStyle = "rgba(255, 255, 255, 1)";
		context.stroke();

		context.globalCompositeOperation = "destination-out";

		context.fillStyle = "rgba(0, 0, 0, 1)";
		context.fill();

	}

	function updateHovering(e, tapped) {
		if (!dragging && (!fixed || tapped)) {
			const pos = [
				(e.clientX - (container.clientWidth / 2 - innerContainer.clientWidth / 2 + zoomOrigin[0] + container.offsetLeft)) / zoom
				, (e.clientY - (container.clientHeight / 2 - innerContainer.clientHeight / 2 + zoomOrigin[1] + container.offsetTop)) / zoom
			];

			const coords_p = document.getElementById("coords_p");

			// Displays coordinates as zero instead of NaN
			if (isNaN(pos[0]) == true) {
				coords_p.innerText = "0, 0";
			} else {
				coords_p.innerText = Math.ceil(pos[0]) + ", " + Math.ceil(pos[1]);
			}
		}
	}

	const getEntry = id => {
		const entries = atlasAll.filter(entry => entry.id === id)
		if (entries.length === 1) return entries[0]
		return {}
	}

	const params = new URLSearchParams(document.location.search)

	if (params.has('id')) {
		const entry = getEntry(params.get('id'))
		nameField.value = entry.name
		descriptionField.value = entry.description
		websiteField.value = entry.links.website.join('\n')
		subredditField.value = entry.links.subreddit.map(sub => 'r/' + sub).join('\n')
		discordField.value = entry.links.discord.join('\n')
		wikiField.value = entry.links.wiki.map(page => page.replace(/_/, ' ')).join('\n')
		redoButton.disabled = true;
		undoButton.disabled = false;
		entryId = params.get('id')

		Object.entries(entry.path).forEach(([period, path]) => {
			period.split(", ").forEach(period => {
				pathWithPeriods.push([period, path])
			})
		})

	} else {
		pathWithPeriods.push([defaultPeriod, []])
	}

	initPeriodGroups()

	zoom = 4;

	zoomOrigin = [
		innerContainer.clientWidth / 2 - center[0] * zoom,// + container.offsetLeft
		innerContainer.clientHeight / 2 - center[1] * zoom// + container.offsetTop
	];

	scaleZoomOrigin = [
		2000 / 2 - center[0],// + container.offsetLeft
		2000 / 2 - center[1]// + container.offsetTop
	];

	applyView();

	document.addEventListener('timeupdate', (event) => {
		renderBackground()
		updatePeriodGroups()
	})

	periodsAdd.addEventListener('click', () => {
		pathWithPeriods.push([defaultPeriod, []])
		// console.log(JSON.stringify(pathWithPeriods))
		initPeriodGroups()
	})

}

function calculateCenter(path) {
	let result = polylabel(path)
	return [Math.floor(result[0]) + 0.5, Math.floor(result[1]) + 0.5]
}

function initPeriodGroups() {

	periodGroupElements = []
	periodGroups.textContent = ''

	// console.log(pathWithPeriods)

	pathWithPeriods.forEach(([period, path], index) => {
		const periodGroupEl = periodGroupTemplate.cloneNode(true)
		periodGroupEl.id = "periodGroup" + index

		const startPeriodEl = periodGroupEl.querySelector('.period-start')
		const endPeriodEl = periodGroupEl.querySelector('.period-end')
		// const periodVisibilityEl = periodGroupEl.querySelector('.period-visible')
		const periodDeleteEl = periodGroupEl.querySelector('.period-delete')
		const periodDuplicateEl = periodGroupEl.querySelector('.period-duplicate')
		const periodVariationEl = periodGroupEl.querySelector('.period-variation')
		const periodCopyEl = periodGroupEl.querySelector('.period-copy')

		const [start, end, variation] = parsePeriod(period)
		// console.log(period, start, end, variation)

		startPeriodEl.id = "periodStart" + index
		startPeriodEl.previousElementSibling.htmlFor = startPeriodEl.id
		endPeriodEl.id = "periodEnd" + index
		endPeriodEl.previousElementSibling.htmlFor = endPeriodEl.id
		// periodVisibilityEl.id = "periodVisibility" + index
		periodVariationEl.id = "periodVariation" + index
		periodCopyEl.id = "periodCopy" + index

		startPeriodEl.max = variationsConfig[variation].versions.length - 1
		endPeriodEl.max = variationsConfig[variation].versions.length - 1
		startPeriodEl.value = start
		endPeriodEl.value = end

		startPeriodEl.addEventListener('input', event => {
			timelineSlider.value = parseInt(event.target.value)
			updateTime(parseInt(event.target.value), variation)
			// console.log(parseInt(event.target.value))
		})
		endPeriodEl.addEventListener('input', event => {
			timelineSlider.value = parseInt(event.target.value)
			updateTime(parseInt(event.target.value), variation)
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
		periodVariationEl.addEventListener('input', event => {
			const newVariation = event.target.value
			const newVariationConfig = variationsConfig[newVariation]
			startPeriodEl.value = newVariationConfig.default
			startPeriodEl.max = newVariationConfig.versions.length - 1
			endPeriodEl.value = newVariationConfig.default
			endPeriodEl.max = newVariationConfig.versions.length - 1
			updateTime(newVariationConfig.default, newVariation)
			if (periodVariationEl.value == "tfc") {
				const variationIcon = periodVariationEl.parentElement.querySelector('.input-group-text');
				variationIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 192 192"><defs><style>.a{fill-rule:evenodd;}</style></defs><path class="a" d="M69.79,83.55c-.47,.65-.59,1.35-.59,1.35-.26,1.47,.76,2.72,.92,3.12,2.84,7.1,4.49,13.93,3.97,16.39-.47,2.18-5.6,5.65-12.36,8.33-3.63,1.44-6.11,2.99-8.04,5.01-7.17,7.51-10.24,17.86-7.14,24.05,3.93,7.84,18.38,5.86,28.05-3.85,2.09-2.1,3.15-3.83,6.63-10.77,2.97-5.93,4.26-8.05,5.47-8.95,2.04-1.52,9.82,.1,17.41,3.64,1.71,.8,2.31,1.04,2.78,.98,0,0,.22-.05,.43-.14,1.31-.59,17.43-17,25.58-25.34-1.79,.09-3.57,.18-5.36,.28-2.84,2.63-5.68,5.27-8.52,7.9-10.85-10.85-21.7-21.71-32.55-32.56,1.73-1.8,3.46-3.6,5.18-5.4-.29-1.56-.57-3.12-.86-4.69-1.34,1.27-19.42,18.45-21.01,20.66Zm-10.45,44.57c2.5,0,4.53,2.03,4.53,4.53s-2.03,4.53-4.53,4.53-4.53-2.03-4.53-4.53,2.03-4.53,4.53-4.53Z"/><path class="f" d="M132.9,97.36c-.88,.22-7.88,1.92-9.91-1.04-1.11-1.62-1.05-4.71-.52-6.57,.74-2.59,.9-4.06,.25-4.73-.73-.76-2.03-.31-3.73-.18-3.4,.27-8.08-.86-9.6-3.16-2.77-4.21,4.48-13.03,2.31-14.69-.17-.13-.34-.16-.67-.22-4.24-.73-6.79,4.71-11.66,5.1-2.93,.24-6.21-1.39-7.72-4.02-1.11-1.94-1-3.96-.86-4.95h0s7.38-7.39,17.6-17.52c12.75,12.73,25.51,25.47,38.26,38.2l-13.75,13.79Z"/><polygon points="154 0 154 38 39 38 39 192 0 192 0 0"/><polygon points="192 38 192 192 77 192 77 153 154 153 154 38"/></svg>';
			} else {
				const variationIcon = periodVariationEl.parentElement.querySelector('.input-group-text');
				variationIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 192 192" aria-hidden="true"><polygon points="154 0 154 38 39 38 39 192 0 192 0 0"/><polygon points="192 38 192 192 77 192 77 153 154 153 154 38"/><rect x="77" y="77" width="38" height="38"/></svg>';
			}
			// console.log(parseInt(event.target.value))
		})

		periodCopyEl.addEventListener("click", event => {
			const index = parseInt(event.target.id.split('periodCopy')[1])
			if (event.target.textContent === " Copy") {
				event.target.className = "period-copy btn btn-primary btn-sm flex-fill";
				event.target.innerHTML = '<i class="bi bi-clipboard-x" aria-hidden="true"></i> End'
				periodClipboard.index = index
				periodClipboard.path = [...pathWithPeriods[index][1]]
				startPeriodEl.disabled = true;
				endPeriodEl.disabled = true;
				updatePeriodGroups()
			} else if (event.target.textContent === " End") {
				event.target.className = "period-copy btn btn-secondary btn-sm flex-fill";
				event.target.innerHTML = '<i class="bi bi-clipboard" aria-hidden="true"></i> Copy'
				periodClipboard.index = null
				periodClipboard.path = null
				startPeriodEl.disabled = false;
				endPeriodEl.disabled = false;
				updatePeriodGroups()
			} else if (event.target.textContent === " Paste") {
				pathWithPeriods[index][1] = [...periodClipboard.path]
				// console.log(pathWithPeriods[index])
				if (pathWithPeriods.length > 2) console.log(pathWithPeriods[2])
				initPeriodGroups()
			}
		})

		periodGroups.appendChild(periodGroupEl)

		for (const variation in variationsConfig) {
			const optionEl = document.createElement('option')
			optionEl.value = variation
			optionEl.textContent = variationsConfig[variation].name
			periodVariationEl.appendChild(optionEl)
		}

		periodVariationEl.value = variation

		if (periodVariationEl.value == "tfc") {
			const variationIcon = periodVariationEl.parentElement.querySelector('.input-group-text');
			variationIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 192 192"><defs><style>.a{fill-rule:evenodd;}</style></defs><path class="a" d="M69.79,83.55c-.47,.65-.59,1.35-.59,1.35-.26,1.47,.76,2.72,.92,3.12,2.84,7.1,4.49,13.93,3.97,16.39-.47,2.18-5.6,5.65-12.36,8.33-3.63,1.44-6.11,2.99-8.04,5.01-7.17,7.51-10.24,17.86-7.14,24.05,3.93,7.84,18.38,5.86,28.05-3.85,2.09-2.1,3.15-3.83,6.63-10.77,2.97-5.93,4.26-8.05,5.47-8.95,2.04-1.52,9.82,.1,17.41,3.64,1.71,.8,2.31,1.04,2.78,.98,0,0,.22-.05,.43-.14,1.31-.59,17.43-17,25.58-25.34-1.79,.09-3.57,.18-5.36,.28-2.84,2.63-5.68,5.27-8.52,7.9-10.85-10.85-21.7-21.71-32.55-32.56,1.73-1.8,3.46-3.6,5.18-5.4-.29-1.56-.57-3.12-.86-4.69-1.34,1.27-19.42,18.45-21.01,20.66Zm-10.45,44.57c2.5,0,4.53,2.03,4.53,4.53s-2.03,4.53-4.53,4.53-4.53-2.03-4.53-4.53,2.03-4.53,4.53-4.53Z"/><path class="f" d="M132.9,97.36c-.88,.22-7.88,1.92-9.91-1.04-1.11-1.62-1.05-4.71-.52-6.57,.74-2.59,.9-4.06,.25-4.73-.73-.76-2.03-.31-3.73-.18-3.4,.27-8.08-.86-9.6-3.16-2.77-4.21,4.48-13.03,2.31-14.69-.17-.13-.34-.16-.67-.22-4.24-.73-6.79,4.71-11.66,5.1-2.93,.24-6.21-1.39-7.72-4.02-1.11-1.94-1-3.96-.86-4.95h0s7.38-7.39,17.6-17.52c12.75,12.73,25.51,25.47,38.26,38.2l-13.75,13.79Z"/><polygon points="154 0 154 38 39 38 39 192 0 192 0 0"/><polygon points="192 38 192 192 77 192 77 153 154 153 154 38"/></svg>';
		} else {
			const variationIcon = periodVariationEl.parentElement.querySelector('.input-group-text');
			variationIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 192 192" aria-hidden="true"><polygon points="154 0 154 38 39 38 39 192 0 192 0 0"/><polygon points="192 38 192 192 77 192 77 153 154 153 154 38"/><rect x="77" y="77" width="38" height="38"/></svg>';
		}
		
		periodGroupElements.push({
			periodGroupEl,
			startPeriodEl,
			endPeriodEl,
			// periodVisibilityEl,
			periodVariationEl,
			periodCopyEl
		})
	})
	// console.log(periodGroupTemplate)

	updatePeriodGroups()

}

function updatePeriodGroups() {
	// console.log('updatePeriodGroups')
	let pathToActive = []
	let lastActivePathIndex
	let currentActivePathIndex
	const currentActivePathIndexes = []

	periodGroupElements.forEach((elements, index) => {
		const {
			periodGroupEl,
			startPeriodEl,
			endPeriodEl,
			// periodVisibilityEl,
			periodVariationEl,
			periodCopyEl
		} = elements

		if (periodGroupEl.dataset.active === "true") lastActivePathIndex = index
		periodGroupEl.dataset.active = ""

		if (isOnPeriod(
			parseInt(startPeriodEl.value),
			parseInt(endPeriodEl.value),
			periodVariationEl.value,
			currentPeriod,
			currentVariation
		)) {
			pathToActive = pathWithPeriods[index][1]
			currentActivePathIndex = index
			currentActivePathIndexes.push(index)
			periodGroupEl.dataset.active = "true"
		}

		pathWithPeriods[index][0] = formatPeriod(
			parseInt(startPeriodEl.value),
			parseInt(endPeriodEl.value),
			periodVariationEl.value
		)

		if (periodClipboard.index !== null) {
			if (index !== periodClipboard.index) {
				periodCopyEl.innerHTML = '<i class="bi bi-clipboard-plus" aria-hidden="true"></i> Paste'
				// console.log(JSON.stringify(pathWithPeriods[index][1]))
				// console.log(JSON.stringify(periodClipboard.path))
				// console.log(JSON.stringify(pathWithPeriods[index][1]) === JSON.stringify(periodClipboard.path))
				if (JSON.stringify(pathWithPeriods[index][1]) === JSON.stringify(periodClipboard.path)) {
					periodCopyEl.innerHTML = '<i class="bi bi-clipboard-check" aria-hidden="true"></i> Paste'
					periodCopyEl.disabled = true
				} else {
					periodCopyEl.innerHTML = '<i class="bi bi-clipboard-plus" aria-hidden="true"></i> Paste'
					periodCopyEl.disabled = false
				}
			} else {
				periodCopyEl.className = "period-copy btn btn-primary btn-sm flex-fill";
				periodCopyEl.innerHTML = '<i class="bi bi-clipboard-x" aria-hidden="true"></i> End'
			}
		} else {
			periodCopyEl.innerHTML = '<i class="bi bi-clipboard" aria-hidden="true"></i> Copy'
			periodCopyEl.disabled = false
		}
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
			const {
				startPeriodEl,
				endPeriodEl,
				periodVariationEl
			} = periodGroupElements[currentActivePathIndex]
			pathWithPeriods[currentActivePathIndex] = [
				formatPeriod(
					parseInt(startPeriodEl.value),
					parseInt(endPeriodEl.value),
					periodVariationEl.value,
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
		// console.log('direct active', pathToActive)
		updatePath(pathToActive)
	}

	drawing = disableDrawingOverride ? false : currentActivePathIndex !== undefined

}

function formatPeriod(start, end, variation) {
	let periodString
	if (start === end) periodString = start
	else periodString = start + "-" + end
	if (variation !== "default") periodString = variationsConfig[variation].code + ":" + periodString
	return periodString
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

	const [conflicts, invalidPaths, allErrors] = getErrors()

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
			const { periodGroupEl } = elements
			if (periodGroupEl.dataset.active === "true") periodGroupEl.dataset.status = "active"
			else periodGroupEl.dataset.status = ""
		})
	}
}

function getConflicts() {

	let conflicts = new Set()

	for (let i = pathWithPeriods.length - 1; i > 0; i--) {
		const [start1, end1, period1] = parsePeriod(pathWithPeriods[i][0])
		for (let j = 0; j < i; j++) {
			const [start2, end2, period2] = parsePeriod(pathWithPeriods[j][0])
			if (period1 !== period2) continue
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
	const conflicts = getConflicts()
	const invalidPaths = []

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
