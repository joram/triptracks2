import GeoJSON from "ol/format/GeoJSON";
import {RLayerVector, RStyle} from "rlayers";
import React, {useEffect} from "react";
import {Redirect} from "react-router-dom";

let redirectTo = null


async function getData(url){
    return fetch(url).then(response => {return response.text()})
}

function Trail({geohash, url}){
    let [features, setFeatures] = React.useState(null)

    useEffect(() => {
        getData(url).then(jsonDataString => {
            let features = new GeoJSON({featureProjection: "EPSG:3857"}).readFeatures(jsonDataString)
            setFeatures(features)
        })
    }, [url]);

    function onClick(e){
        e.stopPropagation()
        redirectTo = geohash
    }

    if(features===null){
        return null
    }

    return <RLayerVector
        zIndex={5}
        format={new GeoJSON({featureProjection: "EPSG:3857"})}
        features={features}
        onClick={onClick.bind(this)}
    >
        <RStyle.RStyle>
            <RStyle.RStroke color="green" width={3}/>
        </RStyle.RStyle>
    </RLayerVector>
}

function Trails({viewGeohash, maxTrails}){
    let [manifest, setManifest] = React.useState(null)

    useEffect(() => {
        fetch("/trails.manifest.json")
        .then(response => response.json())
        .then((jsonData) => {
            setManifest(jsonData)
        }).catch((error) => {
            console.error(error)
        })
    }, []);


    function getTrails(limit=1){
        if(manifest===null){
            return []
        }

        // get node
        let basePrefix = "trails";
        let node = manifest;
        for (let i = 0; i < viewGeohash.length; i++) {
            let c = viewGeohash.charAt(i)
            node = node[c]
            basePrefix = basePrefix+"/"+c;
            if(node===undefined){
                return []
            }
        }

        function recursive_get_trails(node, prefix) {
            let trails = [];
            if (node.items !== undefined) {
                node.items.forEach(filename => {
                    trails.push(`trails/${filename}`)
                })
            }
            Object.keys(node).forEach(c => {
                if(c!=="items"){
                    let childTrails = recursive_get_trails(node[c], `${prefix}/${c}`)
                    trails = trails.concat(childTrails)
                }
            })
            return trails
        }

        let trails = recursive_get_trails(node, basePrefix)
        if(trails.length>limit){
            return trails.slice(0, limit)
        }
        return trails
    }

    if(redirectTo !== null){
        return <Redirect to={`/trail/${redirectTo}`} />
    }
    let trails = {}
    let filenames = getTrails(maxTrails)


    filenames.map((filename, i) => {
        if(trails[filename] !== undefined || trails.length >= maxTrails){
            return
        }
        let geohash = filename.replace("trails/", "").replace(".geojson", "")
        trails[filename] = (<Trail key={filename+"_"+i} url={"/"+filename} geohash={geohash} />)
    })
    return Object.values(trails)
}

export default Trails