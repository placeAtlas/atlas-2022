



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


function initDraw(){

	var finishButton = document.getElementById("finishButton");
	var resetButton = document.getElementById("resetButton");
	var undoButton = document.getElementById("undoButton");
	var redoButton = document.getElementById("redoButton");
	
	var objectInfoBox = document.getElementById("objectInfo");
	var hintText = document.getElementById("hint");
	
	var exportButton = document.getElementById("exportButton");
	var cancelButton = document.getElementById("cancelButton");

	var exportOverlay = document.getElementById("exportOverlay");
	var exportCloseButton = document.getElementById("exportCloseButton");

	container.style.cursor = "crosshair";
	
	var path = [];
	var drawing = true;

	var undoHistory = [];
  var _global_key_status = {"L_SHIFT":0, "R_SHIFT":0, buff:{}};

	var lastPos = [0, 0];

	render(path);

	container.addEventListener("mousedown", function(e){
    var e_clientX = e.clientX;
    var e_clientY = e.clientY;
    if(_global_key_status.R_SHIFT || _global_key_status.L_SHIFT === 1){
      var r = lockHorV(e);
      e_clientX=r[0];
      e_clientY=r[1];
    }
		lastPos = [
			 e_clientX
			,e_clientY
		];
	});

	container.addEventListener("mouseup", function(e){
    var e_clientX = e.clientX;
    var e_clientY = e.clientY;

      if(_global_key_status.R_SHIFT || _global_key_status.L_SHIFT === 1){
        e_clientX = lastPos[0];
        e_clientY = lastPos[1];
      }

		if(Math.abs(lastPos[0] - e_clientX) + Math.abs(lastPos[1] - e_clientY) <= 4 && drawing){
			path.push([
				 ~~((e_clientX - (container.clientWidth/2 - innerContainer.clientWidth/2 + zoomOrigin[0]))/zoom)+0.5
				,~~((e_clientY - (container.clientHeight/2 - innerContainer.clientHeight/2 + zoomOrigin[1]))/zoom)+0.5
			]);
			render(path);
			
			undoHistory = [];
			redoButton.disabled = true;
			undoButton.disabled = false;
			
			if(path.length >= 3){
				finishButton.disabled = false;
			}
		}
	});

  function lockHorV(e){
    var e_clientX = e.clientX;
    var e_clientY = e.clientY;
    var x_offset = Math.abs(e.clientX -lastPos[0]);
    var y_offset = Math.abs(e.clientY-lastPos[1]);
    var offset = y_offset - x_offset ;
    if(y_offset > x_offset ) //keep x 
      e_clientX = lastPos[0];
    else if (x_offset > y_offset) //keep y
      e_clientY =lastPos[1];
    return [e_clientX,e_clientY];
  }

	window.addEventListener("mousemove", function(e){
    var e_clientX = e.clientX;
    var e_clientY = e.clientY;
		if(!dragging && drawing){
      if(_global_key_status.R_SHIFT || _global_key_status.L_SHIFT === 1){
        var r = lockHorV(e);
        e_clientX=r[0];
        e_clientY=r[1];
      }
			var last = [
				 ~~((e_clientX - (container.clientWidth/2 - innerContainer.clientWidth/2 + zoomOrigin[0]))/zoom)+0.5
				,~~((e_clientY - (container.clientHeight/2 - innerContainer.clientHeight/2 + zoomOrigin[1]))/zoom)+0.5
			];
			render(path.concat([last]));
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
      if(e.code === "ShiftRight")
        _global_key_status.R_SHIFT = 0;
      else if(e.code === "ShiftLeft")
        _global_key_status.L_SHIFT = 0;
    }
	});

	window.addEventListener("keydown", function(e){
   if (e.key === "Shift" ){
      if(e.code === "ShiftRight")
        _global_key_status.R_SHIFT = 1;
      else if(e.code === "ShiftLeft")
        _global_key_status.L_SHIFT = 1;
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
		reset();
	});

	document.getElementById("nameField").addEventListener("keyup", function(e){
		if(e.key == "Enter"){
			exportJson();
		}
	});

	document.getElementById("websiteField").addEventListener("keyup", function(e){
		if(e.key == "Enter"){
			exportJson();
		}
	});

	document.getElementById("subredditField").addEventListener("keyup", function(e){
		if(e.key == "Enter"){
			exportJson();
		}
	});

	exportButton.addEventListener("click", function(e){
		exportJson();
	});

	exportCloseButton.addEventListener("click", function(e){
		reset();
		exportOverlay.style.display = "none";
	});

	function exportJson(){		
		var exportObject = {
			 id: 0
			,name: document.getElementById("nameField").value
			,description: document.getElementById("descriptionField").value
			,website: document.getElementById("websiteField").value
			,subreddit: document.getElementById("subredditField").value
			,center: calculateCenter(path)
			,path: path
		};
		var jsonString = JSON.stringify(exportObject, null, "\t");
		var textarea = document.getElementById("exportString");
		jsonString = jsonString.split("\n");
		jsonString = jsonString.join("\n    ");
		jsonString = "    "+jsonString;
		textarea.value = jsonString;

		exportOverlay.style.display = "block";
		
		textarea.focus();
		textarea.select();
	}

	function calculateCenter(path){

		var area = 0,
            i,
            j,
            point1,
            point2;

        for (i = 0, j = path.length - 1; i < path.length; j=i,i++) {
            point1 = path[i];
            point2 = path[j];
            area += point1[0] * point2[1];
            area -= point1[1] * point2[0];
        }
        area *= 3;
		
		var x = 0,
            y = 0,
            f;

        for (i = 0, j = path.length - 1; i < path.length; j=i,i++) {
            point1 = path[i];
            point2 = path[j];
            f = point1[0] * point2[1] - point2[0] * point1[1];
            x += (point1[0] + point2[0]) * f;
            y += (point1[1] + point2[1]) * f;
        }

        return [~~(x / area)+0.5, ~~(y / area)+0.5];
        
	}

	function undo(){
		if(path.length > 0 && drawing){
			undoHistory.push(path.pop());
			redoButton.disabled = false;
			if(path.length == 0){
				undoButton.disabled = true;
			}
			render(path);
		}
	}

	function redo(){
		if(undoHistory.length > 0 && drawing){
			path.push(undoHistory.pop());
			undoButton.disabled = false;
			if(undoHistory.length == 0){
				redoButton.disabled = true;
			}
			render(path);
		}
	}

	function finish(){
		drawing = false;
		render(path);
		objectInfoBox.style.display = "block";
		hintText.style.display = "none";
		finishButton.style.display = "none";
		undoButton.style.display = "none";
		redoButton.style.display = "none";
		resetButton.style.display = "none";
		document.getElementById("nameField").focus();
	}

	function reset(){
		path = [];
		undoHistory = [];
		finishButton.disabled = true;
		undoButton.disabled = true; // Maybe make it undo the cancel action in the future
		redoButton.disabled = true;
		drawing = true;
		render(path);
		objectInfoBox.style.display = "none";
		hintText.style.display = "block";
		finishButton.style.display = "block";
		undoButton.style.display = "block";
		redoButton.style.display = "block";
		resetButton.style.display = "block";

		document.getElementById("nameField").value = "";
		document.getElementById("descriptionField").value = "";
		document.getElementById("websiteField").value = "";
		document.getElementById("subredditField").value = "";
	}

	function render(path){

		context.globalCompositeOperation = "source-over";
		context.clearRect(0, 0, canvas.width, canvas.height);
		
		context.fillStyle = "rgba(0, 0, 0, 0.6)";
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
	
}


