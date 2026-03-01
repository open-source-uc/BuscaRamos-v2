export type icsEvent = {
  start: Date;
  end: Date;
  summary: string;
  description: string;
  location: string;
  day: "MO" | "TU" | "WE" | "TH" | "FR" | "SA" | "SU";
};

export type semester = {
  name: `${string}-${string}`;
  start: Date;
  end: Date;
  excludedDates: Date[];
};

const toICSDatetime = (date: Date) => {
  const year = date.getFullYear();
  const month = `0${date.getMonth() + 1}`.slice(-2);
  const day = `0${date.getDate()}`.slice(-2);
  const hours = `0${date.getHours()}`.slice(-2);
  const minutes = `0${date.getMinutes()}`.slice(-2);
  const seconds = `0${date.getSeconds()}`.slice(-2);
  return `${year}${month}${day}T${hours}${minutes}${seconds}`;
};

const toICSUtcDatetime = (date: Date) => {
  const year = date.getUTCFullYear();
  const month = `0${date.getUTCMonth() + 1}`.slice(-2);
  const day = `0${date.getUTCDate()}`.slice(-2);
  const hours = `0${date.getUTCHours()}`.slice(-2);
  const minutes = `0${date.getUTCMinutes()}`.slice(-2);
  const seconds = `0${date.getUTCSeconds()}`.slice(-2);
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
};

// Función para dividir líneas largas según RFC 5545 (máximo 75 caracteres)
const foldLine = (line: string): string => {
  if (line.length <= 75) return line;

  let result = line.substring(0, 75);
  let remaining = line.substring(75);

  while (remaining.length > 0) {
    const nextChunk = remaining.substring(0, 74); // 74 porque necesitamos espacio para el espacio inicial
    result += "\r\n " + nextChunk;
    remaining = remaining.substring(74);
  }

  return result;
};

export const VCalendar = (calendarEvents: string) => {
  const lines = [
    "BEGIN:VCALENDAR",
    "PRODID:-//buscaramos//CL",
    "VERSION:2.0",
    "CALSCALE:GREGORIAN",
  ];

  const calendar = lines.map(foldLine).join("\r\n") + "\r\n" + calendarEvents + "END:VCALENDAR\r\n";
  return calendar;
};

let event_id = 0;
export const eventTemplate = (e: icsEvent, s: semester) => {
  // Mapear días de ICS a números de JavaScript (0=domingo, 1=lunes, etc.)
  const dayMap = {
    SU: 0,
    MO: 1,
    TU: 2,
    WE: 3,
    TH: 4,
    FR: 5,
    SA: 6,
  };

  const eventDayOfWeek = dayMap[e.day];

  // Filtrar fechas excluidas que caigan en el mismo día de la semana que el evento
  const relevantExcludedDates = s.excludedDates.filter((excludedDate) => {
    return excludedDate.getDay() === eventDayOfWeek;
  });

  // Calcular las fechas excluidas con la hora específica del evento
  const excludedDatesWithTime = relevantExcludedDates.map((excludedDate) => {
    const eventDateTime = new Date(excludedDate);
    eventDateTime.setHours(e.start.getHours(), e.start.getMinutes(), 0, 0);
    return eventDateTime;
  });

  const semesterEndInclusive = new Date(s.end);
  semesterEndInclusive.setHours(23, 59, 59, 0);

  const exDateLines =
    excludedDatesWithTime.length > 0
      ? excludedDatesWithTime.map((date) => `EXDATE:${toICSDatetime(date)}`).join("\r\n")
      : "";

  const lines = [
    "BEGIN:VEVENT",
    `DTSTAMP:${toICSUtcDatetime(new Date())}`,
    // Export floating local times so calendar apps don't shift Chilean class hours by DST/tz parsing.
    `DTSTART:${toICSDatetime(e.start)}`,
    `DTEND:${toICSDatetime(e.end)}`,
    `RRULE:FREQ=WEEKLY;UNTIL=${toICSDatetime(semesterEndInclusive)};BYDAY=${e.day}`,
    ...(exDateLines ? exDateLines.split("\r\n") : []),
    `UID:${event_id++}@buscaramos`,
    `DESCRIPTION:${e.description}`,
    `SUMMARY:${e.summary}`,
    ...(e.location ? [`LOCATION:${e.location}`] : []),
    "END:VEVENT",
  ];

  return lines.map(foldLine).join("\r\n") + "\r\n";
};

// Thanks bv
