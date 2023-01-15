export default class CSConnection {

    private id: string;
    private sockets: SocketMachine[];

    constructor(id: string, socketTypes: SocketType[], socketSpeeds: ChargeSpeedPower[]) {
        this.id = id;
        this.sockets = [];
        for (let i = 0; i < socketTypes.length; i++) {
            this.sockets.push(new SocketMachine(id, socketTypes[i], socketSpeeds[i]));
        }
    }

    public startCharge(socketIndex: number) {
        this.sockets[socketIndex].chargeCar();
    }

    public stopCharge(socketIndex: number) {
        this.sockets[socketIndex].stopChargeCar();
    }

    public getTimeRemaining(socketIndex: number): number {
        return this.sockets[socketIndex].getEstimatedTimeRemaining();
    }
}

enum SocketType {
    TypeA = 50,
    TypeB = 30,
    TypeC = 60
}

enum ChargeSpeedPower {
    Slow = 20,
    Fast = 40,
    UltraFast = 60
}

class SocketMachine {

    private csId: string;
    private state = 0; //STATES: 0 = Idle, 1 = Connected (not charging), 2 = Charging
    private currentPower = 0;
    private readonly maxPower: number;
    private connectedCar?: CarData;

    constructor(csId: string, socketType: SocketType, speed: ChargeSpeedPower) {
        this.csId = csId;
        this.maxPower = Math.min(speed, socketType);
    }

    public connectCar() {
        if (this.state == 0) {
            this.state = 1;
        } else {
            throw "Cannot connect a new car: a car is already connected!";
        }
    }

    public disconnectCar() {
        if (this.state == 1) {
            this.state = 0;
            this.currentPower = 0;
        } else {
            throw "Cannot disconnect a car";
        }
    }

    public chargeCar() {
        if (this.state == 1) {
            this.state = 2;
            this.connectedCar = getCarData();
            if (!this.connectedCar) {
                throw "Cannot start a charge without getting car data first!";
            }
            this.currentPower = Math.min(this.maxPower, this.connectedCar.maxAcceptedPowerKW);
        } else {
            throw "Cannot start charging a car";
        }
    }

    public stopChargeCar() {
        if (this.state == 2) {
            this.state = 1;
            this.currentPower = 0;
        } else {
            throw "Cannot end a charge which never started!";
        }
    }

    public getEstimatedTimeRemaining(): number {
        if (this.state == 2 && this.connectedCar) {
            return (this.connectedCar.batteryCapacityKWh - this.connectedCar.remainingCapacityKWh) / this.currentPower;
        } else {
            throw "Cannot estimate time when no charge is ongoing!";
        }
    }
}

class CarData {
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

function getCarData(): CarData {
    const carDB = [new CarData("Tesla", 100, 30, 300),
        new CarData("Volkswagen", 80, 60, 150),
        new CarData("Toyota", 120, 90, 90),
        new CarData("Honda", 60, 55, 90),
        new CarData("Lexus", 300, 90, 400)];
    return carDB[Math.round(Math.random() * 4)];
}