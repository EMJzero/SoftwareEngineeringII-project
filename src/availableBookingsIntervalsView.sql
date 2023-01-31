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

WITH timeSlots(start, end) AS (SELECT b1.endDate, b2.startDate FROM bookings b1 JOIN bookings b2 ON b1.cpmsId = b2.cpmsId AND b1.csId = b2.csId AND b1.socketId = b2.socketId
WHERE b1.endDate < b2.startDate AND b1.cpmsId = 1 AND b1.csId = 1 AND b1.socketId = 2 AND b1.endDate >= "2023-02-18 00:00:00" AND b2.startDate <= "2023-02-19 00:00:00" AND
NOT EXISTS
(SELECT * FROM bookings b3 WHERE b1.cpmsId = b3.cpmsId AND b1.csId = b3.csId AND b1.socketId = b3.socketId AND (b3.startDate BETWEEN b1.endDate AND b2.startDate OR b3.endDate BETWEEN b1.endDate AND b2.startDate))
UNION
(SELECT endDate, "2023-02-19 00:00:00" FROM bookings WHERE cpmsId = 1 AND csId = 1 AND socketId = 2 AND endDate < "2023-02-19 00:00:00" ORDER BY endDate DESC LIMIT 1)
UNION
(SELECT "2023-02-18 00:00:00", startDate FROM bookings WHERE cpmsId = 1 AND csId = 1 AND socketId = 2 AND startDate > "2023-02-18 00:00:00" ORDER BY startDate ASC LIMIT 1))
SELECT * FROM timeSlots