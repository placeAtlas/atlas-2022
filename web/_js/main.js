/*
	========================================================================
	The 2022 r/place Atlas

	An atlas of Reddit's 2022 r/place, with information to each
	artwork	of the canvas provided by the community.

	Copyright (c) 2017 Roland Rytz <roland@draemm.li>
	Copyright (c) 2022 Place Atlas contributors

	Licensed under the GNU Affero General Public License Version 3
	https://place-atlas.stefanocoding.me/license.txt
	========================================================================
*/

const prodDomain = "place-atlas.stefanocoding.me"

const innerContainer = document.getElementById("innerContainer")
const container = document.getElementById("container")
const canvas = document.getElementById("highlightCanvas")
const context = canvas.getContext("2d")

let zoom = 1

if (window.devicePixelRatio) {
	zoom = 1 / window.devicePixelRatio
}

const maxZoom = 128
const minZoom = 0.1

let zoomOrigin = [0, 0]
let scaleZoomOrigin = [0, 0]

let dragging = false
let lastPosition = [0, 0]

const viewportSize = [0, 0]

function applyView() {

	//console.log(zoomOrigin, scaleZoomOrigin)
	//console.log(scaleZoomOrigin[0])

	scaleZoomOrigin[0] = Math.max(-1000, Math.min(1000, scaleZoomOrigin[0]))
	scaleZoomOrigin[1] = Math.max(-1000, Math.min(1000, scaleZoomOrigin[1]))

	zoomOrigin = [scaleZoomOrigin[0] * zoom, scaleZoomOrigin[1] * zoom]

	innerContainer.style.height = (~~(zoom * 2000)) + "px"
	innerContainer.style.width = (~~(zoom * 2000)) + "px"

	innerContainer.style.left = ~~(container.clientWidth / 2 - innerContainer.clientWidth / 2 + zoomOrigin[0] + container.offsetLeft) + "px"
	innerContainer.style.top = ~~(container.clientHeight / 2 - innerContainer.clientHeight / 2 + zoomOrigin[1] + container.offsetTop) + "px"

}

let atlas = null
window.atlas = atlas
let atlasAll = null
window.atlasAll = atlasAll

if (document.location.host !== prodDomain) document.body.dataset.dev = ""

init()

async function init() {
	// For Reviewing Reddit Changes
	//let resp = await fetch("../tools/temp_atlas.json")
	const resp = await fetch("./atlas.json")
	atlas = await resp.json()
	atlas.sort(function (a, b) {
		if (a.center[1] < b.center[1]) {
			return -1
		}
		if (a.center[1] > b.center[1]) {
			return 1
		}
		// a must be equal to b
		return 0
	})

	atlasAll = updateAtlasAll(atlas)

	let mode = "view"

	const args = window.location.search
	const params = new URLSearchParams(args)
	if (args) {
		mode = params.get("mode")
		if (!mode) {
			mode = "view"
		}

		// Backwards compatibility for old links using "search" id arg
		if (params.has('id') && params.get('mode') !== 'draw') {
			const id = params.get('id')
			params.delete('id')
			const newLocation = new URL(window.location)
			newLocation.hash = id
			newLocation.search = params
			window.history.replaceState({}, '', newLocation)
		}
	}

	const hash = window.location.hash.substring(1)
	const [, period] = hash.split('/')

	if (period) {
		const [, targetPeriod, targetVariation] = parsePeriod(period)
		await updateTime(targetPeriod, targetVariation)
	} else {
		await updateTime(currentPeriod, currentVariation)
	}

	//console.log(document.documentElement.clientWidth, document.documentElement.clientHeight)

	zoomOrigin = [0, 0]
	applyView()

	let initialPinchDistance = 0
	let initialPinchZoom = 0
	let initialPinchZoomOrigin = [0, 0]

	let desiredZoom
	let zoomAnimationFrame

	document.body.dataset.mode = mode

	initGlobal()
	if (mode !== "draw") initViewGlobal()

	if (mode === "draw") {
		initDraw()
	} else if (mode === "about") {
		window.location = "./about.html"
	} else if (mode === "overlap") {
		if (initOverlap) {
			initOverlap()
		}
	} else if (mode.startsWith("diff")) {
		try {
			const liveResp = await fetch("https://place-atlas.stefanocoding.me/atlas.json")
			let liveJson = await liveResp.json()
			liveJson = updateAtlasAll(liveJson)

			const liveAtlasReduced = liveJson.reduce(function (a, c) {
				a[c.id] = c
				return a
			}, {})
			// Mark added/edited entries
			atlasAll = atlasAll.map(function (entry) {
				if (liveAtlasReduced[entry.id] === undefined) {
					entry.diff = "add"
				} else if (JSON.stringify(entry) !== JSON.stringify(liveAtlasReduced[entry.id])) {
					entry.diff = "edit"
				}
				return entry
			})

			// Mark removed entries
			const atlasReduced = atlasAll.reduce(function (a, c) {
				a[c.id] = c
				return a
			}, {})
			const removedEntries = liveJson.filter(entry =>
				atlasReduced[entry.id] === undefined
			).map(entry => {
				entry.diff = "delete"
				return entry
			})
			atlasAll.push(...removedEntries)

			if (mode.includes("only")) {
				atlasAll = atlasAll.filter(function (entry) {
					return typeof entry.diff == "string"
				})
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
	} else if (mode === "explore") {
		initExplore()
	} else {
		initView()
	}

	document.getElementById("loading").classList.add("d-none")

	document.getElementById("zoomInButton").addEventListener("click", function (e) {

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
		zoom = zoom * 2
		zoom = Math.max(minZoom, Math.min(maxZoom, zoom))

		applyZoom(x, y, zoom)

	})

	document.getElementById("zoomOutButton").addEventListener("click", function (e) {

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
		zoom = zoom / 2
		zoom = Math.max(minZoom, Math.min(maxZoom, zoom))

		applyZoom(x, y, zoom)
	})

	document.getElementById("zoomResetButton").addEventListener("click", function (e) {
		zoom = 1
		zoomOrigin = [0, 0]
		scaleZoomOrigin = [0, 0]
		updateLines()
		applyView()
	})

	container.addEventListener("dblclick", function (e) {
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

		if (e.ctrlKey) {

			zoom = zoom / 2

		} else {

			zoom = zoom * 2
		}

		zoom = Math.max(minZoom, Math.min(maxZoom, zoom))
		applyZoom(x, y, zoom)

		e.preventDefault()
	})


	container.addEventListener("wheel", function (e) {

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
			if (e.deltaY > 0) {

				zoom = zoom / 2

			} else if (e.deltaY < 0) {

				zoom = zoom * 2
			}
		}

		zoom = Math.max(minZoom, Math.min(maxZoom, zoom))
		applyZoom(x, y, zoom)
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

	container.addEventListener("mousedown", function (e) {
		mousedown(e.clientX, e.clientY)
		e.preventDefault()
	})

	container.addEventListener("touchstart", function (e) {

		if (e.touches.length == 2) {
			e.preventDefault()
		}

		touchstart(e)

	}, { passive: true })

	function mousedown(x, y) {
		lastPosition = [x, y]
		dragging = true
	}

	function touchstart(e) {

		if (e.touches.length == 1) {

			mousedown(e.touches[0].clientX, e.touches[0].clientY)

		} else if (e.touches.length == 2) {

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
				(e.touches[0].clientX + e.touches[1].clientX) / 2,
				(e.touches[0].clientY + e.touches[1].clientY) / 2
			)

		}

	}

	window.addEventListener("mousemove", function (e) {
		updateLines()
		mousemove(e.clientX, e.clientY)
		if (dragging) {
			e.preventDefault()
		}
	})
	window.addEventListener("touchmove", function (e) {

		if (e.touches.length == 2 || e.scale > 1) {
			e.preventDefault()
		}

		touchmove(e)

	},
		{ passive: false }
	)

	function mousemove(x, y) {
		if (dragging) {
			container.style.cursor = "move"

			const deltaX = x - lastPosition[0]
			const deltaY = y - lastPosition[1]
			lastPosition = [x, y]

			zoomOrigin[0] += deltaX
			zoomOrigin[1] += deltaY

			scaleZoomOrigin[0] += deltaX / zoom
			scaleZoomOrigin[1] += deltaY / zoom

			previousZoomOrigin = [zoomOrigin[0], zoomOrigin[1]]
			previousScaleZoomOrigin = [scaleZoomOrigin[0], scaleZoomOrigin[1]]

			updateLines()
			applyView()
		}
	}

	function touchmove(e) {

		updateLines()

		if (e.touches.length == 1) {

			mousemove(e.touches[0].clientX, e.touches[0].clientY)

		} else if (e.touches.length == 2) {

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
		updateLines()
	}

	window.addEventListener("mouseup", function (e) {
		if (hovered.length > 0) {
			container.style.cursor = "pointer"
		} else if (drawing == true) {
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

	function mouseup(x, y) {
		if (dragging) {
			dragging = false
		}
	}

	function touchend(e) {

		if (e.touches.length == 0) {

			mouseup()

		} else if (e.touches.length == 1) {
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

function updateAtlasAll(atlas = atlasAll) {
	for (const atlasIndex in atlas) {
		const currentLinks = atlas[atlasIndex].links
		atlas[atlasIndex].links = {
			website: [],
			subreddit: [],
			discord: [],
			wiki: [],
			...currentLinks
		}
		const currentPath = atlas[atlasIndex].path
		const currentCenter = atlas[atlasIndex].center
		for (const key in currentPath) {
			currentPath[key] = currentPath[key].map(point => point.map(int => int + 0.5))
		}
		for (const key in currentCenter) {
			currentCenter[key] = currentCenter[key].map(int => int + 0.5)
		}
		atlas[atlasIndex].path = currentPath
		atlas[atlasIndex].center = currentCenter
	}
	return atlas
}