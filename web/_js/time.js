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

const variationsConfig = {
    default: {
        name: "r/place",
        code: "",
        default: 14,
        versions: [
            {
                timestamp: 1648822500,
                url: "./_img/place/1648822500.png"
            },
            {
                timestamp: 1648847036,
                url: "./_img/place/1648847036.png"
            },
            {
                timestamp: 1648870452,
                url: "./_img/place/1648870452.png"
            },
            {
                timestamp: 1648893666,
                url: "./_img/place/1648893666.png"
            },
            {
                timestamp: 1648917500,
                url: "./_img/place/1648917500.png"
            },
            {
                timestamp: 1648942113,
                url: "./_img/place/1648942113.png"
            },
            {
                timestamp: 1648956234,
                url: "./_img/place/1648956234.png"
            },
            {
                timestamp: 1648968061,
                url: "./_img/place/1648968061.png"
            },
            {
                timestamp: 1648979987,
                url: "./_img/place/1648979987.png"
            },
            {
                timestamp: 1648992274,
                url: "./_img/place/1648992274.png"
            },
            {
                timestamp: 1649012915,
                url: "./_img/place/1649012915.png"
            },
            {
                timestamp: 1649037182,
                url: "./_img/place/1649037182.png"
            },
            {
                timestamp: 1649060793,
                url: "./_img/place/1649060793.png"
            },
            {
                timestamp: 1649084741,
                url: "./_img/place/1649084741.png"
            },
            {
                timestamp: 1649113199,
                url: "./_img/place/final.png"
            }
        ]
    }
}

const codeReference = {}
const imageCache = {}

const variantsEl = document.getElementById("variants")

for (let variation in variationsConfig) {
    codeReference[variationsConfig[variation].code] = variation
    const optionEl = document.createElement('option')
    optionEl.value = variation
    optionEl.textContent = variationsConfig[variation].name
    variantsEl.appendChild(optionEl)
}

const timelineSlider = document.getElementById("timeControlsSlider");
const tooltip = document.getElementById("timeControlsTooltip")
const image = document.getElementById("image");
let abortController = new AbortController()
let currentUpdateIndex = 0
let updateTimeout = setTimeout(null, 0)

let currentVariation = "default"
let defaultPeriod = variationsConfig[currentVariation].default
let currentPeriod = defaultPeriod
window.currentPeriod = currentPeriod
window.currentVariation = currentVariation

// SETUP
timelineSlider.max = variationsConfig[currentVariation].versions.length - 1;
timelineSlider.value = currentPeriod;

timelineSlider.addEventListener("input", (event) => {
    updateTooltip(parseInt(event.target.value), currentVariation)
    clearTimeout(updateTimeout)
    updateTimeout = setTimeout(() => {
        updateTime(parseInt(event.target.value), currentVariation)
    }, 100)
})

variantsEl.addEventListener("input", (event) => {
    updateTime(currentPeriod, event.target.value)
})

// document.querySelector('#period-group .period-start').oninput = (event) => {
//     slider.value = parseInt(event.target.value)
//     updateTime(parseInt(event.target.value))
// };

// document.querySelector('#period-group .period-end').oninput = (event) => {
//     slider.value = parseInt(event.target.value)
//     updateTime(parseInt(event.target.value))
// };

const dispatchTimeUpdateEvent = (period = timelineSlider.value, atlas = atlas) => {
    const timeUpdateEvent = new CustomEvent('timeupdate', {
        detail: {
            period: period,
            atlas: atlas
        }
    });
    document.dispatchEvent(timeUpdateEvent);
}

async function updateBackground(newPeriod = currentPeriod, newVariation = currentVariation) {
    abortController.abort()
    abortController = new AbortController()
    currentUpdateIndex++
    let myUpdateIndex = currentUpdateIndex
    currentPeriod = newPeriod
    // console.log(newPeriod, newVariation)
    const variationConfig = variationsConfig[newVariation]
    if (currentVariation !== newVariation) {
        currentVariation = newVariation
        timelineSlider.max = variationConfig.versions.length - 1;
        currentPeriod = variationConfig.default;
        newPeriod = currentPeriod 
        timelineSlider.value = currentPeriod 
    }
    const configObject = variationConfig.versions[currentPeriod];
    if (typeof configObject.url === "string") {
        if (imageCache[configObject.url] === undefined)  {
            let fetchResult = await fetch(configObject.url, {
                signal: abortController.signal
            });
            if (currentUpdateIndex !== myUpdateIndex) {
                hideLoading()
                return
            }
            let imageBlob = await fetchResult.blob()
            imageCache[configObject.url] = URL.createObjectURL(imageBlob)  
        }
        image.src = imageCache[configObject.url]
    } else {
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        context.canvas.width = 2000
        context.canvas.height = 2000
        for await (let url of configObject.url) {
            if (imageCache[url] === undefined)  {
                let fetchResult = await fetch(url, {
                    signal: abortController.signal
                });
                if (currentUpdateIndex !== myUpdateIndex) {
                    hideLoading()
                    break
                }
                let imageBlob = await fetchResult.blob()
                imageCache[url] = URL.createObjectURL(imageBlob) 
            }
            const imageLayer = new Image()
            console.log(imageCache[url])
            await new Promise(resolve => {
                imageLayer.onload = () => {
                    context.drawImage(imageLayer, 0, 0)
                    console.log("image done")        
                    resolve()
                }
                imageLayer.src = imageCache[url]
            })
            
        }
        if (currentUpdateIndex !== myUpdateIndex) return
        const blob = await new Promise(resolve => canvas.toBlob(resolve))
        console.log(URL.createObjectURL(blob))
        image.src = URL.createObjectURL(blob)
    }

    return [configObject, newPeriod, newVariation]
}

async function updateTime(newPeriod = currentPeriod, newVariation = currentVariation) {
    document.body.dataset.canvasLoading = true

    let configObject
    [configObject, newPeriod, newVariation] = await updateBackground(newPeriod, newVariation)
    
    atlas = []
    for ( var atlasIndex in atlasAll ) {
        let pathChosen, centerChosen, chosenIndex

        let validPeriods2 = Object.keys(atlasAll[atlasIndex].path)

        // console.log(chosenIndex)

        for (let i in validPeriods2) {
            let validPeriods = validPeriods2[i].split(', ')
            for (let j in validPeriods) {
                let [start, end, variation] = parsePeriod(validPeriods[j])
                // console.log(start, end, variation, newPeriod, newVariation)
                if (isOnPeriod(start, end, variation, newPeriod, newVariation)) {
                    // console.log("match", start, end, variation, newPeriod, newVariation, i)
                    chosenIndex = i
                    break
                }
            }
            if (chosenIndex !== undefined) break
        }

        // console.log(testMatches)

        // console.log(chosenIndex)
        if (chosenIndex === undefined) continue 
        pathChosen = Object.values(atlasAll[atlasIndex].path)[chosenIndex]
        centerChosen = Object.values(atlasAll[atlasIndex].center)[chosenIndex]

        if (pathChosen === undefined) continue

        // console.log(123)

        atlas.push({
            ...atlasAll[atlasIndex],
            path: pathChosen,
            center: centerChosen,
        })
    }
    // console.log(atlas)

    dispatchTimeUpdateEvent(newPeriod, atlas)
    document.body.dataset.canvasLoading = false
}

function updateTooltip(newPeriod, newVariation) {
    var configObject = variationsConfig[newVariation].versions[newPeriod]
    if (typeof configObject.timestamp === "number") tooltip.querySelector('p').textContent = new Date(configObject.timestamp*1000).toUTCString()
    else tooltip.querySelector('p').textContent = configObject.timestamp
    tooltip.style.left = Math.max(((timelineSlider.offsetWidth)*(timelineSlider.value >= 1 ? timelineSlider.value - 1:0)/(timelineSlider.max-1)) - tooltip.offsetWidth/2, 0) + "px"
}

tooltip.parentElement.addEventListener('mouseenter', () => updateTooltip(parseInt(timelineSlider.value), currentVariation))

window.addEventListener('resize', () => updateTooltip(parseInt(timelineSlider.value), currentVariation))

function isOnPeriod(start, end, variation, currentPeriod, currentVariation) {
	return currentPeriod >= start && currentPeriod <= end && variation === currentVariation 
}

function parsePeriod(periodString) {
    // console.log(periodString)
    let variation = "default"
	periodString = periodString + ""
    if (periodString.split(':').length > 1) {
        let split = periodString.split(':')
        variation = codeReference[split[0]]
        periodString = split[1]
    }
	if (periodString.search('-') + 1) {
		var [start, end] = periodString.split('-').map(i => parseInt(i))
		return [start, end, variation]
	} else {
		let periodNew = parseInt(periodString)
		return [periodNew, periodNew, variation]
	}
}
