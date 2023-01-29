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
}