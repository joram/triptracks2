import React, {Component} from "react";
import {GoogleMap, withGoogleMap, withScriptjs,} from "react-google-maps";
import Geohash from 'latlon-geohash';
import Trail from "./Trail";
import trailHeatmap from "./trails.heatmap";
import MarkerClusterer from "react-google-maps/lib/components/addons/MarkerClusterer";
import Marker from "react-google-maps/lib/components/Marker";


function longestCommonPrefix(strs) {
    if (!strs)
        return '';

    let smallest = strs.reduce( (min, str) => min < str ? min : str, strs[0] );
    let largest  = strs.reduce( (min, str) => min > str ? min : str, strs[0] );

    for (let i=0; i<smallest.length; i++) {
        if (smallest[i] !== largest[i])
            return smallest.substr(0,i);
    }

    return '';
};

let trails = {};

class Trails extends Component {

    constructor(props) {
        super(props);
        this.state = {
            error: null,
            isLoaded: false,
            manifest: {},
            zoom: 14,
            geohash: "c0z2hbbdwnhp76j",
            center: {
                lat: 49.22333244,
                lng: -124.59499762,
            }
        };
    }

    componentDidMount() {

        fetch("/trails.manifest.json").then(res => res.json()).then((result) => {
            let state = this.state;
            state.isLoaded = true
            state.manifest = result
            this.setState(state);
        })
    }

    onIdle() {
        this.updateGeohash()
        if(window.map !== null && window.map !== undefined){
            let state = this.state
            state.zoom = window.map.getZoom()
            this.setState(state)
        }
        console.log(this.state.geohash, this.state.zoom)
    }

    updateGeohash(){
        let ne = window.map.getBounds().getNorthEast();
        let sw = window.map.getBounds().getSouthWest();
        let ne_geohash = Geohash.encode(ne.lat(), ne.lng());
        let sw_geohash = Geohash.encode(sw.lat(), sw.lng());
        let geohash = longestCommonPrefix([ne_geohash, sw_geohash])

        if(this.state.geohash === geohash){
            return
        }

        let state = this.state
        state.geohash = geohash
        this.setState(state)
    }

    getTrails(limit=1024){

        // get node
        let basePrefix = "trails";
        let node = this.state.manifest;
        for (var i = 0; i < this.state.geohash.length; i++) {
            let c = this.state.geohash.charAt(i)
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

        let content;
        if(this.state.zoom > 10) {
            this.getTrails().forEach(filepath => {
                trails[filepath] = <Trail visibleZoom={10} filepath={filepath} key={filepath}/>;
            })
            content = Object.values(trails)
        } else {
            let trailMarkers = [];
            let i = 0;
            trailHeatmap(window.google.maps).forEach(point => {
                trailMarkers.push(<Marker position={point} key={`trail_${i}`}/>)
                i += 1
            })
            content = <MarkerClusterer>{ trailMarkers }</MarkerClusterer>
            Object.values(trails).forEach( (trail) => {
                trail.hide()
            })
        }

        return <GoogleMap
            defaultZoom={14}
            defaultCenter={this.state.center}
            mapTypeId={'terrain'}
            ref={map => { window.map = map }}
            onIdle={this.onIdle.bind(this)}
        >
            {content}
        </GoogleMap>
    }
}


export default withScriptjs(withGoogleMap(Trails));