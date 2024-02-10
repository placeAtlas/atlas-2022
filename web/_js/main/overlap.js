/*!
 * The 2022 r/place Atlas
 * Copyright (c) 2017 Roland Rytz <roland@draemm.li>
 * Copyright (c) 2022 Place Atlas Initiative and contributors
 * Licensed under AGPL-3.0 (https://2022.place-atlas.stefanocoding.me/license.txt)
 */

function initOverlap() {

	window.renderBackground = renderBackground

	updateAtlas()

	// const hovered = []

	document.addEventListener('timeupdate', () => {
		updateAtlas()
	})

	applyView()
	renderLines()

	if (window.location.hash) {
		updateViewFromHash()
	}

	function renderBackground(atlas) {

		backgroundContext.clearRect(0, 0, highlightCanvas.width, highlightCanvas.height)

		backgroundContext.fillStyle = "rgba(255, 255, 255, 1)"
		backgroundContext.fillRect(0, 0, highlightCanvas.width, highlightCanvas.height)

		for (const entry of Object.values(atlas)) {

			const path = entry.path

			backgroundContext.beginPath()

			if (path[0]) {
				backgroundContext.moveTo(path[0][0] - canvasOffset.x, path[0][1] - canvasOffset.y)
			}

			for (let p = 1; p < path.length; p++) {
				backgroundContext.lineTo(path[p][0] - canvasOffset.x, path[p][1] - canvasOffset.y)
			}

			backgroundContext.closePath()

			backgroundContext.fillStyle = "rgba(0, 0, 255, 0.2)"
			backgroundContext.fill()
		}

		const pixels = backgroundContext.getImageData(0, 0, backgroundCanvas.width, backgroundCanvas.height).data
		let blank = 0

		for (let i = 0; i < pixels.length; i += 4) {
			if (pixels[i] === 255) {
				blank++
			}
		}

		const blankPercentage = (blank / (canvasSize.x * canvasSize.y)) * 100

		console.info(blank + " blank pixels, which are " + blankPercentage.toPrecision(4) + "% of the canvas (" + (100 - blankPercentage).toPrecision(4) + "% mapped)")
	}

}
