export function convertSQLStringToDateTimeString(sqlString: string): string {
    console.log(sqlString);
    const [dateComponents, timeComponents] = sqlString.split('T');

    const [year, day, month] = dateComponents.split('-');
    const [hours, minutes, seconds] = timeComponents.split(':');

    const date = new Date(+year, +month - 1, +day, +hours, +minutes);
    return date.toLocaleString();
}