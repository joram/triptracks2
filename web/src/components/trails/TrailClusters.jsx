import React, {useCallback, useEffect, useRef} from "react";
import GeoJSON from "ol/format/GeoJSON";
import {createEmpty, extend, getCenter, getHeight, getWidth} from "ol/extent";
import "ol/ol.css";
import {RLayerCluster} from "rlayers";
import {RCircle, RFill, RStroke, RStyle, RText} from "rlayers/style";
import {TRAIL_COLOR} from "./Trails";

const reader = new GeoJSON({featureProjection: "EPSG:3857"});

// Zoom level at which maps swap the count circles for trail lines.
export const TRAILS_ZOOM = 10;

// Circle area grows with the trail count, but logarithmically so a 900-trail
// cluster doesn't swallow the map.
const clusterRadius = (count) => Math.round(11 + 6 * Math.log10(count));

// Clicking a circle zooms to fit its trails; clicking a single trail zooms in until
// its line shows.
function zoomToCluster(e) {
    const members = e.target.get("features");
    if (!members) {
        return;
    }
    const extent = createEmpty();
    for (const f of members) extend(extent, f.getGeometry().getExtent());
    const view = e.map.getView();
    if (members.length === 1 || (getWidth(extent) === 0 && getHeight(extent) === 0)) {
        view.animate({center: getCenter(extent), zoom: Math.max(view.getZoom() + 2, TRAILS_ZOOM + 2), duration: 300});
    } else {
        view.fit(extent, {padding: [60, 60, 60, 60], maxZoom: TRAILS_ZOOM + 3, duration: 300});
    }
    return false;
}

// Clusters are grouped within CLUSTER_DISTANCE px and kept MIN_DISTANCE px apart, which
// is enough for the largest circles (~62px across) not to overlap.
const CLUSTER_DISTANCE = 70;
const MIN_DISTANCE = 56;

export default function TrailClusters({maxZoom = TRAILS_ZOOM}) {
    const layerRef = useRef();

    useEffect(() => {
        // rlayers doesn't pass minDistance through to the OpenLayers cluster source.
        layerRef.current && layerRef.current.source.setMinDistance(MIN_DISTANCE);
    }, []);

    return <RLayerCluster
        ref={layerRef}
        distance={CLUSTER_DISTANCE}
        format={reader}
        url="/trails.heatmap.geojson"
        maxZoom={maxZoom}
        onClick={zoomToCluster}
    >
        <RStyle
            cacheSize={1024}
            cacheId={useCallback((feature) => String(feature.get("features").length), [])}
            render={useCallback((feature) => {
                const count = feature.get("features").length;
                if (count === 1) {
                    return <RCircle radius={5}>
                        <RFill color={TRAIL_COLOR}/>
                        <RStroke color="#fff" width={2}/>
                    </RCircle>;
                }
                return <React.Fragment>
                    <RCircle radius={clusterRadius(count)}>
                        <RFill color="rgba(26, 86, 219, 0.88)"/>
                        <RStroke color="#fff" width={2}/>
                    </RCircle>
                    <RText text={count.toString()} font="bold 12px Lato, 'Helvetica Neue', Arial, sans-serif">
                        <RFill color="#fff"/>
                    </RText>
                </React.Fragment>;
            }, [])}
        />
    </RLayerCluster>;
}
