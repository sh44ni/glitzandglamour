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
        title: 'GGS-SVC-001 - On-Location Service Contract',
        description:
            "Comprehensive contract for services provided at client's chosen location. Includes travel provisions, location-specific requirements, and on-site service terms.",
        tags: ['Location address', 'Travel fees', 'Setup requirements', 'Parking/access', 'Power requirements', 'Weather contingency'],
        sectionTitle: 'On-Location Service Details',
        dynamicFields: [
            { key: 'locationAddress', label: 'Complete Location Address *', type: 'text', placeholder: 'Street, City, State, ZIP', required: true },
            { key: 'travelDistance', label: 'Travel Distance (miles)', type: 'number', placeholder: '0', half: true },
            { key: 'travelFee', label: 'Travel Fee ($)', type: 'number', placeholder: '0.00', half: true },
            { key: 'accessInstructions', label: 'Location Access Instructions', type: 'textarea', placeholder: 'Parking info, building access codes, contact person on-site...' },
            { key: 'powerRequirements', label: 'Power/Electrical Requirements', type: 'select', options: ['Standard outlets sufficient', 'Need dedicated circuit', 'Generator required', 'Battery powered only'], defaultValue: 'Standard outlets sufficient' },
        ],
    },
    'GGS-SVC-002': {
        title: 'GGS-SVC-002 - In-Studio Service Contract',
        description:
            'Contract for services provided at G&G studio facility. Includes studio amenities, equipment usage, and in-house service provisions.',
        tags: ['Studio room selection', 'Equipment included', 'Studio amenities', 'Setup time', 'Parking available', 'Refreshments'],
        sectionTitle: 'In-Studio Service Details',
        dynamicFields: [
            { key: 'studioRoom', label: 'Studio Room Selection *', type: 'select', options: ['Main Studio A (Large)', 'Studio B (Medium)', 'Studio C (Intimate)', 'Cyclorama Room', 'Green Screen Room'], defaultValue: 'Main Studio A (Large)', required: true },
            { key: 'studioHours', label: 'Studio Hours', type: 'text', placeholder: 'e.g., 9:00 AM - 5:00 PM', defaultValue: '9:00 AM - 5:00 PM', half: true },
            { key: 'setupTime', label: 'Setup Time Required', type: 'text', placeholder: 'e.g., 1 hour', half: true },
            { key: 'equipmentPackage', label: 'Equipment Package', type: 'select', options: ['Basic lighting kit', 'Professional lighting + backdrops', 'Full studio setup', 'Custom (specify in notes)'], defaultValue: 'Basic lighting kit' },
        ],
    },
    'GGS-SVC-003': {
        title: 'GGS-SVC-003 - Model Release Form',
        description:
            'Legal release form granting permission to use likeness in photographs/videos for specified purposes. Required for promotional and portfolio use.',
        tags: ['Model name', 'Date of birth', 'Usage permissions', 'Duration', 'Compensation', 'Guardian signature (if minor)'],
        sectionTitle: 'Model Release Information',
        dynamicFields: [
            { key: 'modelName', label: 'Model Full Legal Name *', type: 'text', placeholder: 'Legal name of model', required: true },
            { key: 'modelDob', label: 'Date of Birth *', type: 'date', required: true, half: true },
            { key: 'modelPhone', label: 'Phone Number', type: 'tel', placeholder: '(555) 123-4567', half: true },
            { key: 'intendedUsage', label: 'Intended Usage *', type: 'textarea', placeholder: 'Describe how the images/video may be used...', required: true },
            { key: 'usageDuration', label: 'Usage Duration', type: 'select', options: ['Perpetual (no time limit)', '5 years', '3 years', '1 year', 'One-time use only'], defaultValue: 'Perpetual (no time limit)' },
            { key: 'compensation', label: 'Compensation', type: 'text', placeholder: 'TFP or monetary amount' },
        ],
    },

    /* ────── SPANISH ────── */
    'GGS-SVC-001ES': {
        title: 'GGS-SVC-001ES - On-Location Service Contract (Spanish)',
        description:
            'Contrato completo para servicios proporcionados en la ubicación elegida por el cliente. Incluye disposiciones de viaje, requisitos específicos de ubicación y términos de servicio en el sitio.',
        tags: ['Dirección de ubicación', 'Gastos de viaje', 'Requisitos de configuración', 'Estacionamiento/acceso', 'Requisitos de energía', 'Contingencia climática'],
        sectionTitle: 'Campos Específicos de Servicio en Ubicación',
        dynamicFields: [
            { key: 'locationAddress', label: 'Dirección Completa de la Ubicación *', type: 'text', placeholder: 'Calle, Ciudad, Estado, CP', required: true },
            { key: 'travelDistance', label: 'Distancia de Viaje (millas)', type: 'number', placeholder: '0', half: true },
            { key: 'travelFee', label: 'Cargo por Viaje ($)', type: 'number', placeholder: '0.00', half: true },
            { key: 'accessInstructions', label: 'Instrucciones de Acceso', type: 'textarea', placeholder: 'Info de estacionamiento, códigos de acceso...' },
        ],
    },
    'GGS-SVC-002ES': {
        title: 'GGS-SVC-002ES - In-Studio Service Contract (Spanish)',
        description:
            'Contrato para servicios proporcionados en las instalaciones del estudio G&G. Incluye comodidades del estudio, uso de equipos y disposiciones de servicio interno.',
        tags: ['Selección de sala de estudio', 'Equipo incluido', 'Comodidades del estudio', 'Tiempo de configuración', 'Estacionamiento disponible', 'Refrigerios'],
        sectionTitle: 'Campos Específicos de Servicio en Estudio',
        dynamicFields: [
            { key: 'studioRoom', label: 'Selección de Sala de Estudio *', type: 'select', options: ['Estudio Principal A (Grande)', 'Estudio B (Mediano)', 'Estudio C (Íntimo)', 'Sala de Cyclorama'], defaultValue: 'Estudio Principal A (Grande)', required: true },
            { key: 'studioHours', label: 'Horario del Estudio', type: 'text', defaultValue: '9:00 AM - 5:00 PM', half: true },
            { key: 'setupTime', label: 'Tiempo de Configuración', type: 'text', placeholder: 'ej. 1 hora', half: true },
        ],
    },
    'GGS-SVC-003ES': {
        title: 'GGS-SVC-003ES - Model Release Form (Spanish)',
        description:
            'Formulario de liberación legal que otorga permiso para usar la semejanza en fotografías/videos para propósitos especificados. Requerido para uso promocional y de portafolio.',
        tags: ['Nombre del modelo', 'Fecha de nacimiento', 'Permisos de uso', 'Duración', 'Compensación', 'Firma del tutor (si es menor)'],
        sectionTitle: 'Información de Liberación de Modelo',
        dynamicFields: [
            { key: 'modelName', label: 'Nombre Legal Completo del Modelo *', type: 'text', placeholder: 'Nombre legal del modelo', required: true },
            { key: 'modelDob', label: 'Fecha de Nacimiento *', type: 'date', required: true, half: true },
            { key: 'modelPhone', label: 'Número de Teléfono', type: 'tel', placeholder: '(555) 123-4567', half: true },
            { key: 'intendedUsage', label: 'Uso Previsto *', type: 'textarea', placeholder: 'Describa cómo se pueden usar las imágenes/video...', required: true },
        ],
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
