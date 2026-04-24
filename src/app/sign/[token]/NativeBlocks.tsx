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
                        return <p key={i} className="csP">{b.text}</p>;
                    case 'list':
                        return b.ordered ? (
                            <ol key={i} className="csList">{b.items.map((it, j) => <li key={j}>{it}</li>)}</ol>
                        ) : (
                            <ul key={i} className="csList">{b.items.map((it, j) => <li key={j}>{it}</li>)}</ul>
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
                    case 'callout': {
                        const isPayment = b.text.startsWith('Payment Accounts');
                        if (isPayment) {
                            const lines = [
                                { icon: '💸', label: 'Zelle', value: '(760) 290-5910 or jojanylavalle@icloud.com' },
                                { icon: '💵', label: 'Cash App', value: '$glitzandglamours' },
                                { icon: '📲', label: 'Venmo', value: '@glitzandglamours' },
                                { icon: '💳', label: 'Credit Card', value: 'Processed via Stripe — surcharge may apply' },
                                { icon: '💳', label: 'Debit Card', value: 'Processed via Stripe — no surcharge' },
                            ];
                            return (
                                <div key={i} className="csCallout csCalloutPay">
                                    <div className="csPayTitle">💰 Payment Accounts</div>
                                    {lines.map((l, j) => (
                                        <div key={j} className="csPayLine">
                                            <span className="csPayIcon">{l.icon}</span>
                                            <span className="csPayLabel">{l.label}:</span>
                                            <span className="csPayVal">{l.value}</span>
                                        </div>
                                    ))}
                                </div>
                            );
                        }
                        return (
                            <div key={i} className={`csCallout ${b.variant === 'warning' ? 'csCalloutWarn' : 'csCalloutInfo'}`}>
                                {b.text}
                            </div>
                        );
                    }
                    default:
                        return null;
                }
            })}
        </div>
    );
}
