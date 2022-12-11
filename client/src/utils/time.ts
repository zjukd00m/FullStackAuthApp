/**
 * Given the timestamp compare it with the current time and return the formatted time difference
 * @param timestamp timestamp of the date to be compare with the current time
 * @returns the formatted time difference
 */
export const timestamp2TimeString = (timestamp: number, basetime: Date) => {
    const date = new Date(timestamp);

    const ms = Math.abs(basetime.getTime() - date.getTime());

    const hh = Math.floor(ms / ( 60 * 60 * 1000 ));

    const mm = Math.floor( ( ( (ms / 1000) - (hh * 60 * 60) ) / 60 ) ) % 60

    const ss = Math.floor(( ( ms / 1000 ) - (hh * 60 * 60 ) - ( mm * 60 ) )) % 3600;

    return `${padTime(hh)}:${padTime(mm)}:${padTime(ss)}`;
}

export const timestamp2Time = (timestamp: number) => Math.abs(new Date().getTime() - timestamp);

export const padTime = (num: number) => num.toString().padStart(2, "0");
