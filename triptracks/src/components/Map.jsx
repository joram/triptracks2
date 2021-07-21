import React, {useState} from "react";
import {fromLonLat, transformExtent} from "ol/proj";
import "ol/ol.css";
import {RMap} from "rlayers";
import LayersControl from "./LayersControl";
import Trails from "./Trails";
import ClusteredTrails from "./ClusteredTrails";
import Geohash from 'latlon-geohash';

function longestCommonPrefix(strs) {
    if (!strs)
        return ''

    let smallest = strs.reduce( (min, str) => min < str ? min : str, strs[0] )
    let largest  = strs.reduce( (min, str) => min > str ? min : str, strs[0] )

    for (let i=0; i<smallest.length; i++) {
        if (smallest[i] !== largest[i])
            return smallest.substr(0,i)
    }

    return ''
}

export default function Map() {
  const map = React.useRef();
  const center = fromLonLat([-124.594444, 49.223611]);
  const [zoom, setZoom] = useState(10);
  const [viewGeohash, setViewGeohash] = useState("c2");

  function updateZoom(e){
      let z = e.map.getView().getZoom()
      if(z!==zoom){
          setZoom(z)
      }
  }

  function updateViewGeohash(e){
      let extent = e.map.getView().calculateExtent(e.map.getSize());
      let bounds = transformExtent(extent, 'EPSG:3857', 'EPSG:4326')
      let geohash1 = Geohash.encode(bounds[1], bounds[0])
      let geohash2 = Geohash.encode(bounds[3], bounds[2])
      let match = longestCommonPrefix([geohash1, geohash2])
      if(match !== viewGeohash){
        setViewGeohash(match)
      }
  }

  function onChange(e){
      updateZoom(e)
      updateViewGeohash(e)
  }

  let content = <ClusteredTrails />
  if(zoom >= 10){
      content = <Trails viewGeohash={viewGeohash} maxTrails={100} />
  }
  return (
    <React.Fragment>
      <RMap
        ref={map}
        width={"100%"} height={"60vh"}
        className="example-map"
        initial={{ center: center, zoom: 10 }}
        properties={{ label: "HillShading" }}
        onMoveEnd={onChange}
      >
        <LayersControl />
        {content}
      </RMap>
    </React.Fragment>
  );
}