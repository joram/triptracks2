import * as React from "react";
import {useEffect, useMemo, useRef, useState} from "react";
import {RMap, RLayerVector} from "rlayers";
import GeoJSON from "ol/format/GeoJSON";
import LayersControl from "../../trails/LayersControl";
import {TrailStyle} from "../../trails/Trails";
import {fromLonLat} from "ol/proj";
import {getTrail, getTrailGeojson} from "../../../utils/api";

function MapBox({geojson, lat, lng}) {
    const mapRef = useRef();
    const features = useMemo(
        () => geojson ? new GeoJSON({featureProjection: "EPSG:3857"}).readFeatures(geojson) : [],
        [geojson]
    );

    return (
        <React.Fragment>
            <RMap
                ref={mapRef}
                width={"100%"}
                height={250+"px"}
                className="example-map"
                initial={{
                    center: fromLonLat([lng,lat]),
                    zoom: 10
                }}
                properties={{ label: "HillShading" }}
                // onMoveEnd={onChange}
            >
                <LayersControl />
                {features.length > 0 && <RLayerVector zIndex={5} features={features}>
                    <TrailStyle width={4}/>
                </RLayerVector>}
            </RMap>
        </React.Fragment>
    );
}
function PlanTrail({geohash}){
    let [loading, setLoading] = useState(true)
    let [details, setDetails] = useState(null)
    let [trail, setTrail] = useState(null)

    useEffect(() => {
        // Trails without a usable line still have details, so the geometry is optional.
        Promise.all([getTrail(geohash), getTrailGeojson(geohash).catch(() => null)])
            .then(([newDetails, newTrail]) => {
                setDetails(newDetails)
                setTrail(newTrail)
                setLoading(false)
            })
            .catch((error) => console.error(error))
    }, [geohash]);

    if(loading){
        return <></>
    }

    return <MapBox geojson={trail} lat={details.center_lat} lng={details.center_lng}/>
}

function PlanTrails({ trails }) {
    let trailComponents = trails.map((trail, index) => {
        return <PlanTrail key={index+trail} geohash={trail}/>
    })
  return (
    <>
      {/*<TrailSearch/>*/}
        {trailComponents}
    </>
  )
}

export default PlanTrails