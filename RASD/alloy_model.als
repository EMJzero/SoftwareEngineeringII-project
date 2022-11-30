//All the numeri types are Integers since the precision of Ints is not required.
//For prices, to have 2 decimals of precision, we consider the prices directly in cents.


sig Date {
	unixTime: one Int
} {
	unixTime >= 0
}
//Radomly chosen by Alloy
one sig Now extends Date {}
sig Location {}

abstract sig Bool {}
one sig True extends Bool {}
one sig False extends Bool {}

sig User {
	userName: one String,
	email: one String,
	password: one String,
	paymentMethod: one String,
	bookings: set Booking
} {
	//No user can have two overlapping bookings
	all b1, b2: Booking | b1 in bookings and b2 in bookings
	implies
	b1 = b2 or (b1.startDate.unixTime < b2.startDate.unixTime implies b1.endDate.unixTime <= b2.startDate.unixTime)
}

//Force that a booking of a eMSP is made by a user registered in that eMSP, even tho the eMSP is only one...
sig Booking {
	startDate: one Date,
	endDate: one Date,
	isActive: one Bool,
	socket: one Socket
} {
	startDate.unixTime < endDate.unixTime
	and isActive = True implies startDate.unixTime <= Now.unixTime and Now.unixTime <= endDate.unixTime
	and isActive = True implies some v: Vehicle | socket.connectedVehicle = v
}

//For our interests, it is a singleton
one sig eMSP {
	users: set User,
	knownCPMSs: some CPMS,
	bookings: set Booking
}

//The CS->CPO one-to-one relation can be inferred by going through here
sig CPMS {
	CSs: some CS,
	knownDSOs: some DSO,
	CPO: one CPO,
	policy: one Policy
}

sig Policy {
	weights: set Int,
	threshold: set Int
} {
	sum weights = 1
	and all t: Int | t in threshold implies t >= 0
}

sig CS {
	socketCount: one Int,
	location: one Location,
	nominalPrice: one Int,
	userPrice: one Int,
	chargingFromBatteries: one Bool,
	sockets: some Socket,
	batteries: set Battery,
	currentDSO: one DSO
} {
	socketCount > 0
	and nominalPrice > 0
	and userPrice > 0
	and userPrice <= nominalPrice
	and nominalPrice >= currentDSO.price
}

sig Socket {
	connector: one String,
	maxPower: one Int,
	currentPower: one Int,
	connectedVehicle: lone Vehicle
} {
	maxPower > 0
	and currentPower >= 0
	and currentPower <= maxPower
}

sig Vehicle {
	chargePerc: one Int
} {
	chargePerc >= 0 and chargePerc <= 100
}

sig CPO {
	name: one String
}

sig DSO {
	name: one String,
	price: one Int,
	energyMix: one EnergyMix
} {
	price > 0
}

sig EnergyMix {
	oilAndGas: Int,
	ccgt: Int,
	coal: Int,
	nuclear: Int,
	hydroelectric: Int,
	otherRenewableSources: Int
} {
	oilAndGas + ccgt + coal + nuclear + hydroelectric + otherRenewableSources = 100
	and oilAndGas >= 0
	and ccgt >= 0
	and coal >= 0
	and nuclear >= 0
	and hydroelectric >= 0
	and otherRenewableSources >= 0
}

sig Battery {
	capacitymAp: one Int,
	chargeLevel: one Int
} {
	capacitymAp > 0 and
	chargeLevel >= 0 and chargeLevel <= 100
}

fact noExpiredBookings {
	all b: Booking | b.endDate.unixTime >= Now.unixTime
}

fact noOverlappingSocketBookings {
	all b1, b2: Booking | b1.socket != b2.socket or (b1.startDate.unixTime < b2.startDate.unixTime implies b1.endDate.unixTime <= b2.startDate.unixTime)
}

fact socketFreeIfNotBooked {
	all s: Socket | ((no b: Booking | b.socket = s)
	implies 
	no s.connectedVehicle)
}

fact socketNotFreeIfActiveBooking {
	all s: Socket | ((some b: Booking | b.socket = s and b.isActive = True)
	implies 
	(some v: Vehicle | s.connectedVehicle = v))
}

run {} for 10