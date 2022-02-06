import GeoJSON from "ol/format/GeoJSON";
import {RLayerVector, RStyle} from "rlayers";
import {Component} from "react";
import {Redirect} from "react-router-dom";

let redirectTo = null


async function getData(url){
    console.log("getting cached ", url)
    return fetch(url).then(response => {return response.text()})
}

class Trail extends Component {

    state = {features: null}
    getFeatures(){
        getData(this.props.url).then(jsonDataString => {
            let features = new GeoJSON({featureProjection: "EPSG:3857"}).readFeatures(jsonDataString)
            let state = this.state
            state.features = features
            this.setState(state)
        })
        return this.state.features
    }

    onClick(e){
        e.stopPropagation()
        redirectTo = this.props.geohash
    }
    render() {
        return <RLayerVector
            zIndex={5}
            format={new GeoJSON({featureProjection: "EPSG:3857"})}
            features={this.getFeatures()}
            onClick={this.onClick.bind(this)}
        >
            <RStyle.RStyle>
                <RStyle.RStroke color="green" width={3}/>
            </RStyle.RStyle>
        </RLayerVector>
    }
}

class Trails extends Component {
    state = {
        manifest: {}
    }

    componentDidMount() {
        fetch("/trails.manifest.json")
        .then(response => response.json())
        .then((jsonData) => {
            let state = this.state
            state.manifest = jsonData
            this.setState(state)

        }).catch((error) => {
            console.error(error)
        })
    }


    getTrails(limit=1){

        // get node
        let basePrefix = "trails";
        let node = this.state.manifest;
        for (let i = 0; i < this.props.viewGeohash.length; i++) {
            let c = this.props.viewGeohash.charAt(i)
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

    render() {
        if(redirectTo !== null){
            return <Redirect to={`/trail/${redirectTo}`} />
        }
        let trails = {}
        let filenames = this.getTrails()

        filenames.forEach(filename => {
            if(trails[filename] !== undefined || trails.length >= this.props.maxTrails){
                return
            }
            let geohash = filename.replace("trails/", "").replace(".geojson", "")
            trails[filename] = (<Trail key={filename} url={filename} geohash={geohash} />)
        })
        return Object.values(trails)
    }
}

export default Trails