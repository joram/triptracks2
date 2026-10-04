import React, {useState, useEffect} from "react";
import {fromLonLat} from "ol/proj";
import "ol/ol.css";
import {RMap} from "rlayers";
import LayersControl from "./LayersControl";
import Trails, {viewBbox} from "./Trails";
import TrailClusters, {TRAILS_ZOOM} from "./TrailClusters";

function getWindowDimensions() {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height
  };
}

function useWindowDimensions() {
  const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowDimensions;
}

export default function Map() {
  const map = React.useRef();
  const center = fromLonLat([-124.594444, 49.223611]);
  const [zoom, setZoom] = useState(10);
  const [bbox, setBbox] = useState(null);
  const { height } = useWindowDimensions();

  function updateZoom(e){
      let z = e.map.getView().getZoom()
      if(z!==zoom){
          setZoom(z)
      }
  }

  function onChange(e){
      updateZoom(e)
      setBbox(viewBbox(e.map))
  }

  let polylineTrails = null;
  if(zoom >= TRAILS_ZOOM){
      polylineTrails = <Trails bbox={bbox} maxTrails={100} />
  }
  return (
    <React.Fragment>
      <RMap
        ref={map}
        width={"100%"}
        height={height-64+"px"}
        className="example-map"
        initial={{ center: center, zoom: 10 }}
        properties={{ label: "HillShading" }}
        onMoveEnd={onChange}
      >
        <LayersControl />
        <TrailClusters maxZoom={TRAILS_ZOOM} />
        {polylineTrails}
      </RMap>
    </React.Fragment>
  );
}