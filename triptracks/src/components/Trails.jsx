import GeoJSON from "ol/format/GeoJSON";
import {RLayerVector, RStyle} from "rlayers";
import {Component} from "react";

class Trail extends Component {
    render() {
        return <RLayerVector
            zIndex={5}
            format={new GeoJSON({featureProjection: "EPSG:3857"})}
            url={this.props.url}
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


    getTrails(limit=1024){

        // get node
        let basePrefix = "trails";
        let node = this.state.manifest;
        for (var i = 0; i < this.props.viewGeohash.length; i++) {
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
        let trails = []
        let filenames = this.getTrails()
        console.log(filenames)

        filenames.forEach(filename => {
            if(trails.length >= this.props.maxTrails){
                return
            }
            trails.push(<Trail key={filename} url={filename}/>)
        })
        return trails
    }
}

export default Trails