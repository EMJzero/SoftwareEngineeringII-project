import * as WebSocket from "ws";

export class CSDB {

    static readonly shared = new CSDB();
    private connections: CSConnection[] = [];

    public registerCS(connection: CSConnection) {
        this.connections.push(connection);
    }

    public unregisterCS(connection: CSConnection) {
        this.connections.splice(this.connections.indexOf(connection), 1);
    }

    public getConnectionToCSWithID(csID: number): CSConnection | undefined {
        return this.connections.find((conn) => conn.id == csID);
    }
}

export default class CSConnection {

    private readonly _id: number;
    private readonly _websocket: WebSocket;
    private _sockets: SocketMachine[];

    constructor(id: number, websocket: WebSocket) {
        this._id = id;
        this._sockets = [];
        this._websocket = websocket;
    }

    public startCharge(socketId: number): boolean {
        const socket = (this.sockets()).find((sc) => sc.socketId == socketId);
        if (socket) {
            const request = {
                request: "startCharge",
                socketId: socketId
            };
            this._websocket.send(JSON.stringify(request));
            return true;
        }
        return false;
    }

    public stopCharge(socketId: number): boolean {
        const socket = (this.sockets()).find((sc) => sc.socketId == socketId);
        if (socket) {
            const request = {
                request: "stopCharge",
                socketId: socketId
            };
            this._websocket.send(JSON.stringify(request));
            return true;
        }
        return false;
    }

    public getTimeRemaining(socketID: number): number | undefined {
        return (this.sockets()).find((sc) => sc.socketId == socketID)?.getEstimatedTimeRemaining();
    }

    get id(): number {
        return this._id;
    }

    public getSocket(socketId: number): SocketMachine | undefined {
        return (this.sockets()).find(sc => sc.socketId == socketId);
    }

    public sockets(): SocketMachine[] {
        //TODO: Query socket state from the CS on the fly
        return this._sockets;
    }

    public static webSocketListener(message: string, connection: CSConnection) {
        const msg = JSON.parse(message);

        if(msg.type != undefined && msg.type == "socketsStatus") {
            msg.sockets.forEach((socket: any) => Object.setPrototypeOf(socket, SocketMachine.prototype));
            connection._sockets = msg.sockets;
        }
    }
}

export enum SocketType {
    Type1 = 50,
    Type2 = 30,
    Type3 = 60
}

export enum ChargeSpeedPower {
    Slow = 10,
    Fast = 40,
    UltraFast = 60
}

export class SocketMachine {

    private csId: number;
    private _socketId: number;
    private _state = 0; //STATES: 0 = Idle, 1 = Connected (not charging), 2 = Charging
    private _currentPower = 0;
    private readonly _maxPower: number;
    private _connectedCar?: CarData;

    constructor(csId: number, socketId: number, socketType: SocketType, speed: ChargeSpeedPower) {
        this.csId = csId;
        this._socketId = socketId;
        this._maxPower = Math.min(speed, socketType);
    }

    public connectCar() {
        if (this._state == 0) {
            this._state = 1;
            this._connectedCar = this.getCarData();
        } else {
            throw "Cannot connect a new car: a car is already connected!";
        }
    }

    public disconnectCar() {
        if (this._state == 1) {
            this._state = 0;
            this._currentPower = 0;
            this._connectedCar = undefined;
        } else {
            throw "Cannot disconnect a car";
        }
    }

    public chargeCar() {
        if (this._state == 1) {
            this._state = 2;
            if (!this._connectedCar) {
                throw "Cannot start a charge without getting car data first!";
            }
            this._currentPower = Math.min(this._maxPower, this._connectedCar.maxAcceptedPowerKW);
        } else {
            throw "Cannot start charging a car";
        }
    }

    public stopChargeCar() {
        if (this._state == 2) {
            this._state = 1;
            this._currentPower = 0;
        } else {
            throw "Cannot end a charge which never started!";
        }
    }

    public getEstimatedTimeRemaining(): number {
        if (this._state == 2 && this._connectedCar) {
            return (this._connectedCar.batteryCapacityKWh - this._connectedCar.remainingCapacityKWh) / this._currentPower;
        } else {
            throw "Cannot estimate time when no charge is ongoing!";
        }
    }

    private getCarData(): CarData {
        const carDB = [new CarData("Tesla", 100, 30, 300),
            new CarData("Volkswagen", 80, 60, 150),
            new CarData("Toyota", 120, 90, 90),
            new CarData("Honda", 60, 55, 90),
            new CarData("Lexus", 300, 90, 400)];
        return carDB[Math.round(Math.random() * 4)];
    }

    get socketId(): number {
        return this._socketId;
    }

    get state(): number {
        return this._state;
    }

    get currentPower(): number {
        return this._currentPower;
    }

    get maxPower(): number {
        return this._maxPower;
    }

    get connectedCar(): CarData {
        return <CarData>this._connectedCar;
    }

    public toString(): string {
        return "" +
            "\nid: " + this._socketId +
            "\nstate: " + this.state +
            "\ncurPower: " + this.currentPower +
            "\nmaxPower: " + this.maxPower +
            "\ncar: " + (this._connectedCar == undefined ? "none" : this._connectedCar.manufacturer);
    }
}

export class CarData {
    private readonly _manufacturer: string;
    private readonly _batteryCapacityKWh: number;
    private readonly _remainingCapacityKWh: number;
    private readonly _maxAcceptedPowerKW: number;

    constructor(manufacturer: string, batteryCapacityKWh: number, remainingCapacityKWh: number, maxAcceptedPowerKW: number) {
        this._manufacturer = manufacturer;
        this._batteryCapacityKWh = batteryCapacityKWh;
        this._remainingCapacityKWh = remainingCapacityKWh;
        this._maxAcceptedPowerKW = maxAcceptedPowerKW;
    }

    get manufacturer(): string {
        return this._manufacturer;
    }

    get batteryCapacityKWh(): number {
        return this._batteryCapacityKWh;
    }

    get remainingCapacityKWh(): number {
        return this._remainingCapacityKWh;
    }

    get maxAcceptedPowerKW(): number {
        return this._maxAcceptedPowerKW;
    }
}

