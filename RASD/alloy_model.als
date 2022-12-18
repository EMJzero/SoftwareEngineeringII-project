//All the numeric types are Integers since the precision of Floats is not required.
//For prices, to have 2 decimals of precision, we consider the prices directly in cents.
//NOTE: Integers appear to be 4-bits, meaning that we can no longer reach 100, hence percentages cap at 10

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

sig Booking {
	startDate: one Date,
	endDate: one Date,
	isActive: one Bool,
	socket: one Socket
} {
	//No negative duration bookings
	startDate.unixTime < endDate.unixTime
	//isActive only when actually within its duration and a vehicle is connected
	and (isActive = True implies startDate.unixTime <= Now.unixTime and Now.unixTime <= endDate.unixTime)
	and (isActive = True implies socket.connectedVehicle != none)
}

one sig eMSP {
	users: some User,
	knownCPMSs: some CPMS,
	bookings: some Booking
} {
	//No user outside of the eMSP
	all u : User | u in users
}

//The CS->CPO one-to-one relation can be inferred by going through here
sig CPMS {
	operatingManually: one Bool,
	CSs: some CS,
	knownDSOs: some DSO,
	owner: one CPO,
	policy: one Policy
}

sig Policy {
	weights: set Int,
	thresholds: set Int
} {
	//Weights and thresholds must be positive integers
	all w: Int | w in weights implies w >= 0
	and all t: Int | t in thresholds implies t >= 0
}

sig BatteryUsagePolicy {
	weights: set Int,
	thresholds: set Int
} {
	//Weights and thresholds must be positive integers
	all w: Int | w in weights implies w >= 0
	and all t: Int | t in thresholds implies t >= 0
}

sig CS {
	socketCount: one Int,
	location: one Location,
	nominalPrice: one Int,
	userPrice: one Int,
	offerExpirationDate: one Date,
	chargingFromBatteries: one Bool,
	rechargingBatteries: one Bool,
	sockets: some Socket,
	batteries: set Battery,
	currentDSO: one DSO,
	batteryUsagePolicy: one BatteryUsagePolicy
} {
	socketCount > 0
	and nominalPrice > 0
	and userPrice > 0
	//Lets avoid givin electricity away for free...
	and userPrice <= nominalPrice
	and nominalPrice >= currentDSO.price
	//Force the system to never charge the batteries and discharge them at the same time
	and (not ((chargingFromBatteries = True) and (rechargingBatteries = True)))
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
	//As a percentage it must be between 1 and 100 (-> 10 for integer limitations in alloy)
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

//No two users with the same email or userName
//Fine for payment methods being used for more than one User
fact noUsersWithSameEmail {
	no u1, u2: User | u1 != u2 and (u1.email = u2.email or u1.userName = u2.userName)
}

//No two CPOs can share the same name
fact noCPOsWithSameName {
	no c1, c2: CPO | c1 != c2 and c1.name = c2.name
}

//Company names 1:1 with companies
fact companyNamesToCompanies {
	all n : CompanyName | ((one c : CPO | c.name = n) or (one d : DSO | d.name = n)) and !((one c : CPO | c.name = n) and (one d : DSO | d.name = n))
}

//No unused Passwords
fact noUnusedPasswords {
	all p : Password | (some u : User | u.password = p)
}

//No unused Payment Methods
fact noUnusedPaymentMethods {
	all p : PaymentMethod | (some u : User | u.paymentMethod = p)
}

//No two DSOs can share the same name
fact noDSOsWIthSameName {
	no d1, d2: DSO | d1 != d2 and d1.name = d2.name
}

//No CPO and DSO can share the same name
fact noCPODSOWithSameName {
	no c: CPO, d: DSO | c.name = d.name
}

//Each CPO must be 1:1 with its CPMS
fact CPOOneToOneCPMS {
	no cp1, cp2: CPMS | cp1 != cp2 and cp1.owner = cp2.owner
}

//No booking can be without a User associated to it
fact noBookingsWithoutUsers {
	all b: Booking | (one u: User | b in u.bookings)
}

//No expired booking must be in the system
fact noExpiredBookings {
	all b: Booking | b.endDate.unixTime >= Now.unixTime
}

//No two bookings with overlapping time frames must be for the same socket
fact noOverlappingSocketBookings {
	all b1, b2: Booking | (b1 = b2 or b1.socket != b2.socket or (b1.startDate.unixTime < b2.startDate.unixTime and b1.endDate.unixTime <= b2.startDate.unixTime)
	or (b2.startDate.unixTime < b1.startDate.unixTime and b2.endDate.unixTime <= b1.startDate.unixTime))
}

//Every socket must be free if it is not booked
fact socketFreeIfNotBooked {
	all s: Socket | ((no b: Booking | b.socket = s)
	implies 
	no s.connectedVehicle)
}

//No socket should be free if there is an active booking on it
fact socketNotFreeIfActiveBooking {
	all s: Socket | ((some b: Booking | b.socket = s and b.isActive = True)
	implies 
	s.connectedVehicle != none)
}

//All CSs must be associated to one and only one CPMS
fact allCSHaveACPMS {
	all cs: CS | (one cpm: CPMS | cs in cpm.CSs)
}

//Each Socket must be related to one and only one CS
fact uniqueSocketsForCS {
	no cs1, cs2: CS | cs1 != cs2 and (some s: Socket | s in cs1.sockets and s in cs2.sockets)
}

//No CS of an unknown CPMS should be booked by an eMSP User
fact noBookingsOverUnknownCPMSs {
	no b : Booking | (some cpms : CPMS | b.socket in cpms.CSs.sockets and (no e : eMSP | cpms in e.knownCPMSs))
}

//Add User booking
pred addUserBooking[u0, u1: User, b: Booking] {
	u1.bookings = u0.bookings + b
}

//Booking deletion
pred delUserBooking[u0, u1: User, b: Booking] {
	u1.bookings = u0.bookings - b
}

//Start charging process
pred startUserCharge[b0, b1: Booking, v: Vehicle] {
	b1.socket.currentPower = b0.socket.maxPower
	b1.socket.connectedVehicle = v
	b1.isActive = True
}

//End charge
pred endUserCharge[b0, b1: Booking, v: Vehicle] {
	b1.socket.currentPower = 0
	b1.socket.connectedVehicle = none
	b1.isActive = False
}

//Assign energy source and policy
pred changeEnergySource[d1: DSO, es: EnergyMix] {
	d1.energyMix = es
}

//Change CPMS policy
pred changeCPMSPolicy[c: CPMS, p: Policy] {
	c.policy = p
}

//Change nominal and user price
pred changePrices[c0, c1: CS, np: Int, up: Int] {
	c1.nominalPrice = np
	c1.userPrice = up
}

//Check that we dont't have overlapping bookings on the same Socket of the same CS
assert noOverlapForSocket {
	no disj b1, b2: Booking | (b1.socket = b2.socket and (b1.startDate.unixTime >= b2.startDate.unixTime and b1.startDate.unixTime < b2.startDate.unixTime))
}
//check noOverlapForSocket


run {} for 12 but 6 Int, exactly 3 User, exactly 3 Password, exactly 3 PaymentMethod, exactly 3 CS, exactly 2 CPMS, exactly 3 Booking
//run {} for 12 but 6 Int, exactly 2 User, exactly 1 CS, exactly 1 CPMS, exactly 3 Booking, exactly 1 DSO