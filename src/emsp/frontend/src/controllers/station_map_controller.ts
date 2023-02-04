import {ref, type Ref} from "vue";
import {GenericController} from "./generic_controller";
import type StationModel from "@/model/station_model";
import Map from "ol/Map";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import View from "ol/View";
import {fromLonLat, METERS_PER_UNIT, Projection, toLonLat, transformExtent} from "ol/proj";
import {Vector} from "ol/layer";
import {Vector as SVector} from "ol/source";
import {Circle, Fill, Icon, Stroke, Style} from "ol/style";
import markerPNG from "@/assets/images/marker.png";
import {Feature, Geolocation} from "ol";
import {useToast} from "vue-toastification";
import {Geometry, Point} from "ol/geom";
import type {Coordinate} from "ol/coordinate";
import type {Units} from "ol/proj/Units"
import {distance} from "ol/coordinate";
import {getDistance} from "ol/sphere";

let reference = ref<StationModel[] | null>(null);

interface IStationMapController {
    getNearbyStations(): Promise<StationModel[] | null>;
    setStations(stations: StationModel[] | null): void;
}

class StationMapController extends GenericController<StationModel[] | null> implements IStationMapController {

    map: Map = new Map();
    geolocation: Geolocation = new Geolocation();
    lastGeolocation: Coordinate = [0, 0];
    markers: Vector<SVector<Geometry>> | undefined;

    async generateMap(target: HTMLElement) {
        const self = this;
        // the DOM element will be assigned to the ref after initial render
        // this is where we create the OpenLayers map
        this.map = new Map({
            // the map will be created using the 'map-root' ref
            target: target,
            layers: [
                // adding a background tiled layer
                new TileLayer({
                    source: new OSM() // tiles are served by OpenStreetMap
                }),
            ],

            // the map view will initially show the whole world
            view: new View({
                zoom: 10,
                center: fromLonLat([139.839478, 35.652832]),
                constrainResolution: true
            }),
        });

        this.geolocation = new Geolocation({
            trackingOptions: {
                enableHighAccuracy: true,
            },
            projection: this.map.getView().getProjection(),
        });

        this.geolocation.setTracking(true);

        // handle geolocation error.
        this.geolocation.on('error', function (error) {
            useToast().error(error.message);
        });

        const accuracyFeature = new Feature();
        const accuracyGeometry = this.geolocation.getAccuracyGeometry()
        if (accuracyGeometry) {
            this.geolocation.on('change:accuracyGeometry', function () {
                accuracyFeature.setGeometry(self.geolocation.getAccuracyGeometry()!);
            });
        }

        const positionFeature = new Feature();
        positionFeature.setStyle(
            new Style({
                image: new Circle({
                    radius: 8,
                    fill: new Fill({
                        color: '#3399CC',
                    }),
                    stroke: new Stroke({
                        color: '#fff',
                        width: 2,
                    }),
                }),
            })
        );

        setInterval(async function () {
            const coordinates = self.geolocation.getPosition();
            const center = self.map.getView().getCenter() ?? coordinates;
            if (center && (center[0] != self.lastGeolocation[0] || center[1] != self.lastGeolocation[1])) {
                const centerLonLat = toLonLat(center);
                const lastLonLat = toLonLat(self.lastGeolocation);
                if (self.distanceBetweenPoints(lastLonLat, centerLonLat) > 2) {
                    await self.updateCurrentLocation();
                    self.lastGeolocation = center;
                }
            }
            positionFeature.setGeometry(coordinates ? new Point(coordinates) : undefined);
        }, 1000);

        new Vector({
            map: this.map,
            source: new SVector({
                features: [accuracyFeature, positionFeature],
            }),
        });

        this.markers = new Vector({
            source: new SVector(),
            style: new Style({
                image: new Icon({
                    anchor: [0.5, 1],
                    src: markerPNG,
                    scale: 0.4
                })
            })
        });
        this.map.addLayer(this.markers!);

        await self.updateCurrentLocation();
    }

    async updateCurrentLocation() {
        await this.getNearbyStations();
    }

    async updateCenteredLocation() {
        //Ask the server the nearby stations to update the map
        //await this.getNearbyStations();
    }

    async getNearbyStations(): Promise<StationModel[] | null> {
        const viewportPositionUntransformed = this.map.getView()?.getCenter();
        const viewportPosition = viewportPositionUntransformed ? toLonLat(viewportPositionUntransformed) : undefined;
        const currentPosition = viewportPosition ?? [139.839478, 35.652832];
        const accuracy = this.geolocation.getAccuracy() ?? 0;
        const viewportRadius = this.map.getView().calculateExtent(this.map.getSize());
        const transformedViewportSize = transformExtent(viewportRadius, 'EPSG:3857', 'EPSG:4326');
        const query = {
            latitude: currentPosition[1],
            longitude: currentPosition[0],
            radius: Math.max(Math.abs(transformedViewportSize[0] - transformedViewportSize[2]), Math.abs(transformedViewportSize[1] - transformedViewportSize[3])) * 0.75,
            priceMin: 0,
            priceMax: 999999
        }
        const res = await super.get<StationModel[]>("/search", { query: query });
        if (res) {
            this.setStations(res);
        }
        return null;
    }

    setStations(stations: StationModel[]): void {
        //Update the ref and the map
        reference.value = stations;
        //Clear the station layer
        this.markers?.getSource()?.clear();
        //Add a new feature for each station we received
        for (let i = 0; i < stations.length; i++) {
            this.addMarker(stations[i].locationLatitude, stations[i].locationLongitude);
        }
    }

    addMarker(latitude: number, longitude: number) {
        const marker = new Feature(new Point(fromLonLat([longitude, latitude])));
        this.markers?.getSource()?.addFeature(marker);
    }

    distanceBetweenPoints(latlng1: Coordinate, latlng2: Coordinate): number {
        return getDistance(latlng1, latlng2) / 1000;
    }

    /**
     * Return the object reference of this controller. The controller is a singleton, so the reference is the same for all the class
     */
    getRef(): Ref<StationModel[] | null> {
        return reference;
    }

}

export default new StationMapController();