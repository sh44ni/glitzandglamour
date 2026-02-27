import { Service, ServiceCategory } from '@/types';

// All services with exact pricing from requirements
export const services: Service[] = [
    // Nail Services
    { id: 'acrylic-set', name: 'Acrylic Set', price: '$65 & up', description: 'Varies by design', category: 'nails' },
    { id: 'gelx', name: 'GelX', price: '$60 & up', category: 'nails' },
    { id: 'fill', name: 'Fill', price: '$35', description: '3-4 weeks max', category: 'nails' },
    { id: 'rebalance', name: 'Rebalance', price: '$55', description: '1+ month growth', category: 'nails' },
    { id: 'manicure', name: 'Manicure', price: '$40', description: 'Rubber base structure with choice of gel polish', category: 'nails' },
    { id: 'soak-off-my-work', name: 'Soak Off (my work)', price: '$30', category: 'nails' },
    { id: 'foreign-soak-off', name: 'Foreign Soak Off', price: '$50', category: 'nails' },

    // Pedicures
    { id: 'classic-foot-detox', name: 'Classic Foot Soak Detox', price: '$65', description: 'Cuticle clean up • Callus removal • New polish • Relaxing massage', category: 'pedicures' },
    { id: 'jelly-hydrating-detox', name: 'Jelly Hydrating Foot Detox', price: '$75', description: 'Cuticle clean up • Callus removal • Exfoliation', category: 'pedicures' },
    { id: 'acrylic-toes', name: 'Acrylic Toes', price: '$45', category: 'pedicures' },

    // Hair Color
    { id: 'solid-one-tone', name: 'Solid One Tone', price: '$120 & up', description: 'All blacks & browns etc.', category: 'haircolor' },
    { id: 'highlights', name: 'Highlights', price: '$380 & up', description: 'Add subtle brightness into hair for dimension', category: 'haircolor' },
    { id: 'balayage', name: 'Balayage', price: '$380 & up', description: 'More bold effect of blonde dimension', category: 'haircolor' },
    { id: 'gloss', name: 'Gloss', price: '$65', description: 'Quick shine and tone refresh that enhances color, reduces brassiness, adds shine & silkiness', category: 'haircolor' },
    { id: 'vivids', name: 'Vivids', price: '$380 & up', description: 'Bright bold fashion colors — reds, blues, pinks etc.', category: 'haircolor' },
    { id: 'creative-color', name: 'Creative Color', price: '$150 & up', description: 'Customizable bold trend-inspired hair designs like peekaboo panels, stripes, cheetah print, custom pops of color', category: 'haircolor' },

    // Haircuts
    { id: 'womens-haircut', name: 'Womens', price: '$65', description: 'Includes wash, cut and blowout', category: 'haircuts' },
    { id: 'mens-haircut', name: 'Mens', price: '$45', description: 'Fades or shear work', category: 'haircuts' },
    { id: 'kids-girls-haircut', name: 'Kids (Girls)', price: '$35', description: 'Ages 0-12, includes haircut and style', category: 'haircuts' },
    { id: 'kids-boys-haircut', name: 'Kids (Boys)', price: '$35', description: 'Ages 0-12, fades or shear work', category: 'haircuts' },

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
        id: 'haircolor',
        name: 'Hair Color',
        services: services.filter(s => s.category === 'haircolor'),
    },
    {
        id: 'haircuts',
        name: 'Haircuts',
        services: services.filter(s => s.category === 'haircuts'),
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
