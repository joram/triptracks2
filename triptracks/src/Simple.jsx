import React from "react";
import {fromLonLat} from "ol/proj";
import "ol/ol.css";

import {RMap, ROSM} from "rlayers";

const center = fromLonLat([-124.594444, 49.223611]);
export default function Simple() {
  return (
    <RMap width={"500px"} height={"60vh"} initial={{ center: center, zoom: 11 }}>
      <ROSM  properties={{ label: "HillShading" }} />
    </RMap>
  );
}