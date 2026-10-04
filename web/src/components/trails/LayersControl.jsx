import {RControl, RLayerTile, ROSM} from "rlayers";
import layersIcon from "./layers.svg";
import "./LayersControl.css";

const layersButton = (
  <button title="Map layers">
    <img src={layersIcon} alt="layers" />
  </button>
);

// Mute the topo base map to a sepia tone so trail lines stand out on top of it.
const SEPIA_FILTER = "sepia(0.7) saturate(0.6) contrast(0.9) brightness(1.05)";
const applySepia = (e) => { e.context.filter = SEPIA_FILTER; };
const clearSepia = (e) => { e.context.filter = "none"; };

export default function LayersControl(){
    return <RControl.RLayers element={layersButton}>
        {/* RLayers shows the first child by default. */}
        <RLayerTile
          properties={{ label: "OpenTopo" }}
          url="https://{a-c}.tile.opentopomap.org/{z}/{x}/{y}.png"
          attributions="Kartendaten: © OpenStreetMap-Mitwirkende, SRTM | Kartendarstellung: © OpenTopoMap (CC-BY-SA)"
          onPreRender={applySepia}
          onPostRender={clearSepia}
        />
        <ROSM properties={{ label: "OpenStreetMap" }} />
        <RLayerTile
          properties={{ label: "Transport" }}
          url="https://tile.thunderforest.com/transport/{z}/{x}/{y}.png"
        />
      </RControl.RLayers>
}