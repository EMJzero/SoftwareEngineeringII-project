import type Socket from "@/model/socket_model";

export default class StationModel {
    id: number;
    name: string = "Unknown";
    locationLatitude: number;
    locationLongitude: number;
    nominalPrice: number;
    userPrice: number;
    offerExpirationDate: string | null;
    sockets: Socket[] | null;
    imageURL: string;

    constructor(id: number, name: string, locationLatitude: number, locationLongitude: number, nominalPrice: number, userPrice: number, offerExpirationDate: string | null, sockets: Socket[] | null, imageURL: string) {
        this.id = id;
        this.name = name;
        this.locationLatitude = locationLatitude;
        this.locationLongitude = locationLongitude;
        this.nominalPrice = nominalPrice;
        this.userPrice = userPrice;
        this.offerExpirationDate = offerExpirationDate;
        this.sockets = sockets;
        this.imageURL = imageURL;
    }
}