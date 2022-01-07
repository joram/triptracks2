import React, {useCallback} from "react";
import GeoJSON from "ol/format/GeoJSON";
import {createEmpty, extend, getHeight, getWidth} from "ol/extent";
import "ol/ol.css";
import {RLayerCluster} from "rlayers";
import {RCircle, RFill, RRegularShape, RStroke, RStyle, RText,} from "rlayers/style";
const reader = new GeoJSON({ featureProjection: "EPSG:3857" });

const colorBlob = (size) => "rgba(" + [255, 153, 0, Math.min(0.8, 0.4 + Math.log(size / 10) / 20)].join() + ")";
const radiusStar = (feature) => Math.round(5);
const extentFeatures = (features, resolution) => {
  const extent = createEmpty();
  for (const f of features) extend(extent, f.getGeometry().getExtent());
  return Math.round(0.25 * (getWidth(extent) + getHeight(extent))) / resolution;
};


export default function ClusteredTrails(props) {
  const trailsLayer = React.useRef();
  return (
      <RLayerCluster
        ref={trailsLayer}
        distance={20}
        format={reader}
        url="/trails.heatmap.geojson"
        maxZoom={props.maxZoom}
      >
        <RStyle
          cacheSize={1024}
          cacheId={useCallback(
            (feature, resolution) =>
              feature.get("features").length > 1
                ? "#" + extentFeatures(feature.get("features"), resolution)
                : "$" + radiusStar(feature.get("features")[0]),
            []
          )}
          render={useCallback((feature, resolution) => {
            const size = feature.get("features").length;
            if (size > 1) {
              const radius = extentFeatures(
                feature.get("features"),
                resolution
              );
              return (
                <React.Fragment>
                  <RCircle radius={radius}>
                    <RFill color={colorBlob(size)} />
                  </RCircle>
                  <RText text={size.toString()}>
                    <RFill color="#fff" />
                    <RStroke color="rgba(0, 0, 0, 0.6)" width={3} />
                  </RText>
                </React.Fragment>
              );
            }
            const unclusteredFeature = feature.get("features")[0];
            return (
              <RRegularShape
                radius1={radiusStar(unclusteredFeature)}
                radius2={3}
                points={5}
                angle={Math.PI}
              >
                <RFill color="rgba(255, 153, 0, 0.8)" />
                <RStroke color="rgba(255, 204, 0, 0.2)" width={1} />
              </RRegularShape>
            );
          }, [])}
        />
      </RLayerCluster>
  );
}