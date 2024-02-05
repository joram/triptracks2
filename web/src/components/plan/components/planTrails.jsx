import * as React from "react";
import {useEffect, useRef, useState} from "react";
import {RMap} from "rlayers";
import LayersControl from "../../trails/LayersControl";
import Trails from "../../trails/Trails";
import {fromLonLat} from "ol/proj";

function MapBox({geojson, lat, lng, geohash}) {
    const mapRef = useRef();

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
                <Trails viewGeohash={geohash} maxTrails={10} />
            </RMap>
        </React.Fragment>
    );
}
function PlanTrail({geohash}){
    let [loading, setLoading] = useState(true)
    let [details, setDetails] = useState(null)
    let [trail, setTrail] = useState(null)

    useEffect(() => {
        fetch(`/trail_details/${geohash}.json`).then(results => results.json()).then(newDetails => {
            setDetails(newDetails)
            console.log(newDetails)
            fetch(`/trails/${geohash}.geojson`).then(results => results.json()).then(newTrail => {
                console.log(newTrail)
                setTrail(newTrail)
                setLoading(false)
            });
        })
    }, [geohash]);

    if(loading){
        return <></>
    }

    return <MapBox geojson={trail} lat={details.center_lat} lng={details.center_lng} geohash={details.geohash}/>
}

function PlanTrails({ trails, setTrails }) {
  console.log("PlanTrails", trails)

  return (
    <>
      {/*<TrailSearch/>*/}
        {trails.map(trail => {
            return <PlanTrail key={trail} geohash={trail}/>
        })}
    </>
  )
}

export default PlanTrails