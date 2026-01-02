import { Service, ServiceCategory } from '@/types';

// All services with exact pricing from requirements
export const services: Service[] = [
    // Nail Services
    { id: 'full-set', name: 'Full Set', price: '$55 & up', description: 'varies by design', category: 'nails' },
    { id: 'gelx', name: 'GelX', price: '$60 & up', category: 'nails' },
    { id: 'fill', name: 'Fill', price: '$35', description: '3-4 weeks max', category: 'nails' },
    { id: 'rebalance', name: 'Rebalance', price: '$60', description: '1+ month growth', category: 'nails' },
    { id: 'new-design', name: 'New Design', price: '$60 & up', category: 'nails' },
    { id: 'soak-off-my-work', name: 'Soak Off (my work)', price: '$30', category: 'nails' },
    { id: 'foreign-soak-off', name: 'Foreign Soak Off', price: '$50', category: 'nails' },

    // Pedicures
    { id: 'classic-foot-detox', name: 'Classic Foot Soak Detox', price: '$65', description: 'Cuticle clean up • Callus removal • New polish • Relaxing massage', category: 'pedicures' },
    { id: 'jelly-hydrating-detox', name: 'Jelly Hydrating Foot Detox', price: '$75', description: 'Cuticle clean up • Callus removal • Exfoliation', category: 'pedicures' },

    // Add-Ons
    { id: 'nail-design', name: 'Nail design', price: '$15', category: 'addons' },
    { id: 'rhinestones', name: 'Rhinestones', price: '$5', category: 'addons' },
    { id: 'acrylic-toes', name: 'Acrylic toes', price: '$45', category: 'addons' },

    // Waxing Services
    { id: 'upper-lip', name: 'Upper Lip', price: '$10', category: 'waxing' },
    { id: 'eyebrow-wax', name: 'Eyebrow Wax', price: '$12', category: 'waxing' },
    { id: 'underarm', name: 'Underarm', price: '$20', category: 'waxing' },
    { id: 'sideburns', name: 'Sideburns', price: '$15', category: 'waxing' },
    { id: 'brazilian', name: 'Brazilian', price: '$60', category: 'waxing' },

    // Facial Services
    { id: 'mini-facials', name: 'Mini Facials', price: '$30', description: 'Ingrown extraction • Steam to loosen dead skin cells • Hydrating enzyme mask • Perfect post-wax treatment', category: 'facials' },
    { id: 'basic-facial', name: 'Basic Facial', price: '$75', description: 'Cleansing, exfoliation, mask & massage', category: 'facials' },
    { id: 'deep-cleansing-facial', name: 'Deep Cleansing + Extraction Facial', price: '$85', description: 'Deep pore cleanse, exfoliation, extractions & relaxing facial massage', category: 'facials' },
    { id: 'anti-aging-facial', name: 'Anti-Aging & Enzyme Facial', price: '$100', description: 'Includes exfoliation, extractions, cupping to boost blood flow, & soothing facial massage', category: 'facials' },
];

// Grouped services by category
export const serviceCategories: ServiceCategory[] = [
    {
        id: 'nails',
        name: 'Nail Services',
        services: services.filter(s => s.category === 'nails'),
    },
    {
        id: 'pedicures',
        name: 'Pedicures',
        services: services.filter(s => s.category === 'pedicures'),
    },
    {
        id: 'addons',
        name: 'Add-Ons',
        services: services.filter(s => s.category === 'addons'),
    },
    {
        id: 'waxing',
        name: 'Waxing Services',
        services: services.filter(s => s.category === 'waxing'),
    },
    {
        id: 'facials',
        name: 'Facial Services',
        services: services.filter(s => s.category === 'facials'),
    },
];

// Get all service names for booking dropdown
export const getServiceOptions = (): { value: string; label: string }[] => {
    return services.map(service => ({
        value: service.id,
        label: `${service.name} - ${service.price}`,
    }));
};

// Get service by ID
export const getServiceById = (id: string): Service | undefined => {
    return services.find(s => s.id === id);
};
