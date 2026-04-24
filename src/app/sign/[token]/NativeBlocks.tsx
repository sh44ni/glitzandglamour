'use client';
import type { NativeContentBlock } from '@/lib/contracts/nativeContentBlocks';

export default function NativeBlocks({ blocks }: { blocks: NativeContentBlock[] }) {
    return (
        <div className="csProseWrap">
            {blocks.map((b, i) => {
                switch (b.type) {
                    case 'heading':
                        if (b.level <= 2) return <h2 key={i} className="csH2">{b.text}</h2>;
                        if (b.level === 3) return <h3 key={i} className="csH3">{b.text}</h3>;
                        return <h4 key={i} className="csH4">{b.text}</h4>;
                    case 'paragraph':
                        return <p key={i} className="csP" dangerouslySetInnerHTML={{ __html: b.text }} />;
                    case 'list':
                        return b.ordered ? (
                            <ol key={i} className="csList">
                                {b.items.map((it, j) => <li key={j} dangerouslySetInnerHTML={{ __html: it }} />)}
                            </ol>
                        ) : (
                            <ul key={i} className="csList">
                                {b.items.map((it, j) => <li key={j} dangerouslySetInnerHTML={{ __html: it }} />)}
                            </ul>
                        );
                    case 'keyValue':
                        return (
                            <div key={i} className="csKv">
                                <span className="csKvK">{b.label}</span>
                                <span className="csKvV">{b.value}</span>
                            </div>
                        );
                    case 'table':
                        return (
                            <div key={i} className="csTblWrap">
                                <table className="csTbl">
                                    {b.headers.length > 0 && (
                                        <thead><tr>{b.headers.map((h, j) => <th key={j}>{h}</th>)}</tr></thead>
                                    )}
                                    <tbody>
                                        {b.rows.map((row, ri) => (
                                            <tr key={ri}>{row.map((c, ci) => <td key={ci}>{c}</td>)}</tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        );
                    case 'horizontalRule':
                        return <hr key={i} className="csHr" />;
                    case 'callout':
                        return (
                            <div
                                key={i}
                                className={`csCallout ${b.variant === 'warning' ? 'csCalloutWarn' : 'csCalloutInfo'}`}
                                dangerouslySetInnerHTML={{ __html: b.text }}
                            />
                        );
                    default:
                        return null;
                }
            })}
        </div>
    );
}
