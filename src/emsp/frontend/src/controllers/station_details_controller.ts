import { computed, ref, type Ref } from "vue";
import { GenericController } from "./generic_controller";
import type StationModel from "@/model/station_model";
import Socket, {SocketType} from "@/model/socket_model";

let reference = ref<StationModel | null>(null);

interface IStationDetailsController {
    getStationDetails(cpmsId: number, stationId: number): Promise<StationModel | null>
    setStation(station: StationModel | null): void;
}

class StationDetailsController extends GenericController<StationModel | null> implements IStationDetailsController {

    async getStationDetails(cpmsId: number, stationId: number): Promise<StationModel | null> {
        const res = await super.get<StationModel>("/details", { query: {
            cpmsId: cpmsId, stationID: stationId
            } });
        this.setStation(res);
        return res;
    }

    setStation(station: StationModel | null) {
        reference.value = station;
    }

    /**
     * Return the object reference of this controller. The controller is a singleton, so the reference is the same for all the class
     */
    getRef(): Ref<StationModel | null> {
        return reference;
    }


}

export default new StationDetailsController();