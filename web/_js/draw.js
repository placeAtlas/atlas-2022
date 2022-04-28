/*
	========================================================================
	The 2022 r/place Atlas

	An Atlas of Reddit's 2022 r/place, with information to each
	artwork	of the canvas provided by the community.

	Copyright (c) 2017 Roland Rytz <roland@draemm.li>
	Copyright (c) 2022 Place Atlas contributors

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

const periodsStatus = document.getElementById('periodsStatus');
const periodGroups = document.getElementById('periodGroups');
const periodGroupTemplate = document.getElementById('period-group').content.firstElementChild.cloneNode(true);
const periodsAdd = document.getElementById('periodsAdd');

const exportButton = document.getElementById("exportButton");
const cancelButton = document.getElementById("cancelButton");

const exportModal = new bootstrap.Modal(document.getElementById("exportModal"));
const exportModalElement = document.getElementById("exportModal");

const exportOverlay = document.getElementById("exportOverlay");
const exportCloseButton = document.getElementById("exportCloseButton");
const exportBackButton = document.getElementById("exportBackButton");

const nameField = document.getElementById("nameField");
const descriptionField = document.getElementById("descriptionField");
const websiteGroup = document.getElementById("websiteGroup");
const subredditGroup = document.getElementById("subredditGroup");
const discordGroup = document.getElementById("discordGroup");
const wikiGroup = document.getElementById("wikiGroup");
const exportArea = document.getElementById("exportString");

let path = [];
let center = [1000, 1000];

let websiteGroupElements = [];
let subredditGroupElements = [];
let discordGroupElements = [];
let wikiGroupElements = [];

let pathWithPeriods = [];
let periodGroupElements = [];

let disableDrawingOverride = false;
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
	backButton.insertAdjacentHTML("afterend", '<button class="btn btn-outline-primary" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasDraw" aria-controls="offcanvasDraw">Menu</button><a id="drawBackButton" class="btn btn-outline-primary" href="./">Exit Draw Mode</a>');
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

		const inputWebsite = websiteGroupElements.map(element => element.value.trim()).filter(element => element);
		const inputSubreddit = subredditGroupElements.map(element => element.value.trim().replace(/(?:(?:(?:(?:https?:\/\/)?(?:(?:www|old|new|np)\.)?)?reddit\.com)?\/)?[rR]\/([A-Za-z0-9][A-Za-z0-9_]{2,20})(?:\/[^" ]*)*/, '$1')).filter(element => element);
		const inputDiscord = discordGroupElements.map(element => element.value.trim().replace(/(?:https?:\/\/)?(?:www\.)?(?:(?:discord)?\.?gg|discord(?:app?)\.com\/invite)\/([^\s/]+?)(?=\b)/, '$1')).filter(element => element);
		const inputWiki = wikiGroupElements.map(element => element.value.trim().replace(/ /g, '_')).filter(element => element);

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

		if (entryId == 0) document.getElementById("redditFlair").textContent = "New Entry";
		else document.getElementById("redditFlair").textContent = "Edit Entry";

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
		// Requires button to be pressed twice to confirm reset
		if (resetButton.textContent == "Confirm Reset") {
			resetButton.textContent = "Reset";
			resetButton.className = "btn btn-secondary";

			updatePath([])
			undoHistory = [];
			drawing = true;
			disableDrawingOverride = false;
			objectInfoBody.style.display = "none";
			drawControlsBody.removeAttribute("style");
	
			// Blanks input values
			nameField.value = "";
			descriptionField.value = "";
	
			// Clears input array
			websiteGroupElements = [];
			subredditGroupElements = [];
			discordGroupElements = [];
			wikiGroupElements = [];
	
			// Rebuilds multi-input list
			websiteGroup.replaceChildren();
			subredditGroup.replaceChildren();
			discordGroup.replaceChildren();
			wikiGroup.replaceChildren();
			addWebsiteFields("", 0, [0]);
			addSubredditFields("", 0, [0]);
			addDiscordFields("", 0, [0]);
			addWikiFields("", 0, [0]);

			// Resets periods
			pathWithPeriods = []
			pathWithPeriods.push([defaultPeriod, []])
			initPeriodGroups()
		} else {
			resetButton.textContent = "Confirm Reset";
			resetButton.className = "btn btn-danger";
		}
	} 

	function back() {
		drawing = true;
		disableDrawingOverride = false;
		updatePath()
		objectInfoBody.style.display = "none";
		drawControlsBody.removeAttribute("style");
		resetButton.textContent = "Reset";
		resetButton.className = "btn btn-secondary";
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


	function addFieldButton(inputButton, inputGroup, array, index, name) {
		console.log("add button fired");
		if (inputButton.title == "Remove " + name) {
			console.log("add (now remove) button fired");
			removeFieldButton(inputGroup, array, index);
			return;
		}
		inputButton.className = "btn btn-outline-secondary";
		inputButton.title = "Remove " + name;
		inputButton.innerHTML = '<i class="bi bi-trash-fill"></i>';
		console.log(array);
		if (name == "website") {
			addWebsiteFields(null, array.length, array);
		} else if (name == "subreddit") {
			addSubredditFields(null, array.length, array);
		} else if (name == "Discord invite") {
			addDiscordFields(null, array.length, array);
		} else if (name == "wiki page") {
			addWikiFields(null, array.length, array);
		}
	}

	function removeFieldButton(inputGroup, array, index) {
		console.log("remove button fired");
		delete array[index];
		inputGroup.remove();
		console.log(array);
	}

	function addWebsiteFields(link, index, array) {
		const inputGroup = document.createElement("div");
		inputGroup.className = "input-group";
		websiteGroup.appendChild(inputGroup);

		const inputField = document.createElement("input");
		inputField.type = "url";
		inputField.name = "url";
		inputField.className = "form-control";
		inputField.id = "websiteField" + index;
		inputField.placeholder = "https://example.com";
		inputField.pattern = "https?://.*";
		inputField.title = "Website URL using the http:// or https:// protocol";
		inputField.setAttribute("aria-labelledby", "websiteLabel");
		inputField.value = link
		inputGroup.appendChild(inputField);
		websiteGroupElements.push(inputField);

		const inputButton = document.createElement("button");
		inputButton.type = "button";
		// If button is the last in the array give it the add button
		if (array.length == index + 1) {
			inputButton.className = "btn btn-secondary";
			inputButton.title = "Add website";
			inputButton.innerHTML = '<i class="bi bi-plus-lg"></i>';
			inputButton.addEventListener('click', () => addFieldButton(inputButton, inputGroup, websiteGroupElements, index, "website"));
		} else {
			inputButton.className = "btn btn-outline-secondary";
			inputButton.title = "Remove website";
			inputButton.innerHTML = '<i class="bi bi-trash-fill"></i>';
			inputButton.addEventListener('click', () => removeFieldButton(inputGroup, array, index));
		}
		inputGroup.appendChild(inputButton);
	}

	function addSubredditFields(link, index, array) {
		const inputGroup = document.createElement("div");
		inputGroup.className = "input-group";
		subredditGroup.appendChild(inputGroup);

		const inputAddon = document.createElement("span");
		inputAddon.className = "input-group-text";
		inputAddon.id = "subredditField" + index + "-addon";
		inputAddon.textContent = "reddit.com/";
		inputGroup.appendChild(inputAddon);

		const inputField = document.createElement("input");
		inputField.type = "text";
		inputField.className = "form-control";
		inputField.id = "subredditField" + index;
		inputField.placeholder = "r/example";
		inputField.pattern = "^r\/\\w+$";
		inputField.title = "Subbredit in format of r/example";
		inputField.maxLength = "23";
		inputField.spellcheck = false;
		inputField.setAttribute("aria-labelledby", "subredditLabel");
		inputField.setAttribute("aria-describedby", "subredditField" + index + "-addon");
		if (link) {
			inputField.value = "r/" + link 
		} else {
			inputField.value = "";
		}
		inputGroup.appendChild(inputField);
		subredditGroupElements.push(inputField);

		const inputButton = document.createElement("button");
		inputButton.type = "button";
		// If button is the last in the array give it the add button
		if (array.length == index + 1) {
			inputButton.className = "btn btn-secondary";
			inputButton.title = "Add subreddit";
			inputButton.innerHTML = '<i class="bi bi-plus-lg"></i>';
			inputButton.addEventListener('click', () => addFieldButton(inputButton, inputGroup, subredditGroupElements, index, "subreddit"));
		} else {
			inputButton.className = "btn btn-outline-secondary";
			inputButton.title = "Remove subreddit";
			inputButton.innerHTML = '<i class="bi bi-trash-fill"></i>';
			inputButton.addEventListener('click', () => removeFieldButton(inputGroup, array, index));
		}
		inputGroup.appendChild(inputButton);
	}

	function addDiscordFields(link, index, array) {
		const inputGroup = document.createElement("div");
		inputGroup.className = "input-group";
		discordGroup.appendChild(inputGroup);

		const inputAddon = document.createElement("span");
		inputAddon.className = "input-group-text";
		inputAddon.id = "discordField" + index + "-addon";
		inputAddon.textContent = "discord.gg/";
		inputGroup.appendChild(inputAddon);

		const inputField = document.createElement("input");
		inputField.type = "text";
		inputField.className = "form-control";
		inputField.id = "discordField" + index;
		inputField.placeholder = "pJkm23b2nA";
		inputField.spellcheck = false;
		inputField.setAttribute("aria-labelledby", "discordLabel");
		inputField.setAttribute("aria-describedby", "discordField" + index + "-addon");
		inputField.value = link
		inputGroup.appendChild(inputField);
		discordGroupElements.push(inputField);

		const inputButton = document.createElement("button");
		inputButton.type = "button";
		// If button is the last in the array give it the add button
		if (array.length == index + 1) {
			inputButton.className = "btn btn-secondary";
			inputButton.title = "Add Discord invite";
			inputButton.innerHTML = '<i class="bi bi-plus-lg"></i>';
			inputButton.addEventListener('click', () => addFieldButton(inputButton, inputGroup, discordGroupElements, index, "Discord invite"));
		} else {
			inputButton.className = "btn btn-outline-secondary";
			inputButton.title = "Remove Discord invite";
			inputButton.innerHTML = '<i class="bi bi-trash-fill"></i>';
			inputButton.addEventListener('click', () => removeFieldButton(inputGroup, array, index));
		}
		inputGroup.appendChild(inputButton);
	}

	function addWikiFields(link, index, array) {
		const inputGroup = document.createElement("div");
		inputGroup.className = "input-group";
		wikiGroup.appendChild(inputGroup);

		const inputField = document.createElement("input");
		inputField.type = "text";
		inputField.className = "form-control";
		inputField.id = "wikiField" + index;
		inputField.placeholder = "Page title";
		inputField.spellcheck = false;
		inputField.setAttribute("aria-labelledby", "wikiLabel");
		inputField.value = link
		inputGroup.appendChild(inputField);
		wikiGroupElements.push(inputField);

		const inputButton = document.createElement("button");
		inputButton.type = "button";
		// If button is the last in the array give it the add button
		if (array.length == index + 1) {
			inputButton.className = "btn btn-secondary";
			inputButton.title = "Add wiki page";
			inputButton.innerHTML = '<i class="bi bi-plus-lg"></i>';
			inputButton.addEventListener('click', () => addFieldButton(inputButton, inputGroup, wikiGroupElements, index, "wiki page"));
		} else {
			inputButton.className = "btn btn-outline-secondary";
			inputButton.title = "Remove wiki page";
			inputButton.innerHTML = '<i class="bi bi-trash-fill"></i>';
			inputButton.addEventListener('click', () => removeFieldButton(inputGroup, array, index));
		}
		inputGroup.appendChild(inputButton);
	}

	if (params.has('id')) {
		const entry = getEntry(params.get('id'))
		nameField.value = entry.name
		descriptionField.value = entry.description

		if (entry.links.website.length) {
			entry.links.website.forEach((link, index, array) => {
				addWebsiteFields(link, index, array);
			});
		} else {
			addWebsiteFields("", -1, entry.links.website);
		}
		if (entry.links.subreddit.length) {
			entry.links.subreddit.forEach((link, index, array) => {
				addSubredditFields(link, index, array);
			});
		} else {
			addSubredditFields("", -1, entry.links.subreddit);
		}
		if (entry.links.discord.length) {
			entry.links.discord.forEach((link, index, array) => {
				addDiscordFields(link, index, array);
			});
		} else {
			addDiscordFields("", -1, entry.links.discord);
		}
		if (entry.links.wiki.length) {
			entry.links.wiki.forEach((link, index, array) => {
				addWikiFields(link, index, array);
			});
		} else {
			addWikiFields("", -1, entry.links.wiki);
		}
		redoButton.disabled = true;
		undoButton.disabled = false;
		entryId = params.get('id')

		Object.entries(entry.path).forEach(([period, path]) => {
			period.split(", ").forEach(period => {
				pathWithPeriods.push([period, path])
			})
		})

	} else {
		document.getElementById("offcanvasDrawLabel").textContent = "New Entry";
		pathWithPeriods.push([defaultPeriod, []])
		addWebsiteFields("", 0, [0]);
		addSubredditFields("", 0, [0]);
		addDiscordFields("", 0, [0]);
		addWikiFields("", 0, [0]);
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
		initPeriodGroups()
	})

}

function calculateCenter(path) {
	const result = polylabel(path)
	return [Math.floor(result[0]) + 0.5, Math.floor(result[1]) + 0.5]
}

function initPeriodGroups() {

	periodGroupElements = []
	periodGroups.textContent = ''

	pathWithPeriods.forEach(([period, path], index) => {
		const periodGroupEl = periodGroupTemplate.cloneNode(true)
		periodGroupEl.id = "periodGroup" + index

		const startPeriodEl = periodGroupEl.querySelector('.period-start')
		const endPeriodEl = periodGroupEl.querySelector('.period-end')
		const periodDeleteEl = periodGroupEl.querySelector('.period-delete')
		const periodDuplicateEl = periodGroupEl.querySelector('.period-duplicate')
		const periodVariationEl = periodGroupEl.querySelector('.period-variation')
		const periodCopyEl = periodGroupEl.querySelector('.period-copy')

		const [start, end, variation] = parsePeriod(period)

		startPeriodEl.id = "periodStart" + index
		startPeriodEl.previousElementSibling.htmlFor = startPeriodEl.id
		endPeriodEl.id = "periodEnd" + index
		endPeriodEl.previousElementSibling.htmlFor = endPeriodEl.id
		periodVariationEl.id = "periodVariation" + index
		periodCopyEl.id = "periodCopy" + index

		startPeriodEl.max = variationsConfig[variation].versions.length - 1
		endPeriodEl.max = variationsConfig[variation].versions.length - 1
		startPeriodEl.value = start
		endPeriodEl.value = end
		if (startPeriodEl.max == 0) periodGroupEl.classList.add('no-time-slider')
		else periodGroupEl.classList.remove('no-time-slider')

		startPeriodEl.addEventListener('input', event => {
			timelineSlider.value = parseInt(event.target.value)
			updateTime(parseInt(event.target.value), variation)
		})
		endPeriodEl.addEventListener('input', event => {
			timelineSlider.value = parseInt(event.target.value)
			updateTime(parseInt(event.target.value), variation)
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
			periodVariationEl.previousElementSibling.innerHTML = newVariationConfig.icon;
			if (startPeriodEl.max == 0) periodGroupEl.classList.add('no-time-slider')
			else periodGroupEl.classList.remove('no-time-slider')
			updateTime(newVariationConfig.default, newVariation)
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
		periodVariationEl.previousElementSibling.innerHTML = variationsConfig[variation].icon;
		
		periodGroupElements.push({
			periodGroupEl,
			startPeriodEl,
			endPeriodEl,
			periodVariationEl,
			periodCopyEl
		})
	})

	updatePeriodGroups()
}

function updatePeriodGroups() {
	let pathToActive = []
	let lastActivePathIndex
	let currentActivePathIndex
	const currentActivePathIndexes = []

	periodGroupElements.forEach((elements, index) => {
		const {
			periodGroupEl,
			startPeriodEl,
			endPeriodEl,
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

	periodsStatus.textContent = ""

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
	if (newPath) path = newPath
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
