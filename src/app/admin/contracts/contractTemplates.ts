import type { ContractType } from '@/lib/contracts/specialEventConstants';

/** Field types supported by the dynamic renderer */
export type DynFieldType = 'text' | 'number' | 'date' | 'tel' | 'select' | 'textarea';

export type DynField = {
    key: string;
    label: string;
    type: DynFieldType;
    placeholder?: string;
    options?: string[];
    defaultValue?: string;
    required?: boolean;
    half?: boolean;          // render at half-width in a grid row
};

export type TemplateGroup = { label: string; keys: string[] };

export type ContractTemplate = {
    title: string;
    description: string;
    tags: string[];
    sectionTitle: string;
    /** Which contract type HTML to use */
    contractType: ContractType;
    /** Language for display */
    language: 'en' | 'es';
    /** Whether this template is available (false = Coming Soon) */
    available: boolean;
    dynamicFields: DynField[];
};

/* ── optgroup definitions ── */
export const TEMPLATE_GROUPS: TemplateGroup[] = [
    { label: '🇺🇸 English Contracts', keys: ['GGS-SVC-001', 'GGS-SVC-002', 'GGS-SVC-003'] },
    { label: '🇪🇸 Spanish Contracts', keys: ['GGS-SVC-001ES', 'GGS-SVC-002ES', 'GGS-SVC-003ES'] },
];

/* ── all templates ── */
export const CONTRACT_TEMPLATES: Record<string, ContractTemplate> = {
    /* ────── ENGLISH ────── */
    'GGS-SVC-001': {
        title: 'GGS-SVC-001 — On-Location Service Contract',
        description:
            "Comprehensive contract for beauty services provided at the client's chosen location. Includes travel provisions, parking & access fees, and on-site workspace requirements.",
        tags: ['Location address', 'Travel fees', 'On-site workspace', 'Parking/access', 'Service timeline'],
        sectionTitle: 'On-Location Service Details',
        contractType: 'on-location',
        language: 'en',
        available: true,
        dynamicFields: [
            { key: 'locationAddress', label: 'Complete Location Address *', type: 'text', placeholder: 'Street, City, State, ZIP', required: true },
            { key: 'travelDistance', label: 'Travel Distance (miles)', type: 'number', placeholder: '0', half: true },
            { key: 'travelFee', label: 'Travel Fee ($)', type: 'number', placeholder: '0.00', half: true },
            { key: 'accessInstructions', label: 'Location Access Instructions', type: 'textarea', placeholder: 'Parking info, building access codes, contact person on-site...' },
        ],
    },
    'GGS-SVC-002': {
        title: 'GGS-SVC-002 — In-Studio Service Contract',
        description:
            'Contract for beauty services performed at Glitz & Glamour Studio (812 Frances Dr, Vista, CA 92084). Includes studio policies, parking, workspace, and guest policies.',
        tags: ['Studio location', 'Parking policies', 'Guest/pet policies', 'Studio workspace', 'Service timeline'],
        sectionTitle: 'In-Studio Service Details',
        contractType: 'in-studio',
        language: 'en',
        available: true,
        dynamicFields: [
            { key: 'parkingNotes', label: 'Parking / Access Notes', type: 'textarea', placeholder: 'Any specific parking or access information for the client...' },
        ],
    },
    'GGS-SVC-003': {
        title: 'GGS-SVC-003 — Model Release Form',
        description:
            'Legal release form granting permission to use likeness in photographs/videos for specified purposes. Required for promotional and portfolio use.',
        tags: ['Model name', 'Usage permissions', 'Duration', 'Compensation'],
        sectionTitle: 'Model Release Information',
        contractType: 'on-location',
        language: 'en',
        available: false, // Coming Soon
        dynamicFields: [],
    },

    /* ────── SPANISH ────── */
    'GGS-SVC-001ES': {
        title: 'GGS-SVC-001ES — Contrato de Servicios a Domicilio (Español)',
        description:
            'Contrato completo para servicios de belleza en la ubicación elegida por el cliente. Incluye viaje, acceso y requisitos del sitio.',
        tags: ['Dirección', 'Gastos de viaje', 'Estacionamiento/acceso'],
        sectionTitle: 'Campos de Servicio en Ubicación',
        contractType: 'on-location-es',
        language: 'es',
        available: true,
        dynamicFields: [
            { key: 'locationAddress', label: 'Dirección Completa de la Ubicación *', type: 'text', placeholder: 'Calle, Ciudad, Estado, ZIP', required: true },
            { key: 'travelDistance', label: 'Distancia de Traslado (millas)', type: 'number', placeholder: '0', half: true },
            { key: 'travelFee', label: 'Tarifa de Traslado ($)', type: 'number', placeholder: '0.00', half: true },
            { key: 'accessInstructions', label: 'Instrucciones de Acceso a la Ubicación', type: 'textarea', placeholder: 'Estacionamiento, códigos de acceso, persona de contacto en sitio...' },
        ],
    },
    'GGS-SVC-002ES': {
        title: 'GGS-SVC-002ES — Contrato de Servicios en Estudio (Español)',
        description:
            'Contrato para servicios de belleza en las instalaciones de Glitz & Glamour Studio. Incluye políticas de estudio y estacionamiento.',
        tags: ['Estudio', 'Estacionamiento', 'Políticas de estudio'],
        sectionTitle: 'Campos de Servicio en Estudio',
        contractType: 'in-studio-es',
        language: 'es',
        available: true,
        dynamicFields: [
            { key: 'parkingNotes', label: 'Notas de Estacionamiento / Acceso', type: 'textarea', placeholder: 'Información específica de estacionamiento o acceso para el cliente...' },
        ],
    },
    'GGS-SVC-003ES': {
        title: 'GGS-SVC-003ES — Formulario de Liberación (Español)',
        description:
            'Formulario de liberación legal para uso de imagen. Requerido para uso promocional y de portafolio.',
        tags: ['Nombre del modelo', 'Permisos de uso', 'Duración'],
        sectionTitle: 'Información de Liberación',
        contractType: 'on-location-es',
        language: 'es',
        available: false, // Coming Soon
        dynamicFields: [],
    },
};

/** Collect all unique dynamic field keys (for initialising form state). */
export function allDynamicFieldKeys(): string[] {
    const keys = new Set<string>();
    for (const t of Object.values(CONTRACT_TEMPLATES)) {
        for (const f of t.dynamicFields) keys.add(f.key);
    }
    return [...keys];
}

/** Build default values map from all templates. */
export function dynamicFieldDefaults(): Record<string, string> {
    const map: Record<string, string> = {};
    for (const t of Object.values(CONTRACT_TEMPLATES)) {
        for (const f of t.dynamicFields) {
            if (!(f.key in map)) map[f.key] = f.defaultValue ?? '';
        }
    }
    return map;
}
