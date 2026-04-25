/**
 * Wizard UI translations – EN / ES
 * ES strings are taken VERBATIM from the reference HTML templates
 * (GGS-SVC-001_v1.2_ES.html / GGS-SVC-002_v1.2_ES.html).
 */

export interface WizardLang {
  preparingTitle: string;
  overview: string;
  sign: string;
  reviewSubmit: string;
  step: string;
  agreementOverview: string;
  overviewDesc: string;
  client: string; phone: string; email: string; event: string; venue: string;
  startTime: string; headcount: string;
  totalSvcBooked: string;
  services: string; service: string; price: string; notes: string;
  grandTotal: string;
  tapToInitial: string; tap: string;
  yourHealthDisclosure: string;
  allergiesLabel: string;
  allergyPlaceholder: string;
  describeAllergies: string;
  skinLabel: string;
  skinPlaceholder: string;
  describeConditions: string;
  photoVideoConsent: string;
  photoPlaceholder: string;
  signTitle: string;
  sec31p1: string;
  sec31p2: string;
  sec31p3: string;
  printedName: string;
  namePlaceholder: string;
  signingDate: string;
  yourSignature: string;
  draw: string; type: string;
  drawHint: string;
  clear: string;
  typePlaceholder: string;
  preview: string; yourName: string;
  geoConsentBold: string;
  geoConsentBody: string;
  bySigningAbove: string;
  reviewDesc: string;
  bookingDetails: string;
  eventDate: string; eventLocation: string; serviceStartTime: string;
  confirmedHeadcount: string; totalSvcBookedShort: string; trialRun: string;
  financialSummary: string;
  retainerPaid: string; travelFee: string; remainingBalance: string;
  totalContractAmount: string; paymentPlan: string; active: string;
  clientDisclosures: string;
  allergiesSens: string; skinScalp: string; restrictions: string; photoVideo: string;
  name: string; date: string; initials: string;
  ofCompleted: string; completed: string;
  yourSig: string;
  submittingLabel: string; submitAgreement: string;
  submittingTitle: string;
  dontClose: string;
  submitDisclaimer: string;
  submitAmendment: string;
  back: string; continueBtn: string;
  nextInitial: string;
  enterName: string;
  confirmConsent: string;
  drawSig: string;
  drawFail: string;
  sigRequired: string;
  tapEach: string;
  selectAllergy: string;
  describeAllergyErr: string;
  selectSkin: string;
  describeSkinErr: string;
  selectPhoto: string;
  missingInitials: (n:number) => string;
  allergyOpts: string[];
  skinOpts: string[];
  photoOpts: string[];
  loadingWords: string[];
  submitWords: string[];
}

const en: WizardLang = {
  preparingTitle: 'Preparing Your Agreement',
  overview: 'Overview',
  sign: 'Sign',
  reviewSubmit: 'Review & Submit',
  step: 'Step',
  agreementOverview: 'Agreement Overview',
  overviewDesc: 'Review the summary below, then continue through each part. You will initial each section, enter health details, sign, and submit.',
  client: 'Client', phone: 'Phone', email: 'Email', event: 'Event', venue: 'Venue',
  startTime: 'Start Time', headcount: 'Headcount',
  totalSvcBooked: 'Total Services Booked (Section 06)',
  services: 'Services', service: 'Service', price: 'Price', notes: 'Notes',
  grandTotal: 'Grand Total',
  tapToInitial: 'TAP TO INITIAL', tap: 'TAP',
  yourHealthDisclosure: 'Your Health Disclosure',
  allergiesLabel: 'Allergies / Sensitivities',
  allergyPlaceholder: 'Select allergy / sensitivity…',
  describeAllergies: 'Describe allergies…',
  skinLabel: 'Skin / Scalp Conditions',
  skinPlaceholder: 'Select skin / scalp condition…',
  describeConditions: 'Describe conditions…',
  photoVideoConsent: 'Photo / Video Consent',
  photoPlaceholder: 'Select photo / video consent…',
  signTitle: 'Agreement, Electronic Consent &amp; Signatures',
  sec31p1: "By signing below, both parties confirm they have read, reviewed, and fully understood every section of this Agreement in its entirety. Where the Client is a minor, this Agreement must be executed by the Client\u2019s parent, legal guardian, or an adult signer who represents and warrants that they have current authority and/or authorization from the minor\u2019s parent or legal guardian to sign this Agreement, consent to services, and make service-related decisions on the minor\u2019s behalf.",
  sec31p2: "Electronic Signature Consent: The parties agree that electronic signatures applied to this Agreement are valid, enforceable, and legally binding to the same extent as original handwritten signatures, pursuant to the California Uniform Electronic Transactions Act (UETA), California Civil Code \u00a71633.1 et seq., and the federal Electronic Signatures in Global and National Commerce Act (E-SIGN Act), 15 U.S.C. \u00a77001 et seq. By proceeding to sign electronically, each party affirmatively consents to the use of electronic records and signatures for this transaction.",
  sec31p3: "This Agreement becomes legally binding and the booking is confirmed only after: (1) the Client has signed this Agreement; (2) the Artist has signed or issued written acceptance via text or email; and (3) the retainer has been received by Glitz & Glamour Studio. Submission of this signed Agreement alone does not confirm the booking.",
  printedName: 'Printed Legal Name',
  namePlaceholder: 'Your full legal name',
  signingDate: 'Signing Date',
  yourSignature: 'Your Signature',
  draw: '\u270f\ufe0f Draw', type: '\u2328\ufe0f Type',
  drawHint: 'Draw your signature below using your mouse, stylus, or finger',
  clear: 'Clear',
  typePlaceholder: 'Type your name',
  preview: 'Preview', yourName: 'Your Name',
  geoConsentBold: 'I consent to the collection, where applicable, of my IP address, approximate geographic location, device information, and execution timestamp',
  geoConsentBody: 'for the sole purpose of authenticating my signature and creating a verifiable execution record for this Agreement, as disclosed in Section 30. I understand this data will not be sold or shared for advertising, and that any disclosure to service providers (such as payment processors, email delivery services, or geolocation lookup services) is solely to support the execution, delivery, and administration of this Agreement. Where another person assists me in applying my signature or initials at my direction per Section 31, I authorize the collection of data from the signing device as part of that authorization.',
  bySigningAbove: 'By signing above and checking the box, the adult Client, the signing parent/legal guardian, or authorized adult signer of a minor Client confirms that they are at least 18 years of age, legally competent to enter into this Agreement, have read, understand, and acknowledge all <strong>31 sections</strong> of this Agreement, and consent to the data collection described in Section 30. By signing electronically, each party confirms that they can access this Agreement electronically and can download, print, or save a copy for their records.',
  reviewDesc: 'Review your details below. Once submitted, your signed PDF will be generated.',
  bookingDetails: 'Booking details',
  eventDate: 'Event date', eventLocation: 'Event location', serviceStartTime: 'Service start time',
  confirmedHeadcount: 'Confirmed headcount', totalSvcBookedShort: 'Total services booked', trialRun: 'Trial run',
  financialSummary: 'Financial summary',
  retainerPaid: 'Retainer paid', travelFee: 'Travel fee', remainingBalance: 'Remaining balance',
  totalContractAmount: 'Total contract amount', paymentPlan: 'Payment plan', active: 'Active',
  clientDisclosures: 'Client disclosures',
  allergiesSens: 'Allergies / sensitivities', skinScalp: 'Skin / scalp', restrictions: 'Restrictions', photoVideo: 'Photo / video',
  name: 'Name', date: 'Date', initials: 'Initials',
  ofCompleted: 'of', completed: 'completed',
  yourSig: 'Your signature',
  submittingLabel: 'Submitting\u2026', submitAgreement: 'Submit Agreement',
  submittingTitle: 'Submitting Your Agreement',
  dontClose: "Please don\u2019t close this page",
  submitDisclaimer: 'By submitting this agreement, I confirm that all information provided is true, complete, and accurate, that I have reviewed this summary, and that I am fully and legally bound by all terms and conditions of this Agreement as signed.',
  submitAmendment: 'Submitted agreements cannot be modified without a written amendment or written confirmation per Section 28. Any modification \u2014 whether by text, email, or signed amendment \u2014 must reference this Agreement by Contract Date, Contract Number, or Event Date together with Client name to be valid.',
  back: '\u2190 Back', continueBtn: 'Continue \u2192',
  nextInitial: 'Next Initial',
  enterName: 'Enter your printed legal name.',
  confirmConsent: 'Please confirm data collection consent.',
  drawSig: 'Please draw your signature.',
  drawFail: 'Could not create signature. Try Draw mode.',
  sigRequired: 'Signature required.',
  tapEach: 'Tap each initial box to acknowledge.',
  selectAllergy: 'Please select an allergy / sensitivity option.',
  describeAllergyErr: 'Please describe your allergies.',
  selectSkin: 'Please select a skin / scalp condition option.',
  describeSkinErr: 'Please describe your conditions.',
  selectPhoto: 'Please select a photo / video consent option.',
  missingInitials: (n) => `${n} initial(s) still missing. Tap "Next Initial" to find them.`,
  allergyOpts: ['','None','Latex','Fragrance / Perfume','Hair Dye / PPD','Shellac / Gel products','Nail Acrylic / Monomer','Nickel / Metal','Adhesives / Glue','Essential Oils','Preservatives (parabens, formaldehyde)','Multiple allergies \u2014 see details below','Other \u2014 see details below'],
  skinOpts: ['','None','Sensitive skin','Eczema','Psoriasis','Rosacea','Acne / Active breakouts','Dermatitis','Scalp condition','Thin / damaged hair or scalp','Recent chemical service (within 4 weeks)','Multiple conditions \u2014 see details below','Other \u2014 see details below'],
  photoOpts: ['','Option 1 \u2014 Full Consent','Option 2 \u2014 Limited Consent / Final Look Only','Option 3 \u2014 No Consent'],
  loadingWords: ['Brewing the glam \u2728','Curling the clauses \ud83d\udc87\u200d\u2640\ufe0f','Polishing the fine print \ud83d\udc85','Steaming the details \ud83e\uddd6\u200d\u2640\ufe0f','Blending the terms \ud83c\udfa8','Setting the sparkle \ud83d\udc8e','Mixing the magic \ud83e\ude84','Priming the pages \ud83d\udccb','Styling your contract \ud83d\udc84','Almost runway ready \ud83d\udc60'],
  submitWords: ['Sealing your agreement \ud83d\udc8c','Generating your PDF \ud83d\udcc4','Applying your signature \u270d\ufe0f','Locking in the glamour \ud83d\udc8e','Almost there, gorgeous \ud83d\udc85','Wrapping it in sparkle \u2728','Pressing the final touch \ud83d\udc8b','Your contract is brewing \u2615','Making it official \ud83e\udd42','Sending to the glam vault \ud83d\udd10','Sprinkling some magic \ud83e\ude84','Polishing the final draft \ud83d\udc84'],
};

/* ── ES strings — taken VERBATIM from the reference HTML templates ── */
const es: WizardLang = {
  preparingTitle: 'Preparando Su Contrato',
  overview: 'Resumen',
  sign: 'Firma',
  reviewSubmit: 'Revisar y Enviar',
  step: 'Paso',
  agreementOverview: 'Resumen del Contrato',
  overviewDesc: 'Revise el resumen a continuación, luego continúe por cada parte. Pondrá sus iniciales en cada sección, ingresará detalles de salud, firmará y enviará.',
  client: 'Cliente', phone: 'Teléfono', email: 'Correo', event: 'Evento', venue: 'Lugar',
  startTime: 'Hora de Inicio', headcount: 'Personas',
  totalSvcBooked: 'Total de Servicios Reservados (Sección 06)',
  services: 'Servicios', service: 'Servicio', price: 'Precio', notes: 'Notas',
  grandTotal: 'Total General',
  /* From reference: <span class="init-placeholder">Iniciales</span> + "👆 Haga clic para poner iniciales" */
  tapToInitial: 'TOQUE PARA INICIALES', tap: 'TOQUE',
  /* From reference: <label>Alergias / Sensibilidades Conocidas</label> */
  yourHealthDisclosure: 'Su Divulgación de Salud',
  allergiesLabel: 'Alergias / Sensibilidades Conocidas',
  allergyPlaceholder: 'Seleccione…',
  /* From reference: placeholder="Describa sus alergias en detalle…" */
  describeAllergies: 'Describa sus alergias en detalle…',
  /* From reference: <label>Condiciones de la Piel</label> */
  skinLabel: 'Condiciones de la Piel',
  skinPlaceholder: 'Seleccione…',
  /* From reference: placeholder="Describa sus condiciones de la piel en detalle…" */
  describeConditions: 'Describa sus condiciones de la piel en detalle…',
  /* From reference: <label>Mi Decisión de Consentimiento de Foto / Video</label> */
  photoVideoConsent: 'Mi Decisión de Consentimiento de Foto / Video',
  photoPlaceholder: '— Requerido: Seleccione una opción —',
  /* From reference: <div class="c-sec-title">Contrato, Consentimiento Electrónico y Firmas</div> */
  signTitle: 'Contrato, Consentimiento Electrónico y Firmas',
  /* From reference line 1607 — EXACT text */
  sec31p1: 'Al firmar a continuación, ambas partes confirman que han leído, revisado y entendido plenamente cada sección de este Contrato en su totalidad. Cuando el Cliente sea un menor, este Contrato debe ser ejecutado por el padre, tutor legal o un adulto firmante del Cliente que declare y garantice que cuenta con autoridad actual y/o autorización del padre o tutor legal del menor para firmar este Contrato, consentir los servicios y tomar decisiones relacionadas con los servicios en nombre del menor.',
  /* From reference line 1608 */
  sec31p2: 'Consentimiento de Firma Electrónica: Las partes acuerdan que las firmas electrónicas aplicadas a este Contrato son válidas, aplicables y legalmente vinculantes en la misma medida que las firmas manuscritas originales, de conformidad con el California Uniform Electronic Transactions Act (UETA), California Civil Code §1633.1 et seq., y el federal Electronic Signatures in Global and National Commerce Act (E-SIGN Act), 15 U.S.C. §7001 et seq. Al proceder a firmar electrónicamente, cada parte consiente afirmativamente el uso de registros y firmas electrónicas para esta transacción.',
  /* From reference line 1609 */
  sec31p3: 'Este Contrato se vuelve legalmente vinculante y la reservación queda confirmada únicamente después de: (1) que el Cliente haya firmado este Contrato; (2) que la Artista haya firmado o emitido aceptación por escrito vía texto o correo electrónico; y (3) que el anticipo haya sido recibido por Glitz & Glamour Studio. La sola presentación de este Contrato firmado no confirma la reservación.',
  /* From reference: placeholder="Escriba su nombre legal completo…" */
  printedName: 'Nombre Legal Completo',
  namePlaceholder: 'Escriba su nombre legal completo…',
  signingDate: 'Fecha de Firma',
  /* From reference: ✦ Firma del Cliente */
  yourSignature: 'Su Firma',
  /* From reference: ✏️ Dibujar Firma / ⌨️ Escribir Firma */
  draw: '\u270f\ufe0f Dibujar', type: '\u2328\ufe0f Escribir',
  /* From reference line 1623 */
  drawHint: 'Dibuje su firma a continuación usando el ratón, lápiz óptico o dedo',
  /* From reference: <button class="btn-clear">Borrar</button> */
  clear: 'Borrar',
  typePlaceholder: 'Escriba su nombre legal completo…',
  /* From reference: <div class="sig-preview-txt">Su Firma</div> */
  preview: 'Firma', yourName: 'Su Firma',
  /* From reference line 1665 — EXACT bold text */
  geoConsentBold: 'Consiento la recopilación, cuando corresponda, de mi dirección IP, ubicación geográfica aproximada, información del dispositivo y marca de tiempo de ejecución',
  /* From reference line 1666 — EXACT body text */
  geoConsentBody: 'con el único propósito de autenticar mi firma y crear un registro de ejecución verificable para este Contrato, según se divulga en la Sección 30. Entiendo que estos datos no se venderán ni compartirán con fines publicitarios, y que cualquier divulgación a proveedores de servicios (como procesadores de pagos, servicios de entrega de correo electrónico o servicios de búsqueda de geolocalización) es únicamente para respaldar la ejecución, entrega y administración de este Contrato. Cuando otra persona me asista en la aplicación de mi firma o iniciales bajo mi dirección conforme a la Sección 31, autorizo la recopilación de datos del dispositivo firmante como parte de esa autorización.',
  /* From reference line 1671 — EXACT text */
  bySigningAbove: 'Al firmar arriba y marcar la casilla, el Cliente adulto, el padre/tutor legal firmante, o el adulto firmante autorizado de un Cliente menor confirma que tiene al menos 18 años de edad, que es legalmente competente para celebrar este Contrato, que ha leído, entiende y reconoce las <strong>31 secciones</strong> de este Contrato, y que consiente la recopilación de datos descrita en la Sección 30. Al firmar electrónicamente, cada parte confirma que puede acceder a este Contrato electrónicamente y puede descargarlo, imprimirlo o guardar una copia para sus registros.',
  reviewDesc: 'Revise sus datos a continuación. Una vez enviado, se generará su PDF firmado.',
  bookingDetails: 'Detalles de la reservación',
  eventDate: 'Fecha del evento', eventLocation: 'Ubicación del evento', serviceStartTime: 'Hora de inicio del servicio',
  confirmedHeadcount: 'Personas confirmadas', totalSvcBookedShort: 'Total de servicios reservados', trialRun: 'Prueba previa',
  financialSummary: 'Resumen financiero',
  retainerPaid: 'Anticipo pagado', travelFee: 'Tarifa de traslado', remainingBalance: 'Saldo restante',
  totalContractAmount: 'Monto total del contrato', paymentPlan: 'Plan de pagos', active: 'Activo',
  clientDisclosures: 'Divulgaciones del cliente',
  allergiesSens: 'Alergias / sensibilidades', skinScalp: 'Piel / cuero cabelludo', restrictions: 'Restricciones', photoVideo: 'Foto / video',
  name: 'Nombre', date: 'Fecha', initials: 'Iniciales',
  ofCompleted: 'de', completed: 'completadas',
  yourSig: 'Su firma',
  submittingLabel: 'Enviando\u2026', submitAgreement: 'Enviar Contrato',
  submittingTitle: 'Enviando Su Contrato',
  dontClose: 'Por favor no cierre esta página',
  submitDisclaimer: 'Al enviar este contrato, confirmo que toda la información proporcionada es verdadera, completa y precisa, que he revisado este resumen, y que estoy total y legalmente obligado(a) por todos los términos y condiciones de este Contrato según fue firmado.',
  submitAmendment: 'Los contratos enviados no pueden modificarse sin una enmienda por escrito o confirmación escrita conforme a la Sección 28. Cualquier modificación \u2014 ya sea por texto, correo electrónico o enmienda firmada \u2014 debe hacer referencia a este Contrato por Fecha del Contrato, Número de Contrato o Fecha del Evento junto con el nombre del Cliente para ser válida.',
  back: '\u2190 Atrás', continueBtn: 'Continuar \u2192',
  nextInitial: 'Siguiente Inicial',
  enterName: 'Ingrese su nombre legal completo.',
  confirmConsent: 'Por favor confirme el consentimiento de recopilación de datos.',
  drawSig: 'Por favor dibuje su firma.',
  drawFail: 'No se pudo crear la firma. Intente el modo Dibujar.',
  sigRequired: 'Firma requerida.',
  tapEach: 'Toque cada casilla de iniciales para confirmar.',
  selectAllergy: 'Por favor seleccione una opción de alergia / sensibilidad.',
  describeAllergyErr: 'Por favor describa sus alergias.',
  selectSkin: 'Por favor seleccione una opción de condición de piel / cuero cabelludo.',
  describeSkinErr: 'Por favor describa sus condiciones.',
  selectPhoto: 'Por favor seleccione una opción de consentimiento de foto / video.',
  missingInitials: (n) => `${n} inicial(es) aún faltan. Toque "Siguiente Inicial" para encontrarlas.`,
  /* From reference — EXACT option labels from the <select> elements */
  allergyOpts: ['','Ninguna','Látex','Fragancia / Perfume','Tinte para Cabello / PPD','Shellac / Productos de Gel','Acrílico / Monómero para Uñas','Níquel / Metal','Adhesivos / Pegamento','Aceites Esenciales','Conservantes (parabenos / formaldehído)','Múltiples — ver detalles abajo','Otro — ver detalles abajo'],
  skinOpts: ['','Ninguna','Piel sensible','Eczema','Psoriasis','Rosácea','Acné / Brotes activos','Dermatitis (de contacto o seborreica)','Condición del cuero cabelludo — ver detalles abajo','Cabello o cuero cabelludo delgado / dañado','Servicio químico reciente (dentro de 4 semanas)','Múltiples condiciones — ver detalles abajo','Otro — ver detalles abajo'],
  /* From reference — EXACT option labels from Section 15 <select> */
  photoOpts: ['','Opción 1 — Consentimiento Total (todo el contenido)','Opción 2 — Consentimiento Limitado (solo resultado final)','Opción 3 — Sin Consentimiento'],
  loadingWords: ['Preparando el glamour \u2728','Rizando las cláusulas \ud83d\udc87\u200d\u2640\ufe0f','Puliendo la letra pequeña \ud83d\udc85','Dando forma a los detalles \ud83e\uddd6\u200d\u2640\ufe0f','Mezclando los términos \ud83c\udfa8','Fijando el brillo \ud83d\udc8e','Mezclando la magia \ud83e\ude84','Preparando las páginas \ud83d\udccb','Estilizando su contrato \ud83d\udc84','Casi listo para la pasarela \ud83d\udc60'],
  submitWords: ['Sellando su contrato \ud83d\udc8c','Generando su PDF \ud83d\udcc4','Aplicando su firma \u270d\ufe0f','Asegurando el glamour \ud83d\udc8e','Casi listo, hermosa \ud83d\udc85','Envolviéndolo en brillo \u2728','El toque final \ud83d\udc8b','Su contrato está en camino \u2615','Haciéndolo oficial \ud83e\udd42','Enviando a la bóveda glam \ud83d\udd10','Esparciendo magia \ud83e\ude84','Puliendo el borrador final \ud83d\udc84'],
};

export function getWizardLang(contractType?: string): WizardLang {
  return contractType?.endsWith('-es') ? es : en;
}
