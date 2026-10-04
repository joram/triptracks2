import GeoJSON from "ol/format/GeoJSON";
import {transformExtent} from "ol/proj";
import {RLayerVector, RStyle} from "rlayers";
import React, {useEffect, useState} from "react";
import {useHistory} from "react-router-dom";
import {getTrailsInBbox} from "../../utils/api";

const geojsonFormat = new GeoJSON({featureProjection: "EPSG:3857"});

// The map's visible extent as [minLng, minLat, maxLng, maxLat], for onMoveEnd handlers.
export function viewBbox(map) {
    const extent = map.getView().calculateExtent(map.getSize());
    return transformExtent(extent, "EPSG:3857", "EPSG:4326").map((v) => Number(v.toFixed(4)));
}

// Blue contrasts with the warm sepia topo base; selected routes switch to magenta.
// A light casing under each line keeps it readable over dark hillshade.
export const TRAIL_COLOR = "#1a56db";
export const SELECTED_TRAIL_COLOR = "#d61f84";

export function TrailStyle({color = TRAIL_COLOR, width = 3}) {
    return <RStyle.RStyleArray>
        <RStyle.RStyle>
            <RStyle.RStroke color="rgba(255, 255, 255, 0.85)" width={width + 3}/>
        </RStyle.RStyle>
        <RStyle.RStyle>
            <RStyle.RStroke color={color} width={width}/>
        </RStyle.RStyle>
    </RStyle.RStyleArray>;
}

function TrailLayer({features, layerKey, color, width, zIndex, onClick}) {
    if (features.length === 0) {
        return null;
    }
    // rlayers doesn't pick up changes to `features`, so remount when they change.
    return <RLayerVector key={layerKey} zIndex={zIndex} features={features} onClick={onClick}>
        <TrailStyle color={color} width={width}/>
    </RLayerVector>;
}

// Trail lines inside `bbox`. Clicking a trail calls onTrailClick(trailId), or opens its
// detail page when no handler is given. Trails in `selected` are drawn highlighted.
function Trails({bbox, maxTrails, selected = [], onTrailClick}) {
    const [loaded, setLoaded] = useState({key: null, features: []});
    const history = useHistory();
    const bboxKey = bbox ? bbox.join(",") : null;

    useEffect(() => {
        if (!bboxKey) {
            return;
        }
        const controller = new AbortController();
        getTrailsInBbox(bboxKey.split(","), maxTrails, controller.signal)
            .then((collection) => {
                setLoaded({key: bboxKey, features: geojsonFormat.readFeatures(collection)});
            })
            .catch((error) => {
                if (error.name !== "AbortError") {
                    console.error(error);
                }
            });
        return () => controller.abort();
    }, [bboxKey, maxTrails]);

    function onClick(e) {
        e.stopPropagation();
        const trailId = e.target.getId();
        if (onTrailClick) {
            onTrailClick(trailId);
        } else {
            history.push(`/trail/${trailId}`);
        }
    }

    const selectedIds = new Set(selected);
    const plain = loaded.features.filter((f) => !selectedIds.has(f.getId()));
    const highlighted = loaded.features.filter((f) => selectedIds.has(f.getId()));
    const selectionKey = [...selectedIds].sort().join(",");

    return <>
        <TrailLayer
            features={plain}
            layerKey={`plain:${loaded.key}:${selectionKey}`}
            color={TRAIL_COLOR} width={3} zIndex={5}
            onClick={onClick}
        />
        <TrailLayer
            features={highlighted}
            layerKey={`selected:${loaded.key}:${selectionKey}`}
            color={SELECTED_TRAIL_COLOR} width={5} zIndex={8}
            onClick={onClick}
        />
    </>;
}

export default Trails;
