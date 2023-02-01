export function convertSQLStringToDateTimeString(sqlString: string): string {
    console.log(sqlString);
    const [dateComponents, timeComponents] = sqlString.split('T');

    const [year, day, month] = dateComponents.split('-');
    const [hours, minutes, seconds] = timeComponents.split(':');

    const date = new Date(+year, +month - 1, +day, +hours, +minutes);
    return date.toLocaleString();
}

export function reduceFullDateString(dateStr: string): string {
    const [weekDay, month, day, year, time] = dateStr.split(' ');
    const [hr, min] = time.split(':');
    return weekDay + " " + month + " " + day + " " + year + " " + hr + ":" + min;
}