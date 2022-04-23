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
const hintText = document.getElementById("hint");

const periodsStatus = document.getElementById('periodsStatus')
const periodGroups = document.getElementById('periodGroups')
const periodGroupTemplate = document.getElementById('period-group').content.firstElementChild.cloneNode(true)
const periodsAdd = document.getElementById('periodsAdd')

const exportButton = document.getElementById("exportButton");
const cancelButton = document.getElementById("cancelButton");

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

	;[...document.querySelectorAll("#drawControlsContainer textarea")].forEach(el => {
		el.addEventListener("input", function () {
			this.style.height = "auto";
			this.style.height = (this.scrollHeight) + "px"
		})
	})

window.initDraw = initDraw
function initDraw() {

	wrapper.classList.remove('listHidden')

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

	window.addEventListener("keyup", function (e) {
		if (e.key == "Enter") {
			finish();
		} else if (e.key == "z" && e.ctrlKey) {
			undo();
		} else if (e.key == "y" && e.ctrlKey) {
			redo();
		} else if (e.key == "Escape") {
			exportOverlay.style.display = "none";
		} else if (e.key === "Shift") {
			if (e.code === "ShiftRight") {
				rShiftPressed = false;
			} else if (e.code === "ShiftLeft") {
				lShiftPressed = false;
			}
			shiftPressed = rShiftPressed || lShiftPressed;
		}
	});

	window.addEventListener("keydown", function (e) {
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

	nameField.addEventListener("keyup", function (e) {
		if (e.key == "Enter") {
			exportJson();
		}
	});

	// websiteField.addEventListener("keyup", function(e){
	// 	if(e.key == "Enter"){
	// 		exportJson();
	// 	}
	// });

	// subredditField.addEventListener("keyup", function(e){
	// 	if(e.key == "Enter"){
	// 		exportJson();
	// 	}
	// });

	exportButton.addEventListener("click", function (e) {
		exportJson();
	});

	exportCloseButton.addEventListener("click", function (e) {
		reset();
		exportOverlay.style.display = "none";
	});

	exportBackButton.addEventListener("click", function (e) {
		finish();
		exportOverlay.style.display = "none";
	});

	document.getElementById("highlightUncharted").addEventListener("click", function (e) {
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

		exportOverlay.style.display = "flex";

		exportArea.focus();
		exportArea.select();
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

	function reset() {
		updatePath([])
		undoHistory = [];
		drawing = true;
		disableDrawingOverride = false;
		objectInfoBox.style.display = "none";
		objectDraw.style.display = "block";
		hintText.style.display = "block";

		nameField.value = "";
		descriptionField.value = "";
		websiteField.value = "";
		subredditField.value = "";
	}

	function back() {
		drawing = true;
		disableDrawingOverride = false;
		updatePath()
		objectInfoBox.style.display = "none";
		objectDraw.style.display = "block";
		hintText.style.display = "block";
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
			coords_p.innerText = Math.ceil(pos[0]) + ", " + Math.ceil(pos[1]);
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
		subredditField.value = entry.links.subreddit.map(sub => '/r/' + sub).join('\n')
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
		const periodVisibilityEl = periodGroupEl.querySelector('.period-visible')
		const periodDeleteEl = periodGroupEl.querySelector('.period-delete')
		const periodDuplicateEl = periodGroupEl.querySelector('.period-duplicate')
		const periodVariationEl = periodGroupEl.querySelector('.period-variation')
		const periodCopyEl = periodGroupEl.querySelector('.period-copy')

		const [start, end, variation] = parsePeriod(period)

		startPeriodEl.id = "periodStart" + index
		startPeriodEl.previousSibling.for = startPeriodEl.id
		endPeriodEl.id = "periodEnd" + index
		endPeriodEl.previousSibling.for = endPeriodEl.id
		periodVisibilityEl.id = "periodVisibility" + index
		periodVariationEl.id = "periodVariation" + index
		periodCopyEl.id = "periodCopy" + index

		startPeriodEl.max = variationsConfig[variation].versions.length - 1
		endPeriodEl.max = variationsConfig[variation].versions.length - 1
		startPeriodEl.value = start
		endPeriodEl.value = end

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
			updateTime(newVariationConfig.default, newVariation)
		})

		periodCopyEl.addEventListener("click", event => {
			const index = parseInt(event.target.id.split('periodCopy')[1])
			if (event.target.textContent === "Copy") {
				event.target.textContent = "End"
				periodClipboard.index = index
				periodClipboard.path = [...pathWithPeriods[index][1]]
				updatePeriodGroups()
			} else if (event.target.textContent === "End") {
				event.target.textContent = "Copy"
				periodClipboard.index = null
				periodClipboard.path = null
				updatePeriodGroups()
			} else if (event.target.textContent === "Paste") {
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

		periodGroupElements.push({
			periodGroupEl,
			startPeriodEl,
			endPeriodEl,
			periodVisibilityEl,
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
			periodVisibilityEl,
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
				periodCopyEl.textContent = "Paste"
				if (JSON.stringify(pathWithPeriods[index][1]) === JSON.stringify(periodClipboard.path)) {
					periodCopyEl.disabled = true
				} else {
					periodCopyEl.disabled = false
				}
			} else {
				periodCopyEl.textContent = "End"
			}
		} else {
			periodCopyEl.textContent = "Copy"
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
