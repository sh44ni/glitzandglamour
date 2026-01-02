import Card from './ui/Card';
import { Service } from '@/types';

interface ServiceCardProps {
    service: Service;
}

export default function ServiceCard({ service }: ServiceCardProps) {
    return (
        <Card className="flex justify-between items-start gap-4">
            <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-lg">{service.name}</h3>
                {service.description && (
                    <p className="text-gray-500 text-sm mt-1">{service.description}</p>
                )}
            </div>
            <div className="text-[#FF69B4] font-bold text-lg whitespace-nowrap">
                {service.price}
            </div>
        </Card>
    );
}
