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

    getChargeSpeed(): string {
        if (this.maxPower < 3) { //3kW
            return "Normal";
        } else if (this.maxPower < 30) {
            return "Fast";
        } else {
            return "Ultra Fast";
        }
    }
}