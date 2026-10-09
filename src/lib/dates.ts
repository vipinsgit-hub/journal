/**
 * Date manipulation utilities for Trading Journal.
 * All date-only calculations avoid UTC offset shifts by treating YYYY-MM-DD strings explicitly.
 */

export interface CalendarCellDate {
  dateString: string; // YYYY-MM-DD
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
}

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateString(dateString: string, options?: Intl.DateTimeFormatOptions): string {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-').map(Number);
  if (!year || !month || !day) return dateString;

  // Use local date constructor without UTC conversion issues
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString(
    'en-US',
    options || { month: 'short', day: 'numeric', year: 'numeric' }
  );
}

export function formatFullDate(dateString: string): string {
  return formatDateString(dateString, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getMonthName(monthIndex: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[monthIndex] || '';
}

/**
 * Returns array of CalendarCellDate for a Monday-Sunday calendar grid for a given year and month (0-indexed).
 */
export function getCalendarGrid(year: number, month: number): CalendarCellDate[] {
  const todayStr = getTodayDateString();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const daysInMonth = lastDayOfMonth.getDate();

  // JavaScript getDay(): 0 = Sun, 1 = Mon, ..., 6 = Sat
  // For Monday-first grid: Mon=0, Tue=1, Wed=2, Thu=3, Fri=4, Sat=5, Sun=6
  const jsFirstDay = firstDayOfMonth.getDay();
  const mondayFirstPadding = jsFirstDay === 0 ? 6 : jsFirstDay - 1;

  const grid: CalendarCellDate[] = [];

  // Trailing days from previous month
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;

  for (let i = mondayFirstPadding - 1; i >= 0; i--) {
    const dayNum = prevMonthLastDay - i;
    const mStr = String(prevMonth + 1).padStart(2, '0');
    const dStr = String(dayNum).padStart(2, '0');
    const dateStr = `${prevYear}-${mStr}-${dStr}`;

    const jsDayOfWeek = new Date(prevYear, prevMonth, dayNum).getDay();
    grid.push({
      dateString: dateStr,
      dayNumber: dayNum,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      isWeekend: jsDayOfWeek === 0 || jsDayOfWeek === 6,
    });
  }

  // Current month days
  for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
    const mStr = String(month + 1).padStart(2, '0');
    const dStr = String(dayNum).padStart(2, '0');
    const dateStr = `${year}-${mStr}-${dStr}`;

    const jsDayOfWeek = new Date(year, month, dayNum).getDay();
    grid.push({
      dateString: dateStr,
      dayNumber: dayNum,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
      isWeekend: jsDayOfWeek === 0 || jsDayOfWeek === 6,
    });
  }

  // Leading days for next month to complete full 7-column rows (35 or 42 cells total)
  const totalCells = grid.length <= 35 ? 35 : 42;
  const remainingCells = totalCells - grid.length;
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;

  for (let dayNum = 1; dayNum <= remainingCells; dayNum++) {
    const mStr = String(nextMonth + 1).padStart(2, '0');
    const dStr = String(dayNum).padStart(2, '0');
    const dateStr = `${nextYear}-${mStr}-${dStr}`;

    const jsDayOfWeek = new Date(nextYear, nextMonth, dayNum).getDay();
    grid.push({
      dateString: dateStr,
      dayNumber: dayNum,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      isWeekend: jsDayOfWeek === 0 || jsDayOfWeek === 6,
    });
  }

  return grid;
}
