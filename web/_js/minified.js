


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
	http://place-atlas.stefanocoding.me/license.txt
	
	========================================================================
*/




window.addEventListener("error", function (e) {
	console.log(e);
	var errorMessage = "<p class=\"error\">An error has occurred:</p>";
	errorMessage += "<p class=\"errorBody\">" + e.message + "</p>";
	errorMessage += "<p class=\"errorBody\">on line " + e.lineno + "</p>";
	errorMessage += "<p class=\"error\">If this keeps happening, feel free to send me a <a href=\"mailto:roland.rytz@gmail.com\">mail</a>.</p>";
	document.getElementById("loadingContent").innerHTML = errorMessage;
});

function pointIsInPolygon (point, polygon) {
    // ray-casting algorithm based on
    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
    
    var x = point[0], y = point[1];
    
    var inside = false;
    for (var i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        var xi = polygon[i][0], yi = polygon[i][1];
        var xj = polygon[j][0], yj = polygon[j][1];
        
        var intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    
    return inside;
};

var atlas = [
{"id":0,"name":"Pinewood Logo/Rubix cube (Destroyed)","description":"Originally the logo for the Roblox group Pinewood Builders, the logo transformed into a game of tic tac toe, and then a Rubix cube. It was destroyed after being invaded by Iran","website":"https://pinewoodbuilders.reddit.com/","subreddit":"r/PinewoodBuilders","center":[39.5,279.5],"path":[[22.5,295.5],[23.5,274.5],[35.5,262.5],[55.5,262.5],[55.5,283.5],[43.5,295.5]]},
{"id":1,"name":"CCKUFI Robin","description":"The icon of CcKuFi, the subreddit of users who made it to the highest tier in Reddit's 2016 April Fools Event, Robin.","subreddit":"ccKufiPrFaShleWoli0","center":[783.5,669.5],"path":[[771.5,661.5],[771.5,680.5],[789.5,680.5],[789.5,664.5],[806.5,664.5],[806.5,660.5],[771.5,660.5]]},
{"id":2,"name":"Narrator Nexus","description":"The icon of Narrator Nexus, the group of users who coordinated the storyline in Reddit's 2019 April Fools Event, Sequence.","website":"","subreddit":"/r/NarraNexus/","center":[763.5,673.5],"path":[[755.5,667.5],[755.5,680.5],[771.5,680.5],[771.5,674.5],[772.5,673.5],[772.5,670.5],[767.5,664.5],[762.5,664.5],[759.5,669.5],[755.5,667.5]]},
{"id":3,"name":"April Knights","description":"The Logo of the April Knights, a subreddit formed for Reddit's 2015 April Fools event 'The Button'.","website":"","subreddit":"/r/AprilKnights/","center":[788.5,677.5],"path":[[789.5,664.5],[789.5,679.5],[789.5,680.5],[755.5,680.5],[755.5,684.5],[803.5,684.5],[801.5,679.5],[803.5,676.5],[803.5,664.5],[789.5,664.5]]},
{"id":4,"name":"Triforce","description":"The iconic symbol of the Legend of Zelda franchise.","website":"","subreddit":"/r/Zelda","center":[788.5,640.5],"path":[[788.5,598.5],[756.5,661.5],[819.5,661.5],[819.5,660.5],[788.5,598.5]]},
{"id":5,"name":"The Sword of Protection","description":"A magic sword from the 2018 Netflix series She-Ra and the Princesses of Power. The text underneath the sword spells out \"She-Ra\".","website":"https://www.netflix.com/title/80179762","subreddit":"/r/PrincessesOfPower","center":[1544.5,420.5],"path":[[1532.5,414.5],[1532.5,426.5],[1555.5,426.5],[1555.5,414.5]]},
{"id":6,"name":"2b2t logo","description":"The logo of 2b2t.org, the oldest anarchy server in Minecraft. (r/2b2t)","website":"","subreddit":"r/2b2tplace","center":[936.5,451.5],"path":[[912.5,421.5],[912.5,481.5],[960.5,481.5],[960.5,421.5]]},
{"id":7,"name":"Fancade","description":"The fancade logo, a mobile game with a built in game engine.","website":"www.fancade.com","subreddit":"r/fancade","center":[90.5,696.5],"path":[[72.5,690.5],[108.5,690.5],[108.5,701.5],[79.5,702.5],[75.5,702.5],[72.5,703.5],[73.5,690.5]]},
{"id":8,"name":"NotITG","description":"Stepmania fork for modcharts","website":"https://noti.tg/","subreddit":"","center":[1198.5,58.5],"path":[[1179.5,60.5],[1183.5,56.5],[1180.5,53.5],[1183.5,50.5],[1184.5,49.5],[1213.5,49.5],[1213.5,63.5],[1215.5,63.5],[1215.5,68.5],[1212.5,68.5],[1212.5,67.5],[1195.5,67.5],[1195.5,64.5],[1183.5,64.5]]},
{"id":9,"name":"Firey","description":"A pixel version of the bfdi character, Firey","website":"https://bfdi.tv","subreddit":"r/battlefordreamisland","center":[620.5,876.5],"path":[[631.5,866.5],[609.5,866.5],[609.5,885.5],[630.5,886.5]]},
{"id":10,"name":"r/DeepRockGalactic","description":"Deep Rock Galactic is a 1-4 player co-op FPS featuring badass space Dwarves, 100% destructible environments, procedurally-generated caves, and endless hordes of alien monsters.","website":"https://www.deeprockgalactic.com/","subreddit":"https://www.reddit.com/r/DeepRockGalactic/","center":[208.5,285.5],"path":[[175.5,262.5],[241.5,262.5],[241.5,308.5],[175.5,308.5],[175.5,262.5]]},
{"id":11,"name":"FIRST Robotics competition logo","description":"Highschool robotics competition. ","website":"","subreddit":"r/FRC","center":[1750.5,259.5],"path":[[1727.5,249.5],[1754.5,249.5],[1754.5,253.5],[1768.5,253.5],[1768.5,249.5],[1772.5,249.5],[1772.5,269.5],[1738.5,269.5],[1738.5,262.5],[1727.5,262.5],[1727.5,249.5]]},
{"id":12,"name":"Starwars","description":"Poster art for 'Star Wars Episode IV: A New Hope', done by the redditors at starwars_place. Heavy battles fought against among us, and only once briefly disappearing to XQC, before being reinstated.","website":"","subreddit":"/r/starwars_place/","center":[621.5,771.5],"path":[[571.5,698.5],[671.5,698.5],[671.5,844.5],[570.5,843.5]]},
{"id":13,"name":"Cang","description":"It's quite literally just cang.","website":"","subreddit":"","center":[1960.5,328.5],"path":[[1954.5,322.5],[1954.5,333.5],[1966.5,333.5],[1966.5,322.5],[1954.5,322.5]]},
{"id":14,"name":"Avicii Tribute","description":"The logo of the Swedish DJ and EDM artist Avicii, who was born on 8 September 1989 and died on 20 April 2018. The creation was part of a collaboration with r/Avicii and r/Place_Nordicunion.","website":"https://discord.gg/9zTbdMSUea","subreddit":"r/Avicii","center":[757.5,81.5],"path":[[740.5,91.5],[773.5,91.5],[773.5,71.5],[740.5,71.5],[740.5,91.5]]},
{"id":15,"name":"Burdurland Logo","description":"Logo of subreddit r/burdurland","website":"","subreddit":"r/burdurland","center":[965.5,44.5],"path":[[999.5,0.5],[999.5,87.5],[930.5,87.5],[930.5,0.5]]},
{"id":16,"name":"Trackmania","description":"Original/previous logo of the arcade racing game series Trackmania.","website":"https://www.trackmania.com","subreddit":"r/trackmania","center":[411.5,749.5],"path":[[373.5,740.5],[448.5,740.5],[448.5,757.5],[373.5,757.5],[373.5,740.5]]},
{"id":17,"name":"Czech flag with pixelarts","description":"Czech flag made by the community of r/czech.\nWith pixelarts from Czech culture.","website":"","subreddit":"/r/czech","center":[1266.5,205.5],"path":[[1206.5,161.5],[1206.5,248.5],[1324.5,249.5],[1326.5,161.5]]},
{"id":18,"name":"Duck Game duck wearing a Jetpack","description":"A lovely character from a multiplayer action-platformer game made by Landon Podbielski.","website":"http://store.steampowered.com/app/312530","subreddit":"r/duckgame","center":[1723.5,139.5],"path":[[1730.5,128.5],[1730.5,150.5],[1716.5,150.5],[1716.5,128.5]]},
{"id":19,"name":"Pou (Mobile Game)","description":"Pou was a Top 1 downloaded game on Google Play for several years straight soon post-release. In it, player would take care of a vitual pet, feeding it, buying medicine and playing minigames.","website":"https://play.google.com/store/apps/details?id=me.pou.app&gl=us","subreddit":"","center":[1545.5,495.5],"path":[[1500.5,447.5],[1590.5,447.5],[1590.5,542.5],[1500.5,545.5],[1500.5,447.5]]},
{"id":20,"name":"Statue of Saint Wenceslas","description":"A Statue of Saint Wenceslas, patron of the Czech state, located at Wenceslas Square in Prague, Czech Republic.","website":"","subreddit":"r/czech","center":[1231.5,226.5],"path":[[1208.5,248.5],[1251.5,249.5],[1246.5,244.5],[1250.5,236.5],[1244.5,232.5],[1247.5,227.5],[1250.5,228.5],[1257.5,223.5],[1256.5,217.5],[1247.5,211.5],[1240.5,214.5],[1238.5,217.5],[1233.5,210.5],[1237.5,181.5],[1233.5,181.5],[1232.5,187.5],[1223.5,189.5],[1228.5,196.5],[1231.5,196.5],[1231.5,201.5],[1225.5,201.5],[1226.5,219.5],[1217.5,220.5],[1209.5,222.5],[1208.5,231.5],[1213.5,231.5],[1211.5,240.5]]},
{"id":21,"name":"Jerma985","description":"Jerma is long time streamer and a retired YouTuber. Most of the time he's streaming games from various eras, but he's most famous for these special, semi-scripted streams, like playing archeologist on real excavation site, holiday streams or creating Jerma Dollhouse.","website":"https://jerma-lore.fandom.com/wiki/Jerma985","subreddit":"","center":[114.5,977.5],"path":[[92.5,955.5],[135.5,955.5],[135.5,999.5],[92.5,999.5]]},
{"id":22,"name":"United Kingdom","description":"","website":"","subreddit":"r/ukplace","center":[635.5,516.5],"path":[[569.5,476.5],[571.5,557.5],[701.5,557.5],[701.5,476.5],[701.5,476.5],[701.5,476.5],[701.5,476.5],[700.5,476.5]]},
{"id":23,"name":"BFDI Bubble and Leafy","description":"Leafy and Bubble from \"Battle For Dream Island\" standing on Yoyleland.","website":"https://www.youtube.com/watch?v=YQa2-DY7Y_Q&list=PL24C8378F296DB656&ab_channel=jacknjellify","subreddit":"r/BattleForDreamIsland","center":[1575.5,54.5],"path":[[1561.5,42.5],[1562.5,67.5],[1588.5,67.5],[1588.5,42.5]]},
{"id":24,"name":"OSU","description":"Place tiles for the rhythm game Osu! ","website":"https://www.reddit.com/r/osuplace/","subreddit":"r/osuplace","center":[727.5,726.5],"path":[[695.5,691.5],[710.5,682.5],[730.5,679.5],[751.5,685.5],[765.5,696.5],[773.5,716.5],[775.5,733.5],[768.5,752.5],[758.5,764.5],[746.5,769.5],[728.5,774.5],[707.5,769.5],[693.5,760.5],[683.5,746.5],[678.5,732.5],[681.5,711.5],[692.5,694.5]]},
{"id":25,"name":"Northeastern University","description":"Northeastern University Husky and Initials. Coordinated using discord : https://www.reddit.com/r/NEU/comments/tt7dhj/rplace_northeastern_discord/","website":"https://www.reddit.com/r/NEU/","subreddit":"r/NEU","center":[221.5,707.5],"path":[[185.5,699.5],[258.5,699.5],[258.5,714.5],[183.5,714.5],[184.5,698.5]]},
{"id":26,"name":"GNU/Linux","description":"Icon for various nix distributions and a large Tux Penguin ","website":"https://www.reddit.com/r/placetux/","subreddit":"r/placetux","center":[46.5,722.5],"path":[[20.5,679.5],[71.5,679.5],[71.5,764.5],[20.5,765.5],[21.5,680.5]]},
{"id":27,"name":"Club Penguin","description":"A blue penguin from the MMO videogame Club Penguin, which officially closed in March 2017.","website":"","subreddit":"/r/clubpenguin","center":[1884.5,159.5],"path":[[1887.5,141.5],[1881.5,141.5],[1880.5,142.5],[1879.5,142.5],[1879.5,144.5],[1878.5,145.5],[1877.5,145.5],[1877.5,151.5],[1876.5,151.5],[1876.5,152.5],[1876.5,152.5],[1875.5,153.5],[1875.5,154.5],[1874.5,155.5],[1874.5,156.5],[1873.5,157.5],[1872.5,158.5],[1872.5,159.5],[1871.5,160.5],[1871.5,161.5],[1871.5,162.5],[1871.5,165.5],[1871.5,166.5],[1872.5,167.5],[1873.5,166.5],[1874.5,165.5],[1875.5,164.5],[1875.5,165.5],[1875.5,167.5],[1876.5,168.5],[1877.5,169.5],[1875.5,169.5],[1875.5,170.5],[1875.5,171.5],[1874.5,171.5],[1874.5,174.5],[1879.5,174.5],[1880.5,173.5],[1881.5,172.5],[1882.5,173.5],[1883.5,174.5],[1884.5,173.5],[1885.5,172.5],[1886.5,172.5],[1886.5,173.5],[1887.5,173.5],[1887.5,174.5],[1893.5,174.5],[1893.5,173.5],[1892.5,172.5],[1892.5,171.5],[1891.5,170.5],[1891.5,169.5],[1890.5,169.5],[1891.5,168.5],[1892.5,168.5],[1892.5,164.5],[1893.5,165.5],[1893.5,166.5],[1894.5,166.5],[1894.5,167.5],[1896.5,167.5],[1896.5,160.5],[1895.5,159.5],[1895.5,156.5],[1894.5,155.5],[1893.5,154.5],[1893.5,153.5],[1892.5,152.5],[1891.5,151.5],[1891.5,149.5],[1890.5,148.5],[1890.5,145.5],[1889.5,144.5],[1889.5,143.5],[1888.5,142.5]]},
{"id":28,"name":"Among Us crewmate","description":"Among Us is a game released in 2018 that gained wide recognition during 2020. \"Large\" crewmates on the canvas often are edited with obscene details, while the small variants transparently populate other drawings.","website":"https://store.steampowered.com/app/945360/Among_Us/","subreddit":"","center":[1366.5,409.5],"path":[[1339.5,383.5],[1339.5,368.5],[1341.5,364.5],[1348.5,358.5],[1355.5,353.5],[1362.5,351.5],[1375.5,350.5],[1384.5,351.5],[1392.5,355.5],[1397.5,362.5],[1400.5,367.5],[1402.5,373.5],[1400.5,456.5],[1389.5,467.5],[1385.5,468.5],[1379.5,460.5],[1366.5,460.5],[1359.5,470.5],[1355.5,471.5],[1352.5,471.5],[1348.5,470.5],[1340.5,459.5],[1339.5,439.5],[1338.5,427.5],[1330.5,427.5],[1322.5,420.5],[1322.5,395.5],[1322.5,389.5],[1329.5,384.5]]},
{"id":29,"name":"American Flag","description":"The american flag","website":"","subreddit":"","center":[390.5,488.5],"path":[[299.5,448.5],[481.5,449.5],[481.5,527.5],[299.5,528.5],[299.5,487.5]]},
{"id":30,"name":"Flag of East Turkestan","description":"The historical flag of the Turkic Islamic Republic of East Turkestan, currently used by Uyghur activists","website":"","subreddit":"","center":[978.5,454.5],"path":[[965.5,442.5],[991.5,442.5],[991.5,464.5],[991.5,465.5],[965.5,465.5]]},
{"id":31,"name":"Flag of Turkey","description":"Flag of Turkey with the silhouette of Istanbul","website":"","subreddit":"r/turkey","center":[390.5,396.5],"path":[[300.5,344.5],[479.5,344.5],[479.5,448.5],[300.5,448.5],[300.5,344.5]]},
{"id":32,"name":"Atatürk's Portrait","description":"Mustafa Kemal Atatürk, founder of Turkey","website":"","subreddit":"r/turkey","center":[1052.5,60.5],"path":[[1001.5,1.5],[1103.5,1.5],[1103.5,119.5],[1001.5,119.5]]},
{"id":33,"name":"Moka pot","description":"An Italian traditional coffee maker.","website":"","subreddit":"","center":[833.5,391.5],"path":[[815.5,406.5],[850.5,406.5],[850.5,376.5],[815.5,376.5]]},
{"id":34,"name":"Toki Pona (ma nanpa wan)","description":"The first site decorated by the toki pona community. Toki pona is a minimalist constructed language by Sonja Lang (jan Sonja).","website":"https://tokipona.org/","subreddit":"r/tokipona/","center":[763.5,345.5],"path":[[740.5,330.5],[786.5,330.5],[786.5,360.5],[740.5,360.5]]},
{"id":35,"name":"civbr :happysperm:/:squirtyay:","description":"The :squirtyay:/:happysperm: emote built by the r/civbattleroyale and associated communities","website":"","subreddit":"r/civbattleroyale","center":[718.5,369.5],"path":[[707.5,360.5],[724.5,360.5],[730.5,366.5],[730.5,374.5],[725.5,380.5],[718.5,380.5],[714.5,377.5],[707.5,376.5],[707.5,376.5],[707.5,360.5]]},
{"id":36,"name":"Java","description":"The Java Logo","website":"","subreddit":"","center":[1220.5,875.5],"path":[[1215.5,870.5],[1224.5,870.5],[1224.5,879.5],[1215.5,879.5]]},
{"id":37,"name":"Tally Hall Logo","description":"This is the logo of the band \"tally hall\". Above it, in the trans pride flag, is the character \"ally hall\", a joint project between the two groups. ","website":"https://www.tallyhall.com","subreddit":"/r/tallyhall","center":[769.5,495.5],"path":[[754.5,477.5],[754.5,521.5],[763.5,521.5],[763.5,507.5],[786.5,507.5],[786.5,477.5],[773.5,477.5]]},
{"id":38,"name":"clint stevens","description":"profile picture of clint stevens, a speedrunner twitch's streamer","website":"https://www.twitch.tv/clintstevens","subreddit":"r/ClintStevens","center":[1727.5,899.5],"path":[[1717.5,889.5],[1736.5,889.5],[1736.5,909.5],[1717.5,909.5]]},
{"id":39,"name":"Encanto Butterfly","description":"Butterfly from the Disney animated movie Encanto.","website":"","subreddit":"","center":[1924.5,275.5],"path":[[1918.5,270.5],[1918.5,281.5],[1927.5,281.5],[1933.5,270.5],[1918.5,270.5]]},
{"id":40,"name":"Outer wilds Patch","description":"the main logo for the game outer wilds, it's content is animated to emulate a supernovae","website":"","subreddit":"r/outerwilds","center":[367.5,948.5],"path":[[347.5,959.5],[388.5,959.5],[389.5,958.5],[389.5,955.5],[368.5,925.5],[367.5,925.5],[346.5,955.5],[346.5,958.5],[347.5,959.5],[371.5,954.5],[346.5,955.5]]},
{"id":41,"name":"Amulet of Yendor","description":"A powerful artifact representing the Pixel Dungeon community.","website":"https://pixeldungeon.fandom.com/wiki/Amulet_of_Yendor","subreddit":"/r/PixelDungeon","center":[698.5,368.5],"path":[[689.5,361.5],[689.5,361.5],[689.5,361.5],[707.5,361.5],[707.5,375.5],[689.5,375.5],[689.5,368.5]]},
{"id":42,"name":"Hatchling and scout","description":"main character of the game Outer Wilds","website":"","subreddit":"r/outerwilds","center":[389.5,934.5],"path":[[384.5,944.5],[391.5,944.5],[391.5,942.5],[390.5,942.5],[390.5,938.5],[392.5,938.5],[393.5,939.5],[395.5,940.5],[395.5,941.5],[396.5,942.5],[395.5,943.5],[395.5,944.5],[397.5,944.5],[397.5,943.5],[398.5,942.5],[399.5,942.5],[400.5,943.5],[400.5,944.5],[402.5,944.5],[402.5,943.5],[401.5,942.5],[402.5,941.5],[402.5,939.5],[400.5,937.5],[399.5,937.5],[399.5,935.5],[400.5,935.5],[399.5,934.5],[398.5,935.5],[399.5,936.5],[399.5,937.5],[397.5,937.5],[395.5,939.5],[394.5,938.5],[394.5,935.5],[391.5,930.5],[391.5,923.5],[388.5,921.5],[385.5,921.5],[384.5,923.5],[383.5,923.5],[382.5,922.5],[381.5,923.5],[382.5,925.5],[383.5,928.5],[383.5,930.5],[380.5,935.5],[380.5,938.5],[381.5,939.5],[384.5,938.5],[384.5,944.5]]},
{"id":43,"name":"Corridor Crew Logo","description":"Logo from the Corridor youtube channel, a group of vfx artist.","website":"https://www.youtube.com/c/corridorcrew","subreddit":"r/Corridor","center":[121.5,94.5],"path":[[121.5,87.5],[114.5,93.5],[121.5,101.5],[128.5,94.5]]},
{"id":44,"name":"OptiFine logo","description":"The logo of the Minecraft performance mod, OptiFine","website":"https://www.optifine.net/","subreddit":"r/Optifine","center":[810.5,671.5],"path":[[804.5,665.5],[815.5,665.5],[815.5,677.5],[804.5,677.5]]},
{"id":45,"name":"Rec Room","description":"Rec Room is a virtual reality, online video game with an integrated game creation system developed and published by Rec Room Inc.","website":"https://recroom.com","subreddit":"/r/recroom","center":[398.5,991.5],"path":[[393.5,1000.5],[403.5,999.5],[403.5,982.5],[394.5,982.5],[394.5,987.5],[393.5,987.5],[393.5,989.5]]}
];

//console.log("There are "+atlas.length+" entries in the Atlas.");

/*
atlas.sort(function(a, b){
	if (a.id < b.id) {
		return -1;
	}
	if (a.id > b.id) {
		return 1;
	}
		// a must be equal to b
	return 0;
});

for(var i = 0; i < atlas.length; i++){
	if(atlas[i-1]){
		if(atlas[i-1].id == atlas[i].id){
			console.log(atlas[i-1].id + ": "+ atlas[i-1].name);
			console.log(atlas[i  ].id + ": "+ atlas[i  ].name);
		}
	}
}

console.log("biggest id: "+atlas[atlas.length-1].id + ", " + atlas[atlas.length-1].name);
*/


/*
for(var i = 0; i < atlas.length; i++){
	if(typeof atlas[i].website == "undefined"){
		console.log(atlas[i].name);
	} else if(atlas[i].website.trim() != ""){
		if(atlas[i].website.trim().substring(0, 4) != "http"){
			console.log(atlas[i].name + ": " + atlas[i].website);
		}
	}
}
*/

// sort by center.y, so that lines will overlap less
atlas.sort(function (a, b) {
	if (a.center[1] < b.center[1]) {
		return -1;
	}
	if (a.center[1] > b.center[1]) {
		return 1;
	}
	// a must be equal to b
	return 0;
});




/*

// Populate with test data

for(var i = 0; i < 10000; i++){
	var x = ~~(Math.random() * 1000)+0.5;
	var y = ~~(Math.random() * 1000)+0.5;
	var w = ~~(Math.random()*100);
	var h = ~~(Math.random()*100);
	atlas.push({
		"id": 5,
		"name": "test"+(i+3),
		"website": "",
		"subreddit": "",
		"center": [0, 0],
		"path":[
			[x, y],
			[x+w, y],
			[x+w, y+h],
			[x, y+h]
		]
	});
}

*/




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
	http://place-atlas.stefanocoding.me/license.txt

	========================================================================
*/
var linesCanvas = document.getElementById("linesCanvas");
var linesContext = linesCanvas.getContext("2d");
var hovered = [];

var previousZoomOrigin = [0, 0];
var previousScaleZoomOrigin = [0, 0];

var backgroundCanvas = document.createElement("canvas");
backgroundCanvas.width = 2000;
backgroundCanvas.height = 1000;
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

		backgroundContext.strokeStyle = "rgba(255, 255, 255, 0.8)";
		backgroundContext.stroke();
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

	// parse linked atlas entry id from link hash
	/*if (window.location.hash.substring(3)){
		zoom = 4;
		applyView();
		highlightEntryFromUrl();
	}*/

	if(document.documentElement.clientWidth > 1000){
		entriesListShown = true;
		wrapper.className = wrapper.className.replace(/ listHidden/g, "");
	}

	if(document.documentElement.clientWidth < 1000){
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

	function createInfoBlock(entry){
		var element = document.createElement("div");
		element.className = "object";

		var html = "<h2><a href=\"?id="+entry.id+"\">"+entry.name+"</a></h2>";
		
		if(entry.description){
			html += "<p>"+entry.description+"</p>";
		}
		if(entry.website){
			html += "<a target=\"_blank\" href="+entry.website+">Website</a>";
		}
		if(entry.subreddit){
			var subreddits = entry.subreddit.split(",");
			
			for(var i in subreddits){
				var subreddit = subreddits[i].trim();
				if(subreddit.substring(0, 2) == "r/"){
					subreddit = "/" + subreddit;
				} else if(subreddit.substring(0, 1) != "/"){
					subreddit = "/r/" + subreddit;
				}
				html += "<a target=\"_blank\" href=https://reddit.com"+subreddit+">"+subreddit+"</a>";
			}
		}
		element.innerHTML += html;
		
		return element;
	}

	function highlightEntryFromUrl(){

		var objectsContainer = document.getElementById("objectsList");

		var id = 0;
		
		var args = window.location.search;
		if(args){
			id = args.split("id=")[1];
			if(id){
				id = parseInt(id.split("&")[0]);
			}
		}

		//var id = parseInt(window.location.hash.substring(3));
		
		var entry = atlas.filter(function(e){
			return e.id === id;
		});

		if (entry.length === 1){
			entry = entry[0];

			document.title = entry.name + " on the /r/place Atlas";
			
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
				 1000/2 - entry.center[0]// + container.offsetLeft
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
					hovered = newHovered;

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
						 1000/2  - this.entry.center[0]
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
					
					zoomOrigin = [
						 innerContainer.clientWidth/2  - this.entry.center[0]* zoom// + container.offsetLeft
						,innerContainer.clientHeight/2 - this.entry.center[1]* zoom// + container.offsetTop
					]

					scaleZoomOrigin = [
						 1000/2  - this.entry.center[0]
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

	function render(){

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

			context.strokeStyle = "rgba(0, 0, 0, 1)";
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
	});

	container.addEventListener("mouseup", function(e){
		if(Math.abs(lastPos[0] - e.clientX) + Math.abs(lastPos[1] - e.clientY) <= 4){
			toggleFixed(e);
		}
	});

	container.addEventListener("touchend", function(e){
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

		if(document.documentElement.clientWidth > 1000 && viewportWidth <= 1000){
			entriesListShown = true;
			wrapper.className = wrapper.className.replace(/ listHidden/g, "");
		}

		if(document.documentElement.clientWidth < 1000 && viewportWidth >= 1000){
			entriesListShown = false;
			wrapper.className += " listHidden";
		}

		viewportWidth = document.documentElement.clientWidth;
		
		applyView();
		render();
		updateLines();
		
	});

}




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
	http://place-atlas.stefanocoding.me/license.txt
	
	========================================================================
*/


function initDraw(){

	var finishButton = document.getElementById("finishButton");
	var resetButton = document.getElementById("resetButton");
	var undoButton = document.getElementById("undoButton");
	var redoButton = document.getElementById("redoButton");
	var highlightUnchartedLabel = document.getElementById("highlightUnchartedLabel");
	
	var objectInfoBox = document.getElementById("objectInfo");
	var hintText = document.getElementById("hint");
	
	var exportButton = document.getElementById("exportButton");
	var cancelButton = document.getElementById("cancelButton");

	var exportOverlay = document.getElementById("exportOverlay");
	var exportCloseButton = document.getElementById("exportCloseButton");

	var rShiftPressed = false;
	var lShiftPressed = false;
	var shiftPressed = false;

	var backgroundCanvas = document.createElement("canvas");
	backgroundCanvas.width = 2000;
	backgroundCanvas.height = 1000;
	var backgroundContext = backgroundCanvas.getContext("2d");

	var highlightUncharted = true;

	renderBackground();

	container.style.cursor = "crosshair";
	
	var path = [];
	var drawing = true;

	var undoHistory = [];

	var lastPos = [0, 0];

	render(path);

	container.addEventListener("mousedown", function(e){
		lastPos = [
			 e.clientX
			,e.clientY
		];
	});

	function getCanvasCoords(x, y){
		x = x - container.offsetLeft;
		y = y - container.offsetTop;

		var pos = [
			 ~~((x - (container.clientWidth/2  - innerContainer.clientWidth/2  + zoomOrigin[0]))/zoom)+0.5
			,~~((y - (container.clientHeight/2 - innerContainer.clientHeight/2 + zoomOrigin[1]))/zoom)+0.5
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

	document.getElementById("highlightUncharted").addEventListener("click", function(e){
		highlightUncharted = this.checked;
		render(path);
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

		exportOverlay.style.display = "flex";
		
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
		highlightUnchartedLabel.style.display = "none";
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
		highlightUnchartedLabel.style.display = "block";

		document.getElementById("nameField").value = "";
		document.getElementById("descriptionField").value = "";
		document.getElementById("websiteField").value = "";
		document.getElementById("subredditField").value = "";
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
	
}





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
	http://place-atlas.stefanocoding.me/license.txt
	
	========================================================================
*/


var innerContainer = document.getElementById("innerContainer");
var container = document.getElementById("container");
var canvas = document.getElementById("highlightCanvas");
var context = canvas.getContext("2d");

var zoom = 1;

if(window.devicePixelRatio){
	zoom = 1/window.devicePixelRatio;
}

var maxZoom = 128;
var minZoom = 0.1;

var zoomOrigin = [0, 0];
var scaleZoomOrigin = [0, 0];

var dragging = false;
var lastPosition = [0, 0];

var viewportSize = [0, 0];

document.getElementById("donateButton").addEventListener("click", function(e){
	document.getElementById("bitcoinQR").src = "./_img/bitcoinQR.png?from=index";
	document.getElementById("donateOverlay").style.display = "flex";
});

document.getElementById("closeBitcoinButton").addEventListener("click", function(e){
	document.getElementById("donateOverlay").style.display = "none";
});

function applyView(){
	
	//console.log(zoomOrigin, scaleZoomOrigin);
	//console.log(scaleZoomOrigin[0]);

	scaleZoomOrigin[0] = Math.max(-1000, Math.min(1000, scaleZoomOrigin[0]));
	scaleZoomOrigin[1] = Math.max(-500, Math.min(500, scaleZoomOrigin[1]));

	zoomOrigin = [scaleZoomOrigin[0]*zoom, scaleZoomOrigin[1]*zoom];

	innerContainer.style.height = (~~(zoom*1000))+"px";
	innerContainer.style.width = (~~(zoom*2000))+"px";
	
	innerContainer.style.left = ~~(container.clientWidth/2 - innerContainer.clientWidth/2 + zoomOrigin[0] + container.offsetLeft)+"px";
	innerContainer.style.top = ~~(container.clientHeight/2 - innerContainer.clientHeight/2 + zoomOrigin[1] + container.offsetTop)+"px";
	
}

init();

function init(){

	//console.log(document.documentElement.clientWidth, document.documentElement.clientHeight);

	zoomOrigin = [0, 0];
	applyView();

	var initialPinchDistance = 0;
	var initialPinchZoom = 0;
	var initialPinchZoomOrigin = [0, 0];

	var desiredZoom;
	var zoomAnimationFrame;

	var mode = "view";

	var args = window.location.search;
	if(args){
		mode = args.split("mode=")[1];
		if(mode){
			mode = mode.split("&")[0];
		} else {
			mode = "view";
		}
	}

	if(mode == "view"){
		
		wrapper.className = wrapper.className.replace(/ drawMode/g, "");
		initView();
		
	} else if(mode=="draw"){
		
		wrapper.className += " draw";
		initDraw();
		
	} else if(mode=="about"){
		window.location = "./about.html";
	} else if(mode=="overlap"){
		wrapper.className = wrapper.className.replace(/ drawMode/g, "");
		if(initOverlap){
			initOverlap();
		}
	}

	document.getElementById("loading").style.display = "none";

	document.getElementById("zoomInButton").addEventListener("click", function(e){

		/*if(zoomAnimationFrame){
			window.cancelAnimationFrame(zoomAnimationFrame);
		}*/
		
		var x = container.clientWidth/2;
		var y = container.clientHeight/2;

		initialPinchZoomOrigin = [
			scaleZoomOrigin[0],
			scaleZoomOrigin[1]
		];

		initialPinchZoom = zoom;
		
		lastPosition = [x, y];
		zoom = zoom * 2;
		zoom = Math.max(minZoom, Math.min(maxZoom, zoom));
		
		applyZoom(x, y, zoom);
		
	});

	document.getElementById("zoomOutButton").addEventListener("click", function(e){

		/*if(zoomAnimationFrame){
			window.cancelAnimationFrame(zoomAnimationFrame);
		}*/
		
		var x = container.clientWidth/2;
		var y = container.clientHeight/2;

		initialPinchZoomOrigin = [
			scaleZoomOrigin[0],
			scaleZoomOrigin[1]
		];

		initialPinchZoom = zoom;
		
		lastPosition = [x, y];
		zoom = zoom / 2;
		zoom = Math.max(minZoom, Math.min(maxZoom, zoom));
		
		applyZoom(x, y, zoom);
	});

	document.getElementById("zoomResetButton").addEventListener("click", function(e){
		zoom = 1;
		zoomOrigin = [0, 0];
		scaleZoomOrigin = [0, 0];
		updateLines();
		applyView();
	});

	container.addEventListener("dblclick", function(e){
		/*if(zoomAnimationFrame){
			window.cancelAnimationFrame(zoomAnimationFrame);
		}*/

		var x = e.clientX - container.offsetLeft;
		var y = e.clientY - container.offsetTop;

		initialPinchZoomOrigin = [
			scaleZoomOrigin[0],
			scaleZoomOrigin[1]
		];

		initialPinchZoom = zoom;
		
		lastPosition = [x, y];

		if(e.ctrlKey){

			zoom = zoom / 2;
			
		} else {
			
			zoom = zoom * 2;
		}

		zoom = Math.max(minZoom, Math.min(maxZoom, zoom));
		applyZoom(x, y, zoom);

		e.preventDefault();
	});


	container.addEventListener("wheel", function(e){

		/*if(zoomAnimationFrame){
			window.cancelAnimationFrame(zoomAnimationFrame);
		}*/

		var x = e.clientX - container.offsetLeft;
		var y = e.clientY - container.offsetTop;

		initialPinchZoomOrigin = [
			scaleZoomOrigin[0],
			scaleZoomOrigin[1]
		];

		initialPinchZoom = zoom;
		
		lastPosition = [x, y];
		
		if(e.deltaY > 0){

			zoom = zoom / 2;
			
		} else if(e.deltaY < 0){
			
			zoom = zoom * 2;
		}

		zoom = Math.max(minZoom, Math.min(maxZoom, zoom));
		applyZoom(x, y, zoom);

		e.preventDefault();
	});

	/*function setDesiredZoom(x, y, target){
		zoom = (zoom*2 + target)/3;
		//console.log(zoom);
		if(Math.abs(1 - zoom/target) <= 0.01){
			zoom = target;
		}
		applyZoom(x, y, zoom);
		if(zoom != target){
			zoomAnimationFrame = window.requestAnimationFrame(function(){
				setDesiredZoom(x, y, target);
			});
		}
	}*/

	container.addEventListener("mousedown", function(e){
		mousedown(e.clientX, e.clientY);
		e.preventDefault();
	});
	
	container.addEventListener("touchstart", function(e){

		if(e.touches.length == 2){
			e.preventDefault();
		}

		touchstart(e);

	});

	function mousedown(x, y){
		lastPosition = [x, y];
		dragging = true;
	}

	function touchstart(e){
		
		if(e.touches.length == 1){
			
			mousedown(e.touches[0].clientX, e.touches[0].clientY);
			
		} else if(e.touches.length == 2){
			
			initialPinchDistance = Math.sqrt(
				  Math.pow(e.touches[0].clientX - e.touches[1].clientX, 2)
				+ Math.pow(e.touches[0].clientY - e.touches[1].clientY, 2)
			);

			initialPinchZoom = zoom;
			initialPinchZoomOrigin = [
				scaleZoomOrigin[0],
				scaleZoomOrigin[1]
			];
			
			mousedown(
				(e.touches[0].clientX + e.touches[1].clientX)/2,
				(e.touches[0].clientY + e.touches[1].clientY)/2
			);
			
		}
		
	}

	window.addEventListener("mousemove", function(e){
		updateLines();
		mousemove(e.clientX, e.clientY);
		if(dragging){
			e.preventDefault();
		}
	});
	window.addEventListener("touchmove", function(e){

		if(e.touches.length == 2 || e.scale > 1){
			e.preventDefault();
		}

		touchmove(e);

	},
	{passive: false}
	);

	function mousemove(x, y){
		if(dragging){
			var deltaX = x - lastPosition[0];
			var deltaY = y - lastPosition[1];
			lastPosition = [x, y];

			zoomOrigin[0] += deltaX;
			zoomOrigin[1] += deltaY;

			scaleZoomOrigin[0] += deltaX/zoom;
			scaleZoomOrigin[1] += deltaY/zoom;

			previousZoomOrigin = [zoomOrigin[0], zoomOrigin[1]];
			previousScaleZoomOrigin = [scaleZoomOrigin[0], scaleZoomOrigin[1]];

			updateLines();
			applyView();
		}
	}

	function touchmove(e){

		updateLines();
		
		if(e.touches.length == 1){
			
			mousemove(e.touches[0].clientX, e.touches[0].clientY);
			
		} else if(e.touches.length == 2){
			
			var newPinchDistance = Math.sqrt(
				  Math.pow(e.touches[0].clientX - e.touches[1].clientX, 2)
				+ Math.pow(e.touches[0].clientY - e.touches[1].clientY, 2)
			);

			zoom = initialPinchZoom * newPinchDistance / initialPinchDistance;

			var x = (e.touches[0].clientX + e.touches[1].clientX)/2 - container.offsetLeft;
			var y = (e.touches[0].clientY + e.touches[1].clientY)/2 - container.offsetTop;

			applyZoom(x, y, zoom);
			
		}
		
	}

	function applyZoom(x, y, zoom){

		var deltaX = x - lastPosition[0];
		var deltaY = y - lastPosition[1];

		var pinchTranslateX = (x - container.clientWidth/2 - deltaX);
		var pinchTranslateY = (y - container.clientHeight/2 - deltaY);

		scaleZoomOrigin[0] = initialPinchZoomOrigin[0] + deltaX/zoom + pinchTranslateX/zoom - pinchTranslateX/initialPinchZoom;
		scaleZoomOrigin[1] = initialPinchZoomOrigin[1] + deltaY/zoom + pinchTranslateY/zoom - pinchTranslateY/initialPinchZoom;

		zoomOrigin[0] = scaleZoomOrigin[0]*zoom;
		zoomOrigin[1] = scaleZoomOrigin[1]*zoom;
		
		applyView();
		updateLines();
	}

	window.addEventListener("mouseup", function(e){
		if(dragging){
			e.preventDefault();
		}
		mouseup(e.clientX, e.clientY);
	});
	window.addEventListener("touchend", touchend);

	function mouseup(x, y){
		if(dragging){
			dragging = false;
		}
	}

	function touchend(e){
		
		if(e.touches.length == 0){
			
			mouseup();
			
		} else if(e.touches.length == 1){
			initialPinchZoom = zoom;
			lastPosition = [e.touches[0].clientX, e.touches[0].clientY];
		}
		
	}

	window.addEventListener("resize", function(){
		//console.log(document.documentElement.clientWidth, document.documentElement.clientHeight);
		
		applyView();
	});
	
}
