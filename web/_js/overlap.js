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

function initOverlap(){

	window.renderBackground = renderBackground

	var hovered = [];

	buildObjectsList(null, null);
	renderBackground(atlas);
	render();

	applyView();
	render();
	updateLines();

	if(window.location.hash){
		highlightEntryFromUrl();
	}

	function renderBackground(atlas) {

		backgroundContext.clearRect(0, 0, canvas.width, canvas.height);

		backgroundContext.fillStyle = "rgba(255, 255, 255, 1)";
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

			backgroundContext.fillStyle = "rgba(0, 0, 255, 0.2)";
			backgroundContext.fill();
		}

		var pixels = backgroundContext.getImageData(0, 0, backgroundCanvas.width, backgroundCanvas.height).data;
		var blank = 0;

		for(var i = 0; i < pixels.length; i+=4){
			if(pixels[i] == 255){
				blank++;
			}
		}

		console.log(blank+" blank pixels, which are "+Math.round(blank/100)/100+"% of the canvas ("+(100-Math.round(blank/100)/100)+"% mapped)");
	}

}
