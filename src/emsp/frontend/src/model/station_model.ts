import type Socket from "@/model/socket_model";
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
    offerExpirationDate: number | null;
    sockets: Socket[] | null;
    imageURL: string;

    constructor(id: number, name: string, ownerCPMSId: number, ownerCPMSName: string, locationLatitude: number, locationLongitude: number, nominalPrice: number, userPrice: number, offerExpirationDate: number | null, sockets: Socket[] | null, imageURL: string) {
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
}