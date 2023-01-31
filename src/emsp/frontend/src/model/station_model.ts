import type Socket from "@/model/socket_model";
import {convertSQLStringToDateTimeString} from "@/helpers/converters";
import {SocketType} from "@/model/socket_model";

export default class StationModel {
    id: number;
    name: string = "Unknown";
    ownerCPMSId: number;
    ownerCPMSName: string;
    locationLatitude: number;
    locationLongitude: number;
    nominalPrice: number;
    userPrice: number;
    offerExpirationDate: string | null;
    sockets: Socket[] | null;
    imageURL: string;

    constructor(id: number, name: string, ownerCPMSId: number, ownerCPMSName: string, locationLatitude: number, locationLongitude: number, nominalPrice: number, userPrice: number, offerExpirationDate: string | null, sockets: Socket[] | null, imageURL: string) {
        this.id = id;
        this.name = name;
        this.ownerCPMSId = ownerCPMSId;
        this.ownerCPMSName = ownerCPMSName;
        this.locationLatitude = locationLatitude;
        this.locationLongitude = locationLongitude;
        this.nominalPrice = nominalPrice;
        this.userPrice = userPrice;
        this.offerExpirationDate = offerExpirationDate;
        this.sockets = sockets;
        this.imageURL = imageURL;
    }

    getAggregatedSocketSpeeds(): string {
        let speeds = "";
        let set: Set<string> = new Set<string>();
        for (const socket of this.sockets ?? []) {
            set.add(SocketType.getChargeSpeed(socket.type));
        }
        for (const speed of set) {
            if (speeds == "") {
                speeds += speed;
            } else {
                speeds += ", " + speed;
            }
        }
        return speeds;
    }

    getAggregatedSocketTypes(): string {
        let types = "";
        let set: Set<string> = new Set<string>();
        for (const socket of this.sockets ?? []) {
            set.add(socket.type.connector);
        }
        for (const connector of set) {
            if (types == "") {
                types += connector;
            } else {
                types += ", " + connector;
            }
        }
        return types;
    }

    getOfferEndDate(): string {
        if (this.offerExpirationDate) {
            return convertSQLStringToDateTimeString(this.offerExpirationDate);
        }
        return "No Offers";
    }
}