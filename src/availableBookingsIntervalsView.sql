-- CREATE VIEW availableTimeSlots(start, end, cpmsId, csId, socketId) AS SELECT b1.endDate, b2.startDate, b1.cpmsId, b1.csId, b1.socketId FROM bookings b1 JOIN bookings b2 ON b1.cpmsId = b2.cpmsId AND b1.csId = b2.csId AND b1.socketId = b2.socketId
-- WHERE b1.endDate < b2.startDate AND NOT EXISTS
-- (SELECT * FROM bookings b3 WHERE b1.cpmsId = b3.cpmsId AND b1.csId = b3.csId AND b1.socketId = b3.socketId AND (b3.startDate BETWEEN b1.endDate AND b2.startDate OR b3.startDate BETWEEN b1.endDate AND b2.startDate))
-- UNION
-- (SELECT max(endDate), '9999-12-31 23:59:59', cpmsId, csId, socketId FROM bookings)
-- UNION
-- (SELECT curdate(), min(startDate), cpmsId, csId, socketId FROM bookings);

CREATE VIEW availableTimeSlots(start, end, cpmsId, csId, socketId) AS SELECT b1.endDate, b2.startDate, b1.cpmsId, b1.csId, b1.socketId FROM bookings b1 JOIN bookings b2 ON b1.cpmsId = b2.cpmsId AND b1.csId = b2.csId AND b1.socketId = b2.socketId
WHERE b1.endDate < b2.startDate AND NOT EXISTS
(SELECT * FROM bookings b3 WHERE b1.cpmsId = b3.cpmsId AND b1.csId = b3.csId AND b1.socketId = b3.socketId AND (b3.startDate BETWEEN b1.endDate AND b2.startDate OR b3.startDate BETWEEN b1.endDate AND b2.startDate))
UNION
(SELECT endDate, '9999-12-31 23:59:59', cpmsId, csId, socketId FROM bookings ORDER BY endDate LIMIT 1)
UNION
(SELECT curdate(), startDate, cpmsId, csId, socketId FROM bookings ORDER BY endDate LIMIT 1);