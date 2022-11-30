//All the numeric types are Integers since the precision of Floats is not required.
//For prices, to have 2 decimals of precision, we consider the prices directly in cents.
//NOTE: Integers appear to be 4-bits, meaning that we can no longer reach 100

sig Date {
	unixTime: one Int
} {
	unixTime >= 0
}
//Radomly chosen by Alloy
one sig Now extends Date {}

sig Location {}
sig Email {}
sig UserName {}
sig Password {}
sig CompanyName {}
sig PaymentMethod {}

abstract sig Bool {}
one sig True extends Bool {}
one sig False extends Bool {}

sig User {
	userName: one UserName,
	email: one Email,
	password: one Password,
	paymentMethod: one PaymentMethod,
	bookings: set Booking
} {
	//No user can have two overlapping bookings
	all b1, b2: Booking | (b1 in bookings and b2 in bookings)
	implies
	(b1 = b2 or (b1.startDate.unixTime < b2.startDate.unixTime and b1.endDate.unixTime <= b2.startDate.unixTime) or
	(b2.startDate.unixTime < b1.startDate.unixTime and b2.endDate.unixTime <= b1.startDate.unixTime))
}

//Force that a booking of a eMSP is made by a user registered in that eMSP, even tho the eMSP is only one...
sig Booking {
	startDate: one Date,
	endDate: one Date,
	isActive: one Bool,
	socket: one Socket
} {
	startDate.unixTime < endDate.unixTime
	and (isActive = True implies startDate.unixTime <= Now.unixTime and Now.unixTime <= endDate.unixTime)
	and (isActive = True implies socket.connectedVehicle != none)
}

//For our interests, it is a singleton
one sig eMSP {
	users: some User,
	knownCPMSs: some CPMS,
	bookings: some Booking
}

//The CS->CPO one-to-one relation can be inferred by going through here
sig CPMS {
	CSs: some CS,
	knownDSOs: some DSO,
	owner: one CPO,
	policy: one Policy
}

sig Policy {
	weights: set Int,
	thresholds: set Int
} {
	all w: Int | w in weights implies w >= 0
	and all t: Int | t in thresholds implies t >= 0
}

sig CS {
	//Do we really need socketCount?
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

sig Connector {}

sig Socket {
	connector: one Connector,
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
	chargePerc >= 0 and chargePerc <= 10
}

sig CPO {
	name: one CompanyName
}

sig DSO {
	name: one CompanyName,
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
	//The sum will need to reach 100 in reality, but here we are working with 4-bit integers
	oilAndGas + ccgt + coal + nuclear + hydroelectric + otherRenewableSources = 10
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
	chargeLevel >= 0 and chargeLevel <= 10
}

fact noCPOsWithSameName {
	no c1, c2: CPO | c1 != c2 and c1.name = c2.name
}

fact noDSOWIthSameName {
	no d1, d2: DSO | d1 != d2 and d1.name = d2.name
}

fact noCPODSOWithSameName {
	no c: CPO, d: DSO | c.name = d.name
}

fact CPOOneToOneCPMS {
	no cp1, cp2: CPMS | cp1 != cp2 and cp1.owner = cp2.owner
}

fact noBookingsWithoutUsers {
	all b: Booking | (one u: User | b in u.bookings)
}

fact noExpiredBookings {
	all b: Booking | b.endDate.unixTime >= Now.unixTime
}

fact noOverlappingSocketBookings {
	/*
	or ((b1.startDate.unixTime < b2.startDate.unixTime implies b1.endDate.unixTime <= b2.startDate.unixTime) and (b1.startDate.unixTime > b2.startDate.unixTime implies b2.endDate.unixTime <= b1.startDate.unixTime))
	*/
	all b1, b2: Booking | (b1 = b2 or b1.socket != b2.socket or (b1.startDate.unixTime < b2.startDate.unixTime and b1.endDate.unixTime <= b2.startDate.unixTime)
	or (b2.startDate.unixTime < b1.startDate.unixTime and b2.endDate.unixTime <= b1.startDate.unixTime))
}

fact socketFreeIfNotBooked {
	all s: Socket | ((no b: Booking | b.socket = s)
	implies 
	no s.connectedVehicle)
}

fact socketNotFreeIfActiveBooking {
	all s: Socket | ((some b: Booking | b.socket = s and b.isActive = True)
	implies 
	s.connectedVehicle != none)
}

fact allCSHaveACPMS {
	//no cs: CS | (no cpm: CPMS | (cs in cpm.CSs))
	all cs: CS | (one cpm: CPMS | cs in cpm.CSs)
}

fact uniqueSocketsForCS {
	no cs1, cs2: CS | cs1 != cs2 and (some s: Socket | s in cs1.sockets and s in cs2.sockets)
}

run {} for 12 but 6 Int, exactly 3 User, exactly 3 CS, exactly 2 CPMS, exactly 3 Booking