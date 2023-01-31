import { computed, ref, type Ref } from "vue";
import { GenericController } from "./generic_controller";
import type StationModel from "@/model/station_model";
import Socket, {SocketType} from "@/model/socket_model";
import type StationDetailsModel from "@/model/station_details_model";

let reference = ref<StationDetailsModel | null>(null);

interface IStationDetailsController {
    getStationDetails(cpmsId: number, stationId: number): Promise<StationDetailsModel | null>
    setStation(station: StationDetailsModel | null): void;
}

class StationDetailsController extends GenericController<StationDetailsModel | null> implements IStationDetailsController {

    async getStationDetails(cpmsId: number, stationId: number): Promise<StationDetailsModel | null> {
        const res = await super.get<StationDetailsModel>("/details", { query: {
            cpmsId: cpmsId, stationID: stationId
            } });
        this.setStation(res);
        return res;
    }

    setStation(station: StationDetailsModel | null) {
        reference.value = station;
    }

    /**
     * Return the object reference of this controller. The controller is a singleton, so the reference is the same for all the class
     */
    getRef(): Ref<StationDetailsModel | null> {
        return reference;
    }


}

export default new StationDetailsController();