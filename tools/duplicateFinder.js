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


function main() {
    for (submission_key in startAtlas) {
        let submission = startAtlas[submission_key];
        let polygon = orderClockwise(submission.path);
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
                    console.log(`DUPLICATE [${submission.id}]<${sub2.name}> - [${submission.id}]<${submission.name}>`);
                    parent = sub2.id;
                    if(!sub2.children) sub2.children = [];
                    sub2.children.push(submission.id);
                    break;
                }
            }
        }

        let output = {
            ...submission,
            bounds, child: 0
        };
        if(parent) output.parent = parent;
        endAtlas.push( output )

        //console.log(submission.id)
    }

    fs.writeFileSync("./web/atlasFlaggedDuplicates.json", JSON.stringify(endAtlas));
}
main();

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

function intersectPolygons(poly1, poly2) {
    const newp = [];
    // Add points of one polygon, that are within the other, to the intersect polygon
    for (i in poly1) 
        if( pointIsInPolygon( poly1[i], poly2) ) polygonAdd( newp, poly1[i] );
    for (i in poly2) 
        if( pointIsInPolygon( poly2[i], poly1) ) polygonAdd( newp, poly2[i] );
    
    // intersect every linesegment of poly1 with every linesegment of poly2
    for (let j=0; j<poly2.length; j++)
    {
        let jnext = (j + 1 === poly2.length) ? 0 : j + 1;
        for (let i=0; i<poly1.length; i++)
        {
            let inext = (i + 1 === poly1.length) ? 0 : i + 1;
            //console.log(j, jnext, i, inext)
            let ip = GetIntersectionPoint( poly2[j], poly2[jnext], poly1[i], poly1[inext]);
            if (ip != null) polygonAdd( newp, ip);
        }
    }

    return orderClockwise(newp);
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

function approxeq  (v1, v2, epsilon = 0.0000001) {
    return Math.abs(v1 - v2) < epsilon;
};

function polygonAdd(polygon, point) {
    //console.log("addpoint", point)
    let sameElement = polygon.find(( opoint ) => approxeq( point[0], opoint[0]) && approxeq( point[1], opoint[1]));
    if( typeof sameElement === "undefined") {
        polygon.push(point)
    }
}

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

/*
let tri = [[0,0], [5,5], [0,5]];
let slab =  [[0, 2.5], [5, 2.5], [5, 5], [0,5]];

console.log(polygon_area(tri));
console.log(polygon_area(slab)); 
let isec = intersectPolygons( tri,slab);
console.log( isec )
console.log( polygon_area( isec) )
*/
/*
console.log( doBoundsCollide( [ 0, 0, 2, 2 ], [1, 1, 2, 2] )  )
console.log( doBoundsCollide( [ 0, 0, 2, 2 ], [-1, -1, 2, 2] ))
console.log( doBoundsCollide( [ 0, 0, 2, 2 ], [2.01, 0, 2, 2] ))
console.log( doBoundsCollide( [ 0, 0, 2, 2 ], [0, 2.01, 2, 2] ))
console.log( doBoundsCollide( [ 0, 0, 2, 2 ], [0, -2.01, 2, 2] ))*/