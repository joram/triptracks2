import {RControl, RLayerTile, RLayerTileJSON, ROSM} from "rlayers";
import layersIcon from "./layers.svg";

const layersButton = (
  <div style={{marginLeft:"8px", marginTop:"80px"}}>
    <button>
      <img src={layersIcon} alt="layers" />
    </button>
  </div>
);

export default function LayersControl(){
    return <RControl.RLayers element={layersButton}>
        <ROSM properties={{ label: "OpenStreetMap" }} />
        <RLayerTile
          properties={{ label: "OpenTopo" }}
          url="https://{a-c}.tile.opentopomap.org/{z}/{x}/{y}.png"
          attributions="Kartendaten: © OpenStreetMap-Mitwirkende, SRTM | Kartendarstellung: © OpenTopoMap (CC-BY-SA)"
        />
        <RLayerTile
          properties={{ label: "landcovercanada" }}
          url="http://ows.geobase.ca/wms/geobase_en/{z}/{x}/{y}.png"
          attributions="Kartendaten: © OpenStreetMap-Mitwirkende, SRTM | Kartendarstellung: © OpenTopoMap (CC-BY-SA)"
        />
       <RLayerTile
          properties={{ label: "HillShading" }}
          url="http://tiles.wmflabs.org/hillshading/{z}/{x}/{y}.png"
        />
        <RLayerTile
          properties={{ label: "Mapnik" }}
          url="https://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png"
        />
        <RLayerTile
          properties={{ label: "Transport" }}
          url="http://tile.thunderforest.com/transport/{z}/{x}/{y}.png"
        />
        <RLayerTile
          properties={{ label: "Watercolor" }}
          url="http://c.tile.stamen.com/watercolor/{z}/{x}/{y}.jpg"
        />
        <RLayerTileJSON
          properties={{ label: "Mapbox TileJSON" }}
          url="https://a.tiles.mapbox.com/v3/aj.1x1-degrees.json?secure=1"
        />
      </RControl.RLayers>
}