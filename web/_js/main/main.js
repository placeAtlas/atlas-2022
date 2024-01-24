/*!
 * The 2022 r/place Atlas
 * Copyright (c) 2017 Roland Rytz <roland@draemm.li>
 * Copyright (c) 2022 Place Atlas Initiative and contributors
 * Licensed under AGPL-3.0 (https://2022.place-atlas.stefanocoding.me/license.txt)
 */

const innerContainer = document.getElementById("innerContainer")
const container = document.getElementById("container")
const highlightCanvas = document.getElementById("highlightCanvas")
const imageCanvas = document.getElementById('image')
const highlightContext = highlightCanvas.getContext("2d")

highlightCanvas.width = canvasSize.x
highlightCanvas.height = canvasSize.y
imageCanvas.width = canvasSize.x
imageCanvas.height = canvasSize.y

let zoom = 1

if (window.devicePixelRatio) {
	zoom = 1 / window.devicePixelRatio
}

const maxZoom = 128
const minZoom = 0.125

let zoomOrigin = [0, 0]
let scaleZoomOrigin = [canvasCenter.x, canvasCenter.y]

let dragging = false
let lastPosition = [0, 0]

const viewportSize = [0, 0]

// TODO Probably merge both functions
function applyView() {

	//console.log(zoomOrigin, scaleZoomOrigin)
	//console.log(scaleZoomOrigin[0])

	scaleZoomOrigin[0] = Math.max(-canvasCenter.x + canvasOffset.x, Math.min(canvasCenter.x - canvasOffset.x, scaleZoomOrigin[0]))
	scaleZoomOrigin[1] = Math.max(-canvasCenter.y + canvasOffset.y, Math.min(canvasCenter.y - canvasOffset.y, scaleZoomOrigin[1]))
	zoom = Math.max(minZoom, Math.min(maxZoom, zoom))

	zoomOrigin = [scaleZoomOrigin[0] * zoom, scaleZoomOrigin[1] * zoom]

	innerContainer.style.width = (~~(zoom * canvasSize.x)) + "px"
	innerContainer.style.height = (~~(zoom * canvasSize.y)) + "px"

	innerContainer.style.left = ~~(container.clientWidth / 2 - innerContainer.clientWidth / 2 + zoomOrigin[0] + container.offsetLeft) + "px"
	innerContainer.style.top = ~~(container.clientHeight / 2 - innerContainer.clientHeight / 2 + zoomOrigin[1] + container.offsetTop) + "px"

}

function setView(targetX, targetY, targetZoom) {
	
	if (isNaN(targetX)) targetX = null
	if (isNaN(targetY)) targetY = null

	zoom = targetZoom ?? zoom
	if ((targetX ?? null) !== null) scaleZoomOrigin[0] = canvasCenter.x - targetX
	if ((targetY ?? null) !== null) scaleZoomOrigin[1] = canvasCenter.y - targetY

	applyView()

}

function updateHash(...args) {
	const newLocation = new URL(window.location)
	newLocation.hash = formatHash(...args)
	if (location.hash !== newLocation.hash) history.replaceState({}, "", newLocation)
}

let atlasAll = null
window.atlasAll = atlasAll

if (document.location.host !== prodDomain) document.body.dataset.dev = ""

init()

async function init() {

	const args = window.location.search
	const params = new URLSearchParams(args)

	let mode = "view"

	if (args) {
		mode = params.get("mode") || "view"

		// Backwards compatibility for old links using "search" id arg
		if (params.has('id') && mode !== 'draw') {
			const id = params.get('id')
			params.delete('id')
			const newLocation = new URL(window.location)
			newLocation.hash = id
			newLocation.search = params
			window.history.replaceState({}, '', newLocation)
		}
	}

	// Experimental: TemplateManager support
	// Add a .json file of TemplateManager on the "template" URL param.
	// e.g. ?template=https://osu.place/e/osuplace2023.json
	// CORS bypass is required (e.g. a proxy, CORS Anywhere).
	if (params.get("template")) {
		const [ templateDatas ] = await loadTemplateData(params.get("template"))
		const templateLayers = await loadTemplateImages(templateDatas)
		additionalLayers.push(...templateLayers)
		updateAdditionalLayer(additionalLayers)
	}

	if (mode === "about") window.location.replace("./about.html")

	// For Reviewing Reddit Changes
	// const atlasRef = '../tools/temp-atlas.json'
	const atlasAllUrl = params.get('atlas') || './atlas.json'
	atlasAll = generateAtlasAll(await (await fetch(atlasAllUrl)).json())
	// console.log(atlas, atlasOrder)

	const hash = window.location.hash.substring(1)
	const [, hashPeriod, hashX, hashY, hashZoom] = hash.split('/')

	if (hashPeriod) {
		const [, targetPeriod, targetVariation] = parsePeriod(hashPeriod)
		await updateTime(targetPeriod, targetVariation, true)
	} else {
		await updateTime(currentPeriod, currentVariation, true)
	}

	//console.log(document.documentElement.clientWidth, document.documentElement.clientHeight)

	setView(
		(isNaN(hashX) || hashX === '') ? canvasCenter.x : Number(hashX), 
		(isNaN(hashY) || hashY === '') ? canvasCenter.y : Number(hashY), 
		(isNaN(hashZoom) || hashZoom === '') ? zoom : Number(hashZoom)
	)

	let initialPinchDistance = 0
	let initialPinchZoom = 0
	let initialPinchZoomOrigin = [0, 0]

	// let desiredZoom
	// let zoomAnimationFrame

	document.body.dataset.mode = mode

	initGlobal()
	if (mode !== "draw") initViewGlobal()

	if (mode === "draw") {
		initDraw()
	} else if (mode === "overlap") {
		if (initOverlap) initOverlap()
	} else if (mode === "explore") {
		initExplore()
	} else if (mode.startsWith("diff")) {
		try {
			const liveAtlasUrl = params.get('liveatlas') || `https://${prodDomain}/atlas.json`
			let liveAtlasAll = generateAtlasAll(await (await fetch(liveAtlasUrl)).json())

			// Mark added/edited entries
			for (const entry of Object.values(atlasAll)) {
				if (!liveAtlasAll[entry.id]) {
					entry.diff = "add"
				} else {
					if (JSON.stringify({ ...entry, _index: undefined }) === JSON.stringify({ ...liveAtlasAll[entry.id], _index: undefined })) continue
					entry.diff = "edit"
				}
			}

			// Mark removed entries
			for (const entry of Object.values(liveAtlasAll)) {
				if (!atlasAll[entry.id]) {
					entry.diff = "delete"
					atlasAll[entry.id] = entry
				}
			}

			if (mode.includes('only')) {
				for (const key of Object.keys(atlasAll)) {
					if (atlasAll[key].diff) continue
					delete atlasAll[key]
				}
			}

		} catch (error) {
			console.warn("Diff mode failed to load, reverting to normal view.", error)
		} finally {
			await updateTime()
			if (initOverlap && mode.includes("overlap")) {
				initOverlap()
			} else {
				initView()
			}
		}
	} else {
		initView()
	}

	document.getElementById("loading").classList.add("d-none")

	document.getElementById("zoomInButton").addEventListener("click", function () {

		/*if(zoomAnimationFrame){
			window.cancelAnimationFrame(zoomAnimationFrame)
		}*/

		const x = container.clientWidth / 2
		const y = container.clientHeight / 2

		initialPinchZoomOrigin = [
			scaleZoomOrigin[0],
			scaleZoomOrigin[1]
		]

		initialPinchZoom = zoom

		lastPosition = [x, y]
		zoom *= 2
		zoom = Math.max(minZoom, Math.min(maxZoom, zoom))

		applyZoom(x, y, zoom)

	})

	document.getElementById("zoomOutButton").addEventListener("click", function () {

		/*if(zoomAnimationFrame){
			window.cancelAnimationFrame(zoomAnimationFrame)
		}*/

		const x = container.clientWidth / 2
		const y = container.clientHeight / 2

		initialPinchZoomOrigin = [
			scaleZoomOrigin[0],
			scaleZoomOrigin[1]
		]

		initialPinchZoom = zoom

		lastPosition = [x, y]
		zoom /= 2
		zoom = Math.max(minZoom, Math.min(maxZoom, zoom))

		applyZoom(x, y, zoom)
	})

	document.getElementById("zoomResetButton").addEventListener("click", function () {
		zoom = 1
		zoomOrigin = [0, 0]
		scaleZoomOrigin = [0, 0]
		renderLines()
		applyView()
	})

	container.addEventListener("dblclick", e => {
		/*if(zoomAnimationFrame){
			window.cancelAnimationFrame(zoomAnimationFrame)
		}*/

		const x = e.clientX - container.offsetLeft
		const y = e.clientY - container.offsetTop

		initialPinchZoomOrigin = [
			scaleZoomOrigin[0],
			scaleZoomOrigin[1]
		]

		initialPinchZoom = zoom

		lastPosition = [x, y]

		if (e.ctrlKey) zoom /= 2
		else zoom *= 2

		zoom = Math.max(minZoom, Math.min(maxZoom, zoom))
		applyZoom(x, y, zoom)

		e.preventDefault()
	})


	container.addEventListener("wheel", e => {

		/*if(zoomAnimationFrame){
			window.cancelAnimationFrame(zoomAnimationFrame)
		}*/

		const x = e.clientX - container.offsetLeft
		const y = e.clientY - container.offsetTop

		initialPinchZoomOrigin = [
			scaleZoomOrigin[0],
			scaleZoomOrigin[1]
		]

		initialPinchZoom = zoom

		lastPosition = [x, y]

		// Check if we are zooming by pixels
		// https://developer.mozilla.org/en-US/docs/Web/API/WheelEvent/deltaMode
		if (e.deltaMode === 0) {
			// Scale the pixel delta by the current zoom factor
			// We want to zoom faster when closer, and slower when further
			// This creates a smoother experience
			zoom -= e.deltaY * (0.001 * zoom)
		} else {
			if (e.deltaY > 0) zoom /= 2
			else if (e.deltaY < 0) zoom *= 2
		}

		zoom = Math.max(minZoom, Math.min(maxZoom, zoom))
		applyZoom(x, y, zoom)
		updateHash()
	}, { passive: true })

	/*function setDesiredZoom(x, y, target){
		zoom = (zoom*2 + target)/3
		//console.log(zoom)
		if(Math.abs(1 - zoom/target) <= 0.01){
			zoom = target
		}
		applyZoom(x, y, zoom)
		if(zoom != target){
			zoomAnimationFrame = window.requestAnimationFrame(function(){
				setDesiredZoom(x, y, target)
			})
		}
	}*/

	container.addEventListener("mousedown", e => {
		mousedown(e.clientX, e.clientY)
		e.preventDefault()
	})

	container.addEventListener("touchstart", e => {

		if (e.touches.length === 2) {
			e.preventDefault()
		}

		touchstart(e)

	}, { passive: true })

	function mousedown(x, y) {
		lastPosition = [x, y]
		dragging = true
	}

	function touchstart(e) {

		if (e.touches.length === 1) {

			mousedown(e.touches[0].clientX, e.touches[0].clientY)

		} else if (e.touches.length === 2) {

			initialPinchDistance = Math.sqrt(
				Math.pow(e.touches[0].clientX - e.touches[1].clientX, 2)
				+ Math.pow(e.touches[0].clientY - e.touches[1].clientY, 2)
			)

			initialPinchZoom = zoom
			initialPinchZoomOrigin = [
				scaleZoomOrigin[0],
				scaleZoomOrigin[1]
			]

			mousedown(
				(e.touches[0].clientX + e.touches[1].clientX) / 2 - container.offsetLeft,
				(e.touches[0].clientY + e.touches[1].clientY) / 2 - container.offsetTop
			)

		}

	}

	window.addEventListener("mousemove", e => {
		mousemove(e.clientX, e.clientY)
		if (dragging) {
			e.preventDefault()
		}
	})

	window.addEventListener("touchmove", e => {

		if (e.touches.length === 2 || e.scale > 1) {
			e.preventDefault()
		}

		touchmove(e)

	},
		{ passive: false }
	)

	function mousemove(x, y) {
		if (!dragging) return
		container.style.cursor = "move"

		const deltaX = x - lastPosition[0]
		const deltaY = y - lastPosition[1]
		lastPosition = [x, y]

		zoomOrigin[0] += deltaX
		zoomOrigin[1] += deltaY

		scaleZoomOrigin[0] += deltaX / zoom
		scaleZoomOrigin[1] += deltaY / zoom

		renderLines()
		applyView()
	}

	function touchmove(e) {

		if (e.touches.length === 1) {

			mousemove(e.touches[0].clientX, e.touches[0].clientY)

		} else if (e.touches.length === 2) {

			const newPinchDistance = Math.sqrt(
				Math.pow(e.touches[0].clientX - e.touches[1].clientX, 2)
				+ Math.pow(e.touches[0].clientY - e.touches[1].clientY, 2)
			)

			zoom = initialPinchZoom * newPinchDistance / initialPinchDistance

			const x = (e.touches[0].clientX + e.touches[1].clientX) / 2 - container.offsetLeft
			const y = (e.touches[0].clientY + e.touches[1].clientY) / 2 - container.offsetTop

			applyZoom(x, y, zoom)

		}

	}

	function applyZoom(x, y, zoom) {

		const deltaX = x - lastPosition[0]
		const deltaY = y - lastPosition[1]

		const pinchTranslateX = (x - container.clientWidth / 2 - deltaX)
		const pinchTranslateY = (y - container.clientHeight / 2 - deltaY)

		scaleZoomOrigin[0] = initialPinchZoomOrigin[0] + deltaX / zoom + pinchTranslateX / zoom - pinchTranslateX / initialPinchZoom
		scaleZoomOrigin[1] = initialPinchZoomOrigin[1] + deltaY / zoom + pinchTranslateY / zoom - pinchTranslateY / initialPinchZoom

		zoomOrigin[0] = scaleZoomOrigin[0] * zoom
		zoomOrigin[1] = scaleZoomOrigin[1] * zoom

		applyView()
		renderLines()
	}

	window.addEventListener("mouseup", e => {
		if (hovered.length > 0) {
			container.style.cursor = "pointer"
		} else if (drawing === true) {
			container.style.cursor = "crosshair"
		} else {
			container.style.cursor = "default"
		}
		if (dragging) {
			e.preventDefault()
		}
		mouseup(e.clientX, e.clientY)
	})
	window.addEventListener("touchend", touchend)

	function mouseup() {
		dragging = false
		updateHash()
	}

	function touchend(e) {
		if (e.touches.length === 0) {
			mouseup()
			renderLines()
			dragging = false

		} else if (e.touches.length === 1) {
			initialPinchZoom = zoom
			lastPosition = [e.touches[0].clientX, e.touches[0].clientY]
		}

	}

	window.addEventListener("resize", function () {
		//console.log(document.documentElement.clientWidth, document.documentElement.clientHeight)

		applyView()
	})

	document.body.dataset.initDone = ''

}

function generateAtlasAll(atlas = atlasAll) {
	const newAtlas = {}
	for (const index in atlas) {
		const entry = atlas[index]
		entry._index = index
		const currentLinks = entry.links
		entry.links = {
			website: [],
			subreddit: [],
			discord: [],
			wiki: [],
			...currentLinks
		}
		const currentPath = entry.path
		const currentCenter = entry.center
		for (const key in currentPath) {
			currentPath[key] = currentPath[key].map(point => point.map(int => int + 0.5))
		}
		for (const key in currentCenter) {
			currentCenter[key] = currentCenter[key].map(int => int + 0.5)
		}
		entry.path = currentPath
		entry.center = currentCenter
		newAtlas[entry.id] = entry
	}
	// console.log(newAtlas)
	return newAtlas
}

// Notice system

const noticeEl = document.querySelector("#headerNotice")
const noticeButton = noticeEl.querySelector('[role=button]')
const noticeText = noticeEl.querySelector('p').textContent.trim()

const resizeGlobalTopPadding = () => {
	document.body.style.setProperty("--global-top-padding", noticeEl.offsetHeight + 'px')
}

if (window.localStorage.getItem('announcement-closed')) {
	window.localStorage.setItem('closed-notice', window.localStorage.getItem('announcement-closed'))
	window.localStorage.removeItem('announcement-closed')
}

if (noticeText && noticeText !== window.localStorage.getItem('closed-notice')) {
	noticeButton.click()
	setTimeout(() => {
		document.body.style.setProperty("--global-top-padding", noticeEl.offsetHeight + 'px')
	}, 500)
	window.addEventListener('resize', resizeGlobalTopPadding)
}

noticeEl.querySelector('[role=button]').addEventListener('click', () => {
	window.localStorage.setItem('closed-notice', noticeText)
	window.removeEventListener('resize', resizeGlobalTopPadding)
	document.body.style.setProperty("--global-top-padding", null)
})
