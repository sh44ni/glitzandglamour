export function format12h(timeStr?: string | null): string {
    if (!timeStr) return '';
    const trimmed = String(timeStr).trim();
    if (!trimmed) return '';

    // Match patterns like "3:00 PM", "3:00 PM AM", "15:00", "09:45"
    const match = trimmed.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*([aApP]\.?[mM]\.?)?/);
    if (match) {
        let hour = parseInt(match[1], 10);
        const minute = match[2];
        let ampm = match[3] ? match[3].toUpperCase().replace(/\./g, '') : null;

        if (ampm) {
            // Already includes AM / PM
            if (hour === 0) hour = 12;
            else if (hour > 12) hour = hour % 12 || 12;
            return `${hour}:${minute} ${ampm}`;
        } else {
            // 24-hour military time like "15:00"
            ampm = hour >= 12 ? 'PM' : 'AM';
            hour = hour % 12 || 12;
            return `${hour}:${minute} ${ampm}`;
        }
    }

    return trimmed;
}
