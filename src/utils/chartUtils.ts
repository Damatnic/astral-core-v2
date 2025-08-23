import { MoodCheckIn } from '../types';

export interface ChartDataPoint {
    label: string;
    value: number; // Avg mood score for the day
    date: Date;
}

export const groupCheckInsByDay = (checkIns: MoodCheckIn[], days: number): ChartDataPoint[] => {
    const dataByDay: { [key: string]: { total: number; count: number } } = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const relevantCheckIns = checkIns.filter(c => {
        const checkInDate = new Date(c.timestamp);
        checkInDate.setHours(0, 0, 0, 0);
        const diffDays = Math.floor((today.getTime() - checkInDate.getTime()) / (1000 * 3600 * 24));
        return diffDays >= 0 && diffDays < days;
    });

    for (const checkIn of relevantCheckIns) {
        const dateKey = new Date(checkIn.timestamp).toISOString().split('T')[0];
        if (!dataByDay[dateKey]) {
            dataByDay[dateKey] = { total: 0, count: 0 };
        }
        dataByDay[dateKey].total += checkIn.moodScore;
        dataByDay[dateKey].count++;
    }

    const chartData: ChartDataPoint[] = [];
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateKey = date.toISOString().split('T')[0];
        const dayData = dataByDay[dateKey];

        chartData.push({
            label: date.toLocaleDateString('en-US', { weekday: 'short' }),
            value: dayData ? dayData.total / dayData.count : 0, // 0 if no data for that day
            date: date,
        });
    }

    return chartData;
};
