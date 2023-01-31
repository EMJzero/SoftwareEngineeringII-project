export default class Socket {
    id: number;
    type: SocketType;

    constructor(id: number, type: SocketType) {
        this.id = id;
        this.type = type;
    }
}

export class SocketType {
    connector: string;
    maxPower: number;

    constructor(connector: string, maxPower: number) {
        this.connector = connector;
        this.maxPower = maxPower;
    }

    static getChargeSpeed(socketType: SocketType): string {
        if (socketType.maxPower < 3) { //3kW
            return "Normal";
        } else if (socketType.maxPower < 30) {
            return "Fast";
        } else {
            return "Ultra Fast";
        }
    }
}