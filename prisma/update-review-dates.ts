/**
 * Updates createdAt dates on Setmore reviews to match the original Setmore listing.
 * Run with: npx tsx prisma/update-review-dates.ts
 *
 * Reference date: 2026-03-12 (date reviews were pasted from Setmore)
 */
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const REF = new Date('2026-03-12T12:00:00Z');

function daysAgo(n: number) { const d = new Date(REF); d.setDate(d.getDate() - n); return d; }
function weeksAgo(n: number) { return daysAgo(n * 7); }
function monthsAgo(n: number) { const d = new Date(REF); d.setMonth(d.getMonth() - n); return d; }
function yearsAgo(n: number) { const d = new Date(REF); d.setFullYear(d.getFullYear() - n); return d; }

// Map: authorName (lowercase) → [ { textSnippet, date } ]
// textSnippet is a short unique fragment from the review text for disambiguation
const DATE_MAP: { name: string; snippet: string; date: Date }[] = [
    { name: 'dee', snippet: 'accommodated me last minute', date: daysAgo(2) },
    { name: 'diana escatel', snippet: 'encantó el servicio', date: daysAgo(3) },
    { name: 'martinez', snippet: 'amazing job every time', date: daysAgo(3) },
    { name: 'michille grosse', snippet: 'true professional', date: daysAgo(3) },
    { name: 'kaitlyn leiva', snippet: 'good vibes, good conversation', date: daysAgo(4) },
    { name: 'guadalupe lopez', snippet: 'went to this nail salon', date: weeksAgo(2) },
    { name: 'yesenia sanchez', snippet: 'jojany was amazing! she was so kind', date: weeksAgo(2) },
    { name: 'kaylee', snippet: 'first off the vibe', date: weeksAgo(2) },
    { name: 'janet d', snippet: 'total vibe!!!', date: weeksAgo(2) },
    { name: 'gloria jimenez', snippet: 'goes above and beyond', date: weeksAgo(2) },
    { name: 'daniela castillo', snippet: 'excelente trabajo', date: weeksAgo(3) },
    { name: 'olivia tate', snippet: 'exceeded my expectations', date: weeksAgo(3) },
    { name: 'maryjane munoz', snippet: 'loved every minute', date: monthsAgo(1) },
    { name: 'anel brito ramírez', snippet: 'excelente servicio', date: monthsAgo(1) },
    { name: 'yajaira domínguez', snippet: 'layered cut', date: monthsAgo(1) },
    { name: 'fatima magana', snippet: 'a gem!', date: monthsAgo(1) },
    { name: 'miriah krahn', snippet: 'amazing, amazing, amazing', date: monthsAgo(3) },
    { name: 'yadira ledesma', snippet: 'short notice', date: monthsAgo(3) },
    { name: 'cheyanne jauregui', snippet: 'updo and glam', date: monthsAgo(3) },
    { name: 'hope holt', snippet: 'marine ball', date: monthsAgo(3) },
    { name: 'janeya avelar', snippet: "husband's ball", date: monthsAgo(4) },
    { name: 'kimberly', snippet: 'got my nails done with jojo', date: monthsAgo(4) },
    { name: 'maria bonilla', snippet: 'balayage hair color', date: monthsAgo(4) },
    { name: 'jazmin zamora', snippet: "obsessed with my hair cut", date: monthsAgo(4) },
    { name: 'gloria', snippet: 'cut, colored and layered', date: monthsAgo(4) },
    { name: 'larissa', snippet: "she's very very kind", date: monthsAgo(4) },
    { name: 'hailey love', snippet: '3-in-1 appointment', date: monthsAgo(5) },
    { name: 'jennifer pope', snippet: 'gel x set', date: monthsAgo(5) },
    { name: 'lannie presley', snippet: 'quick booking', date: monthsAgo(5) },
    { name: 'lilith jane', snippet: 'nail tech in vista', date: monthsAgo(5) },
    { name: 'mari-irene', snippet: 'loved my facial', date: monthsAgo(5) },
    { name: 'yurivia', snippet: 'particial highlights', date: monthsAgo(5) },
    { name: 'liz', snippet: 'amazing customer service', date: monthsAgo(5) },
    { name: 'emily mendez', snippet: 'comfortable and welcome in her chair', date: monthsAgo(5) },
    { name: 'eva', snippet: 'brazilian blowout', date: monthsAgo(5) },
    { name: 'sujey', snippet: 'right place to get a haircut', date: monthsAgo(5) },
    { name: 'jeshua escalera', snippet: 'gracias', date: monthsAgo(6) },
    { name: 'jeshua escalera', snippet: 'well worth the drive', date: monthsAgo(6) },
    { name: 'jazmin keenan', snippet: 'really enjoyed my experience', date: monthsAgo(6) },
    { name: 'evelyn marez', snippet: 'jojo did so good on my hair! 10/10', date: monthsAgo(6) },
    { name: 'ana g valdivia valadez', snippet: 'tuvimos muy buena', date: monthsAgo(6) },
    { name: 'ella jurasko', snippet: 'blackest black', date: monthsAgo(6) },
    { name: 'diana s ortiz', snippet: 'definitely book with jojany', date: monthsAgo(6) },
    { name: 'amy anderson', snippet: 'second time booking', date: monthsAgo(6) },
    { name: 'karina a', snippet: "obsessed with my nails! 💅", date: monthsAgo(6) },
    { name: 'maria carson', snippet: 'freestyle the rest', date: monthsAgo(6) },
    { name: 'happy client', snippet: "sweetest ever and her prices", date: monthsAgo(6) },
    { name: 'adri sánchez', snippet: 'magical hands', date: monthsAgo(6) },
    { name: 'rosita m', snippet: 'facebook marketplace', date: monthsAgo(7) },
    { name: 'nicole hayward', snippet: 'july 16', date: monthsAgo(7) },
    { name: 'daniella bonilla', snippet: 'copy and paste my inspo', date: monthsAgo(7) },
    { name: 'lexie kondo', snippet: 'exactly how i wanted', date: monthsAgo(8) },
    { name: 'maria bonilla', snippet: 'best stylist', date: monthsAgo(8) },
    { name: 'stella', snippet: 'red hair color removed', date: monthsAgo(8) },
    { name: 'kristen', snippet: '40 years', date: monthsAgo(8) },
    { name: 'sandy navarrete', snippet: 'sweetest and kindest', date: monthsAgo(8) },
    { name: 'kathryn patten', snippet: 'curtain bangs', date: monthsAgo(8) },
    { name: 'noemy garcia', snippet: 'dedication to listening', date: monthsAgo(8) },
    { name: 'jadyn', snippet: 'loveddddd my haircut and style', date: monthsAgo(8) },
    { name: 'ana', snippet: "cutting hair in her garage", date: monthsAgo(8) },
    { name: 'stephanie', snippet: 'didn\'t damage nor give me a color', date: monthsAgo(8) },
    { name: 'jennifer talamantes', snippet: 'second person to do my hair', date: monthsAgo(8) },
    { name: 'diana', snippet: 'all in one tech', date: monthsAgo(8) },
    { name: 'joselyn ortiz', snippet: 'really clean and the service', date: monthsAgo(8) },
    { name: 'marfy cruz', snippet: 'worked with my schedule', date: monthsAgo(8) },
    { name: 'angelina', snippet: 'haircut and blowout and left feeling', date: monthsAgo(8) },
    { name: 'denise tapia', snippet: 'best haircut!!', date: monthsAgo(8) },
    { name: 'jazzy', snippet: 'great experience getting my hair cut and dyed', date: monthsAgo(8) },
    { name: 'evelyn m', snippet: 'amazing job with my hair, she is very sweet', date: monthsAgo(8) },
    { name: 'vanessa carvajal', snippet: 'fit me in last minute', date: monthsAgo(8) },
    { name: 'cheyenne smith', snippet: 'this girl is incredible', date: monthsAgo(8) },
    { name: 'mayra l', snippet: 'exactly what i wanted', date: monthsAgo(9) },
    { name: 'jesselyn hanson', snippet: "haven't done my nails in a few years", date: monthsAgo(9) },
    { name: 'hailey', snippet: 'grow my hair out', date: monthsAgo(9) },
    { name: 'natalia', snippet: 'everything went smooth', date: monthsAgo(9) },
    { name: 'jacky', snippet: 'nails ,toes', date: monthsAgo(9) },
    { name: 'karina', snippet: "my mom's nails", date: monthsAgo(9) },
    { name: 'esmeralda jimenez', snippet: "didn't have anything in mind", date: monthsAgo(9) },
    { name: 'lucero vargas', snippet: 'replied fast', date: monthsAgo(9) },
    { name: 'yahiara', snippet: "LOVED my haircut! Listened", date: monthsAgo(9) },
    { name: 'mireya', snippet: 'hair and makeup and she', date: monthsAgo(9) },
    { name: 'febe griffin', snippet: "loved my haircut! i'm definitely", date: monthsAgo(9) },
    { name: 'amaris mora', snippet: 'loveeeeed my haircut', date: monthsAgo(9) },
    { name: 'rosa montanez', snippet: 'great experience love my make up', date: monthsAgo(9) },
    { name: 'aileen', snippet: 'friendly and patient', date: monthsAgo(9) },
    { name: 'anisa', snippet: 'talked an laughed', date: monthsAgo(9) },
    { name: 'sarai gonzalez', snippet: 'patient, sweet, and talkative', date: monthsAgo(9) },
    { name: 'jess ponce', snippet: "she's the best", date: monthsAgo(9) },
    { name: 'melissa diaz', snippet: 'different color shades', date: monthsAgo(9) },
    { name: 'kaitlyn', snippet: 'nails are flawless', date: monthsAgo(9) },
    { name: 'aylin', snippet: 'loved going to jojo for my nails', date: monthsAgo(9) },
    { name: 'emma montanez', snippet: 'amazing job at my makeup and hair', date: monthsAgo(9) },
    { name: 'alyssa hicks', snippet: 'above and beyond, not only did she make my hair', date: monthsAgo(9) },
    { name: 'meredith weissberg', snippet: 'better than the original picture', date: monthsAgo(9) },
    { name: 'america', snippet: "she makes you feel comfortable and she's super funny", date: monthsAgo(9) },
    { name: 'amalia', snippet: 'curly, she brought it back life', date: monthsAgo(9) },
    { name: 'ashley', snippet: 'first time meeting her and she made me feel so comfortable and welcoming', date: monthsAgo(9) },
    { name: 'ashley barrera', snippet: 'treatment for hair loss', date: monthsAgo(9) },
    { name: 'tania aguirre', snippet: 'recomiendo el lugar', date: monthsAgo(9) },
    { name: 'sharon', snippet: 'chillest nail tech', date: monthsAgo(10) },
    { name: 'alejandra', snippet: 'jojoany did an amazing job', date: monthsAgo(10) },
    { name: 'emily', snippet: 'years of box dye', date: monthsAgo(10) },
    { name: 'jeni', snippet: 'passion and patience', date: monthsAgo(10) },
    { name: 'gloria j', snippet: 'great personality. she understood', date: monthsAgo(10) },
    { name: 'isabel', snippet: '#passionate #friendly', date: monthsAgo(10) },
    { name: 'mona lysa vasquez', snippet: 'book now', date: monthsAgo(10) },
    { name: 'ahtziri', snippet: 'loved how my hair came out plus layers', date: monthsAgo(10) },
    { name: 'priscilla lavender', snippet: 'first appointment and let me tell you', date: monthsAgo(10) },
    { name: 'dykesha chavers', snippet: "daughter's nails", date: monthsAgo(10) },
    { name: 'fatima m', snippet: 'military spouse', date: monthsAgo(11) },
    { name: 'katelyn perez', snippet: 'first one to get my nails the way', date: monthsAgo(11) },
    { name: 'sharon corona', snippet: 'acrylic fill with some nail designs', date: monthsAgo(11) },
    { name: 'nikki zuchowsky', snippet: 'favorite nail tech', date: monthsAgo(11) },
    { name: 'jaye lynn', snippet: 'brought my little with me', date: monthsAgo(11) },
    { name: 'angelica', snippet: 'last minute and did wonderfully', date: yearsAgo(1) },
    { name: 'denise tapia', snippet: 'not sure if my other review posted', date: yearsAgo(1) },
    { name: 'denise tapia', snippet: 'went here today', date: yearsAgo(1) },
    { name: 'danna waddington', snippet: 'light hand with makeup', date: yearsAgo(1) },
    { name: 'auie gunn', snippet: 'jolany', date: yearsAgo(1) },
    { name: 'hirely villalobos', snippet: 'incredible job on my hair', date: yearsAgo(1) },
];

async function main() {
    console.log('Updating review dates...');

    // Delete all Setmore reviews that already exist so we can re-insert with correct dates
    const deleted = await prisma.review.deleteMany({ where: { source: 'setmore' } });
    console.log(`Cleared ${deleted.count} Setmore reviews`);

    let updated = 0;
    let skipped = 0;

    for (const entry of DATE_MAP) {
        // Find the matching review by author name + text snippet
        const reviews = await prisma.review.findMany({
            where: {
                source: 'setmore',
                authorName: { equals: entry.name, mode: 'insensitive' },
            },
        });

        if (reviews.length === 0) {
            // Not found — skip (review may not be in DB yet)
            skipped++;
            continue;
        }

        // Match by text snippet if multiple reviews from same person
        const match = reviews.find(r => r.text.toLowerCase().includes(entry.snippet.toLowerCase()))
            ?? reviews[0];

        await prisma.review.update({
            where: { id: match.id },
            data: { createdAt: entry.date },
        });
        updated++;
    }

    console.log(`✅ Updated: ${updated}, Skipped (not in DB): ${skipped}`);
    await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
