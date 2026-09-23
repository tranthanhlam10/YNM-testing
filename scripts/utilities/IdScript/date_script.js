function getMonthRange(monthYear) {

    const [month, year] = monthYear.split('/').map(num => parseInt(num, 10));
    

    const firstDayUTC = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
    

    const lastDayUTC = new Date(Date.UTC(year, month, 0, 23, 59, 59));
    
    const firstDayAdjusted = new Date(firstDayUTC);
    firstDayAdjusted.setHours(firstDayUTC.getHours() - 7);
    
    const lastDayAdjusted = new Date(lastDayUTC);
    lastDayAdjusted.setHours(lastDayUTC.getHours() - 7);
    

    const firstDayFormatted = firstDayAdjusted.toISOString().slice(0, 19) + 'Z';
    const lastDayFormatted = lastDayAdjusted.toISOString().slice(0, 19) + 'Z';

    return `[${firstDayFormatted} TO ${lastDayFormatted}]`;
}

const result = getMonthRange("05/2024");
console.log(result);
