import { computed, ref, type Ref } from "vue";
import { GenericController } from "./generic_controller";
import StationModel from "@/model/station_model";
import Socket, {SocketType} from "@/model/socket_model";

let reference = ref<StationModel | null>(null);

interface IStationDetailsController {
    getStationDetails(cpmsName: string, stationId: number): Promise<StationModel | null>
    setStation(station: StationModel | null): void;
}

class StationDetailsController extends GenericController<StationModel | null> implements IStationDetailsController {

    async getStationDetails(cpmsName: string, stationId: number): Promise<StationModel | null> {
        /*const res = await super.get<StationModel>("/details", { query: {
            cpmsName: cpmsName, stationID: stationId
            } });*/
        //TODO: Remove the mock model object when the DB is working on the backend
        const res = new StationModel(1, "Tokyo Tower Hub", 1, "CPMS1", 0, 0, 12, 12, null, [new Socket(1, new SocketType("Type A", 90)), new Socket(1, new SocketType("Type A", 80)), new Socket(1, new SocketType("Type B", 50)), new Socket(1, new SocketType("Type B", 50))], "https://www.japan-guide.com/g18/3003_01.jpg");
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