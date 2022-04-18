const pointIsInPolygon = require("../web/_js/pointInPolygon");
const fs = require("fs");

const startAtlas = require("../web/atlas.json");
const endAtlas = [];

const exmp = 
    { "id": "twwjzn", 
    "submitted_by": "MisterSora", 
    "name": "Pixel Art Sora", 
    "description": "sies", 
    "website": "", 
    "subreddit": "/r/KingdomHearts", 
    "center": [1264.5, 687.5], 
    "path": [[1242.5, 674.5], [1286.5, 674.5], [1286.5, 699.5], [1242.5, 699.5]] }

const exmp2 = {"id": "twwme0", "submitted_by": "Gnomboy", "name": "Ori (Ori and the blind Forest)", "description": "Ori, the protagonist of the Game Ori and the blind Forest and its sequal Ori and the Will of the Wisps.", "website": "", "subreddit": "", "center": [1395.5, 110.5], "path": [[1387.5, 101.5], [1395.5, 100.5], [1399.5, 98.5], [1400.5, 103.5], [1408.5, 107.5], [1409.5, 104.5], [1412.5, 109.5], [1412.5, 114.5], [1410.5, 119.5], [1405.5, 120.5], [1401.5, 119.5], [1397.5, 117.5], [1390.5, 117.5], [1383.5, 116.5], [1378.5, 114.5], [1377.5, 104.5], [1388.5, 100.5], [1395.5, 100.5]]};

const gme = {"id": "twn8k6", "submitted_by": "Trainzack", "name": "GME Stock Price Line", "description": "A line representing the price of the GME stock. The line exits its originating mural and weaves between multiple other murals. Note that the line has been traced here only so far as it unambiguously does not branch; multiple offshoots of the line continue beyond that point.", "website": "", "subreddit": "", "center": [1328.5, 308.5], "path": [[774.5, 782.5], [774.5, 784.5], [870.5, 784.5], [871.5, 783.5], [872.5, 778.5], [874.5, 779.5], [876.5, 783.5], [877.5, 784.5], [878.5, 783.5], [879.5, 780.5], [881.5, 778.5], [882.5, 780.5], [882.5, 784.5], [883.5, 784.5], [884.5, 782.5], [885.5, 781.5], [886.5, 779.5], [887.5, 780.5], [888.5, 782.5], [889.5, 784.5], [890.5, 782.5], [891.5, 780.5], [892.5, 778.5], [893.5, 780.5], [894.5, 781.5], [895.5, 782.5], [896.5, 784.5], [897.5, 782.5], [898.5, 780.5], [899.5, 779.5], [900.5, 781.5], [901.5, 783.5], [902.5, 784.5], [905.5, 784.5], [905.5, 619.5], [909.5, 619.5], [909.5, 514.5], [956.5, 514.5], [956.5, 497.5], [964.5, 497.5], [964.5, 364.5], [1046.5, 364.5], [1098.5, 312.5], [1394.5, 312.5], [1394.5, 277.5], [1411.5, 247.5], [1440.5, 247.5], [1440.5, 240.5], [1458.5, 240.5], [1458.5, 205.5], [1514.5, 205.5], [1514.5, 204.5], [1522.5, 204.5], [1522.5, 114.5], [1527.5, 109.5], [1528.5, 107.5], [1529.5, 105.5], [1530.5, 103.5], [1531.5, 101.5], [1532.5, 99.5], [1537.5, 90.5], [1537.5, 64.5], [1562.5, 64.5], [1562.5, 37.5], [1597.5, 2.5], [1971.5, 2.5], [1998.5, 33.5], [1998.5, 80.5], [1971.5, 80.5], [1971.5, 99.5], [1953.5, 99.5], [1953.5, 118.5], [1951.5, 118.5], [1951.5, 119.5], [1952.5, 119.5], [1952.5, 132.5], [1953.5, 133.5], [1953.5, 159.5], [1947.5, 159.5], [1947.5, 173.5], [1940.5, 173.5], [1940.5, 174.5], [1939.5, 174.5], [1939.5, 238.5], [1941.5, 238.5], [1941.5, 175.5], [1949.5, 175.5], [1949.5, 161.5], [1955.5, 161.5], [1955.5, 131.5], [1953.5, 131.5], [1953.5, 119.5], [1955.5, 119.5], [1955.5, 101.5], [1973.5, 101.5], [1973.5, 82.5], [1999.5, 82.5], [1999.5, 28.5], [1974.5, 0.5], [1596.5, 0.5], [1559.5, 37.5], [1559.5, 61.5], [1534.5, 61.5], [1534.5, 89.5], [1525.5, 106.5], [1519.5, 110.5], [1519.5, 202.5], [1455.5, 202.5], [1455.5, 237.5], [1437.5, 237.5], [1437.5, 244.5], [1409.5, 244.5], [1391.5, 276.5], [1391.5, 309.5], [1096.5, 309.5], [1043.5, 361.5], [961.5, 361.5], [961.5, 494.5], [953.5, 494.5], [953.5, 511.5], [906.5, 511.5], [906.5, 616.5], [902.5, 616.5], [902.5, 781.5], [901.5, 778.5], [899.5, 774.5], [896.5, 780.5], [892.5, 774.5], [889.5, 780.5], [886.5, 776.5], [884.5, 779.5], [882.5, 776.5], [881.5, 773.5], [880.5, 776.5], [878.5, 778.5], [877.5, 781.5], [875.5, 777.5], [874.5, 774.5], [873.5, 776.5], [872.5, 773.5], [869.5, 782.5], [774.5, 782.5]]};
const dutch = {"id": "twpp5k", "submitted_by": "De_Nielsch", "name": "right side dutch region", "description": "the right side of the dutch region filled with more iconic images of the netherlands", "website": "", "subreddit": "r/placeNL", "center": [1552.5, 17.5], "path": [[1105.5, 0.5], [1999.5, 0.5], [1999.5, 35.5], [1148.5, 34.5], [1145.5, 37.5], [1133.5, 37.5], [1130.5, 39.5], [1118.5, 39.5], [1118.5, 37.5], [1115.5, 35.5], [1113.5, 35.5], [1113.5, 34.5], [1104.5, 34.5], [1104.5, 0.5], [1103.5, 0.5], [1103.5, 34.5], [1103.5, 0.5]]};


function main() {
    for (submission_key in startAtlas) {
        let submission = startAtlas[submission_key];
        let polygon = submission.path;
        let bounds = getBoundingBox(polygon);
        let parent;

        for (submission_key2 in endAtlas) {
            let sub2 = endAtlas[submission_key2];

            if( !sub2.parent && doBoundsCollide( sub2.bounds, bounds ) ) {
                let intersected = intersectPolygons(sub2.path, polygon);
                let insec_area = polygon_area(intersected);
                let outer_area = polygon_area(sub2.path) + polygon_area(polygon) - (2*insec_area);

                if( outer_area / insec_area < 0.01 ) {
                    // duplicate 
                    console.log(`DUPLICATE [${sub2.id}]<${sub2.name}> - [${submission.id}]<${submission.name}>`);
                    parent = sub2.id;
                    if(!sub2.children) sub2.children = [];
                    sub2.children.push(submission.id);
                    break;
                }
            }
        }

        let output = {
            ...submission,
            bounds
        };
        if(parent) output.parent = parent;
        endAtlas.push( output )

        //console.log(submission.id)
    }

    let json = "[\n";
    for (let i = 0; i<endAtlas.length; i++) {
        json += JSON.stringify(endAtlas[i]);
        if(i !== endAtlas.length-1) json += ",";
        json += "\n";
    }
    json+="]";

    fs.writeFileSync("./web/atlasFlaggedDuplicates.json", json);
}
//main();

function scanSelfISecs() {
    for (submission_key in startAtlas) {
        let submission = startAtlas[submission_key];
        let polygon = submission.path;

        if( isPolygonSelfIntersecting(polygon) ) {
            console.log("SELF_INTERSECTING ["+submission.id+ "] - "+submission.name);
        }
    }
}
scanSelfISecs();

function getBoundingBox(path) {
    let minX = -1, maxX= -1, minY= -1, maxY= -1;

    path.forEach((coord) => {
        if(coord[0] < minX || minX==-1) minX = coord[0]; //minX
        if(coord[1] < minY || minY==-1) minY = coord[1]; //minY
        if(coord[0] > maxX || maxX==-1) maxX = coord[0]; //maxX
        if(coord[1] > maxY || maxY==-1) maxY = coord[1]; //maxY
    })
    //console.log( minX, minY, maxX, maxY )

    return [minX, minY, maxX-minX, maxY-minY];
}

function doBoundsCollide(bound1, bound2) {
    let [x1, y1, w1, h1] = bound1;
    let [x2, y2, w2, h2] = bound2;

    let dx= x2-x1;
    let dy = y2-y1;

    return (
        (dx<=w1 && dx>=-w2) &&
        (dy<=h1 && dy>=-h2)
    )

}

function isPolygonSelfIntersecting(poly) {
    // intersect every linesegment of poly1 with every linesegment of poly2
    for (let j=0; j<poly.length; j++)
    {
        let jnext = (j + 1 === poly.length) ? 0 : j + 1;

        for (let i=j; i<poly.length; i++)
        {
            let inext = (i + 1 === poly.length) ? 0 : i + 1;
            //console.log("inte")
            //console.log(j, jnext, i, inext)
            // if polyA[i] is not inside, but polyA[inext], is, entering

            let ip = GetIntersectionPoint( poly[j], poly[jnext], poly[i], poly[inext]);
            if (ip != null && !pointEquality( ip, poly[j] ) && !pointEquality( ip, poly[jnext] ) && !pointEquality( ip, poly[i] ) && !pointEquality( ip, poly[inext] ) ) {
                return true
            };
        }
    }
    return false
}

function intersectPolygons(polyA, polyB) {
    let a_in_b = [];
    let b_in_a =  [];

    let line_isecs = [];
    let entering_isecs = [];
    let exiting_isecs = [];

    let subdiv_a = [];
    let subdiv_b = [];

    const newp = [];
    // Add points of one polygon, that are within the other, to the intersect polygon
    for (i in polyA) 
        if( pointIsInPolygon( polyA[i], polyB) ) polygonAdd( a_in_b, polyA[i] );
    for (i in polyB) 
        if( pointIsInPolygon( polyB[i], polyA) ) polygonAdd( b_in_a, polyB[i] );
    
    // intersect every linesegment of poly1 with every linesegment of poly2
    for (let j=0; j<polyB.length; j++)
    {
        let jnext = (j + 1 === polyB.length) ? 0 : j + 1;
        for (let i=0; i<polyA.length; i++)
        {
            let inext = (i + 1 === polyA.length) ? 0 : i + 1;
            //console.log(j, jnext, i, inext)
            // if polyA[i] is not inside, but polyA[inext], is, entering

            let ip = GetIntersectionPoint( polyB[j], polyB[jnext], polyA[i], polyA[inext]);
            if (ip != null) {
                polygonAdd( line_isecs, ip)
            };
        }
    }

    // concave sorting part
    // Subdivide polygons 
    for (let i = 0; i< polyA.length; i++) {
        subdiv_a.push( polyA[i] );
        let inext = (i + 1 === polyA.length) ? 0 : i + 1;   
        let candidates = pointsOnLine( line_isecs.filter((v) => !polygonHas(polyA, v)), polyA[i], polyA[inext])
        subdiv_a = subdiv_a.concat(candidates);
    }

    for (let i = 0; i< polyB.length; i++) {
        subdiv_b.push( polyB[i] );
        let inext = (i + 1 === polyB.length) ? 0 : i + 1;   
        let candidates = pointsOnLine( line_isecs.filter((v) => !polygonHas(polyB, v)), polyB[i], polyB[inext])
        subdiv_b = subdiv_b.concat(candidates);
    }

    // classify intersection as entering or exiting
    for (let i = 0; i < subdiv_a.length; i++) {
        let inext = (i + 1 === subdiv_a.length) ? 0 : i + 1;  


        i
    }

    subdiv_a = subdiv_a.filter( (val) => polygonHas( a_in_b, val) || polygonHas(line_isecs, val ) );
    subdiv_b = subdiv_b.filter( (val) => polygonHas( b_in_a, val) || polygonHas(line_isecs, val ) );
    console.log("a_in_b", a_in_b, "\nb_in_a", b_in_a, "\nline_isecs", line_isecs, "\nentering", entering_isecs, "\nexiting", exiting_isecs,"\nsubdiv_a", subdiv_a,"\nsubdiv_b",  subdiv_b);

    let unvisited = [...line_isecs];
    let clipped_polygons = [];

    while ( unvisited.length>0 ) {
        // Merge final arrays
        let active = subdiv_a;
        let other = subdiv_b;
        let entrypoint = subdiv_a.find( (e) => polygonHas(unvisited, e) );
        polygonRemove( unvisited, entrypoint)
        
        let result = [ entrypoint ];
        let idx = ( polygonIndexOf( subdiv_a, entrypoint ) +1 ) % subdiv_a.length;
        let currentpoint = active[idx];
        
        while ( !pointEquality( entrypoint, currentpoint ) ) {
            //console.log( a_outside, idx, active[idx] );
            result.push( currentpoint );

            if( polygonHas( line_isecs, currentpoint  ) ) {
                idx = polygonIndexOf ( other, currentpoint );
                polygonRemove(unvisited, currentpoint);
                let temp = active;  
                active = other;
                other = temp;
            }

            idx = (idx + 1) % active.length;
            currentpoint = active[idx];
        } 
        console.log( `Result ${entrypoint}:`, result );
        clipped_polygons.push(result);
    }
    return clipped_polygons;
}


function polygonAdd(polygon, point) {
    //console.log("addpoint", point)
    let sameElement = polygon.find(( opoint ) => pointEquality(point, opoint));
    if( typeof sameElement === "undefined") {
        polygon.push(point)
    }
}
function polygonHas(polygon, point) {
    let sameElement = polygon.find(( opoint ) => pointEquality(point, opoint));
    return typeof sameElement !== "undefined"
}
function polygonRemove(polygon, point) {
    let elem = polygon.findIndex( e => pointEquality(e, point) )

    if ( elem !== -1)
        polygon.splice( elem, 1 )
}
function polygonIndexOf(polygon, point) {
    let sameElement = polygon.findIndex(( opoint ) => pointEquality(point, opoint));
    return sameElement;
}
function pointEquality(point, opoint) {
    return approxeq( point[0], opoint[0]) && approxeq( point[1], opoint[1])
}

//math logic from http://www.wyrmtale.com/blog/2013/115/2d-line-intersection-in-c
function GetIntersectionPoint( l1p1,  l1p2,  l2p1,  l2p2)
{
    let A1 = l1p2[1] - l1p1[1];
    let B1 = l1p1[0] - l1p2[0];
    let C1 = A1 * l1p1[0] + B1 * l1p1[1];
    let A2 = l2p2[1] - l2p1[1];
    let B2 = l2p1[0] - l2p2[0];
    let C2 = A2 * l2p1[0] + B2 * l2p1[1];
    //lines are parallel
    let det = A1 * B2 - A2 * B1;
    if ( det == 0)
    {
        //console.log("parrallel")
        return null; //parallel lines
    }
    else
    {
        let x = (B2 * C1 - B1 * C2) / det;
        let y = (A1 * C2 - A2 * C1) / det;
        //console.log("not parallel", x, y)

        let online1 = ((Math.min(l1p1[0], l1p2[0]) < x || approxeq(Math.min(l1p1[0], l1p2[0]), x))
            && (Math.max(l1p1[0], l1p2[0]) > x || approxeq(Math.max(l1p1[0], l1p2[0]), x))
            && (Math.min(l1p1[1], l1p2[1]) < y || approxeq(Math.min(l1p1[1], l1p2[1]), y))
            && (Math.max(l1p1[1], l1p2[1]) > y || approxeq(Math.max(l1p1[1], l1p2[1]), y))
            );
        let online2 = ((Math.min(l2p1[0], l2p2[0]) < x || approxeq(Math.min(l2p1[0], l2p2[0]), x))
            && (Math.max(l2p1[0], l2p2[0]) > x || approxeq(Math.max(l2p1[0], l2p2[0]), x))
            && (Math.min(l2p1[1], l2p2[1]) < y || approxeq(Math.min(l2p1[1], l2p2[1]), y))
            && (Math.max(l2p1[1], l2p2[1]) > y || approxeq(Math.max(l2p1[1], l2p2[1]), y))
            );
        if (online1 && online2)
            return [x, y];
    }
    return null; //intersection is at out of at least one segment.
}

function pointsOnLine(points, l1, l2) {
    let m = ( l1[1] - l2[1]  ) / ( l1[0] - l2[0]  ); // (dx / dy)
    let b = ( l1[1] - (m* l1[0])  ) // y-mx = b
    //console.log("p1", l1, "p2", l2, "m", m, "b", b);
    
    let candidates = [];
    for (let j=0; j<points.length; j++) {
        let oninfiniteline = (approxeq( points[j][1] , m * points[j][0] + b ) ||  //y = mx+b
        (!Number.isFinite(m) && approxeq( points[j][0], l1[0] ))); // when line is vertical

        //console.log( points[j][1] , m * points[j][0] + b, oninfiniteline);

        if(
            oninfiniteline 
            && ( points[j][0] <= Math.max(l1[0], l2[0]) )
            && ( points[j][0] >= Math.min(l1[0], l2[0]) )
            && ( points[j][1] <= Math.max(l1[1], l2[1]) )
            && ( points[j][1] >= Math.min(l1[1], l2[1]) )
        ) {
            polygonAdd( candidates, points[j] );
        }
    }

    return candidates.sort( (a, b) => { 
        let e = ( Math.pow(a[0] - l1[0], 2) + Math.pow(a[1] - l1[1], 2) ) - 
                ( Math.pow(b[0] - l1[0], 2) + Math.pow(b[1] - l1[1], 2) );
        
        //console.log(a, b, e);
        return e;
    });
}

function approxeq  (v1, v2, epsilon = 0.00001) {
    return Math.abs(v1 - v2) < epsilon;
};


function orderClockwise( points ) {
    let mX = 0;
    let my = 0;
    for (let p; p<points.length; p++)
    {
        mX += points[p][0];
        my += points[p][1];
    }
    mX /= points.length;
    my /= points.length;
    return points.sort(v => Math.atan2(v[1] - my, v[0] - mX));
}

function polygon_area(vertices){
    let psum = 0;
    let nsum = 0;

    for (let i=0; i< vertices.length; i++){
        sindex = (i + 1) % vertices.length;
        prod = vertices[i][0] * vertices[sindex][1]
        psum += prod
    }
    for (let i=0; i< vertices.length; i++) {
        sindex = (i + 1) % vertices.length;
        prod = vertices[sindex][0] * vertices[i][1]
        nsum += prod
    }
    return Math.abs(1/2*(psum - nsum))
}

function svgFromPolygonArray(polygons) {
    let out = `<html><body>
    <img style="position:absolute;z-index:1;" width="2000" src="https://place-atlas.stefanocoding.me/_img/place-indexed.png"/>
    <svg style="position:absolute;z-index:2;" viewBox="0 0 2000 2000" width="2000" xmlns="http://www.w3.org/2000/svg">`

    for (let j =0; j<polygons.length; j++) {
        let polygon = polygons[j];
        let list = "";
        list += `M${polygon[0][0]} ${polygon[0][1]}`

        for (let i =0; i<polygon.length; i++) {
            out += `<circle cx="${polygon[i][0]}" cy="${polygon[i][1]}" r="2" fill="red"/>`
        }

        for (let i =0; i<polygon.length; i++) {
            list += `L${polygon[i][0]} ${polygon[i][1]}`
        }

        list += `L${polygon[0][0]} ${polygon[0][1]}`
        out+= `<path d="${list}" stroke="black" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" fill="#00000094"/>`;
    }

    out += "</svg></body></html>"
    fs.writeFileSync("./Polydebug.html", out);
    return out;
}
function svgFromPointArray(points1 = [], points2 = [], points3 = [], points4 = [], points5=[]) {
    let out = `<html><body>
    <img style="position:absolute;z-index:1;" width="2000" src="https://place-atlas.stefanocoding.me/_img/place-indexed.png"/>
    <svg style="position:absolute;z-index:2;" viewBox="0 0 2000 2000" width="2000" xmlns="http://www.w3.org/2000/svg">`


    for (let i =0; i<points1.length; i++) {
        out += `<circle cx="${points1[i][0]}" cy="${points1[i][1]}" r="2" fill="red"/>`
    }
    for (let i =0; i<points2.length; i++) {
        out += `<circle cx="${points2[i][0]}" cy="${points2[i][1]}" r="2" fill="blue"/>`
    }
    for (let i =0; i<points3.length; i++) {
        out += `<circle cx="${points3[i][0]}" cy="${points3[i][1]}" r="2" fill="green"/>`
    }
    for (let i =0; i<points4.length; i++) {
        out += `<circle cx="${points4[i][0]}" cy="${points4[i][1]}" r="2" fill="yellow"/>`
    }
    for (let i =0; i<points5.length; i++) {
        out += `<circle cx="${points5[i][0]}" cy="${points5[i][1]}" r="2" fill="pink"/>`
    }


    out+= `</svg></body></html>`;
    fs.writeFileSync("./Polydebug.html", out);

    return out;
}

/* // Convex Test
let tri = [[0,0], [5,5], [0,5]];
let slab =  [[0, 2.5], [5, 2.5], [5, 5], [0,5]];

console.log(polygon_area(tri));
console.log(polygon_area(slab)); 
let isec = intersectPolygons( tri,slab);
console.log( isec )
console.log( polygon_area( isec) )
*/

// Concave Test
let A = [[1,0],[2,0],[2,2],[4,2],[4,4],[1,4]];
let B = [[0,1],[3,1],[3,3],[0,3]];
// expected output: [ [ 1, 1 ], [ 2, 1 ], [ 2, 2 ], [ 3, 2 ], [ 3, 3 ], [ 1, 3 ] ]

let A2 = [[0,1], [6,1], [3,2], [1,3], [3,4], [3,5], [0,5]];
let B2 = [ [2,0], [6,0], [6,6], [2,6] ];

//intersectPolygons(B2, A2);
//svgFromPolygonArray( intersectPolygons( dutch.path, gme.path) );
/*
console.log( doBoundsCollide( [ 0, 0, 2, 2 ], [1, 1, 2, 2] )  )
console.log( doBoundsCollide( [ 0, 0, 2, 2 ], [-1, -1, 2, 2] ))
console.log( doBoundsCollide( [ 0, 0, 2, 2 ], [2.01, 0, 2, 2] ))
console.log( doBoundsCollide( [ 0, 0, 2, 2 ], [0, 2.01, 2, 2] ))
console.log( doBoundsCollide( [ 0, 0, 2, 2 ], [0, -2.01, 2, 2] ))*/