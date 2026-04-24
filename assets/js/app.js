/* =========================================================================
   PMO Governance Portal - SPA Vanilla JS
   - Sin frameworks, sin innerHTML, sin alerts.
   - Feedback visual mediante notificaciones DOM y mensajes inline.
   ========================================================================= */

/* ------------------------------- Constantes ------------------------------ */

const STORAGE_KEY = 'pmoAppState';
const STORAGE_VERSION = 5;

const STATUS = {
    DRAFT: 'Borrador',
    PENDING: 'En Revisión',
    APPROVED: 'Aprobado',
    REJECTED: 'Rechazado',
    CHANGES: 'Requiere Cambios',
    CLOSED: 'Cerrado'
};

const STAGE = {
    PMO: 'pmo',
    TECNICA: 'tecnica',
    DIRECTOR: 'director'
};

const STAGE_LABELS = {
    pmo: 'Revisión PMO',
    tecnica: 'Evaluación Financiera',
    director: 'Aprobación'
};

const STAGE_ORDER = [STAGE.PMO, STAGE.TECNICA, STAGE.DIRECTOR];

const LIFECYCLE_STEPS = [
    { key: 'borrador', label: 'Borrador', icon: 'edit_note' },
    { key: 'revision_pmo', label: 'Revisión PMO', icon: 'engineering' },
    { key: 'evaluacion', label: 'Evaluación Financiera', icon: 'balance' },
    { key: 'aprobacion', label: 'Aprobación', icon: 'verified_user' },
    { key: 'aprobado', label: 'Aprobado', icon: 'flag' }
];

function getLifecycleIndex(req) {
    if (req.status === STATUS.DRAFT) return 0;
    if (req.status === STATUS.APPROVED) return 4;
    if (req.status === STATUS.PENDING) {
        if (req.stage === STAGE.TECNICA) return 2;
        if (req.stage === STAGE.DIRECTOR) return 3;
        return 1;
    }
    const stageIndex = STAGE_ORDER.indexOf(req.stage || STAGE.PMO);
    return stageIndex >= 0 ? stageIndex + 1 : 1;
}

const ROLE_SOLICITANTE = 'solicitante';
const ROLE_ADMIN = 'admin';

const AREAS = [
    { value: 'ti', label: 'Tecnología de la Información' },
    { value: 'finanzas', label: 'Finanzas' },
    { value: 'operaciones', label: 'Operaciones' },
    { value: 'riesgos', label: 'Riesgos' },
    { value: 'recursos_humanos', label: 'Recursos Humanos' },
    { value: 'marketing', label: 'Marketing' }
];

const PRIORIDADES = [
    { value: 'alta', label: 'Alta' },
    { value: 'media', label: 'Media' },
    { value: 'baja', label: 'Baja' }
];

const TIPOS_PROYECTO = [
    { value: 'infraestructura', label: 'Infraestructura' },
    { value: 'desarrollo', label: 'Desarrollo de Software' },
    { value: 'integracion', label: 'Integración de Sistemas' },
    { value: 'seguridad', label: 'Seguridad y Cumplimiento' },
    { value: 'analitica', label: 'Analítica y Datos' },
    { value: 'transformacion', label: 'Transformación Digital' }
];

const DEMO_CREDENTIALS = {
    solicitante: { email: 'solicitante@banco.com', password: 'demo1234' },
    admin:       { email: 'admin@banco.com',        password: 'admin1234' },
    pm:          { email: 'pm@banco.com',           password: 'pm1234'   }
};

const ROLE_PM = 'project_manager';

const IMPL_STAGE = {
    INICIACION:   'iniciacion',
    ANALISIS:     'analisis',
    CONSTRUCCION: 'construccion',
    PRUEBAS:      'pruebas',
    GO_LIVE:      'go_live',
    CIERRE:       'cierre'
};

const IMPL_STAGE_ORDER = ['iniciacion','analisis','construccion','pruebas','go_live','cierre'];

const IMPL_STAGES_CONFIG = [
    {
        key: 'iniciacion', label: 'Iniciación', icon: 'rocket_launch', color: '#6366f1',
        docs: [
            { tag: 'acta_constitucion',   label: 'Acta de Constitución del Proyecto', required: true  },
            { tag: 'stakeholders',        label: 'Registro de Stakeholders',           required: true  },
            { tag: 'plan_comunicacion',   label: 'Plan de Comunicación',               required: false },
            { tag: 'acta_kickoff',        label: 'Acta de Kick-off',                   required: false }
        ]
    },
    {
        key: 'analisis', label: 'Análisis y Diseño', icon: 'design_services', color: '#0ea5e9',
        docs: [
            { tag: 'brd_frd',            label: 'Documento de Requerimientos (BRD/FRD)', required: true  },
            { tag: 'arquitectura',       label: 'Arquitectura / Diseño de Solución',      required: true  },
            { tag: 'plan_proyecto',      label: 'Plan de Proyecto (Cronograma)',           required: true  },
            { tag: 'matriz_riesgos',     label: 'Análisis y Matriz de Riesgos',            required: false },
            { tag: 'aprobacion_diseno',  label: 'Acta de Aprobación de Diseño',            required: false }
        ]
    },
    {
        key: 'construccion', label: 'Construcción', icon: 'construction', color: '#f59e0b',
        docs: [
            { tag: 'informe_avance',    label: 'Informe de Progreso / Avance',       required: true  },
            { tag: 'doc_tecnica',       label: 'Documentación Técnica',              required: false },
            { tag: 'actas_seguimiento', label: 'Actas de Reuniones de Seguimiento', required: false },
            { tag: 'control_cambios',   label: 'Control de Cambios al Alcance',      required: false }
        ]
    },
    {
        key: 'pruebas', label: 'Pruebas', icon: 'bug_report', color: '#ef4444',
        docs: [
            { tag: 'plan_pruebas',      label: 'Plan de Pruebas (UAT)',                   required: true },
            { tag: 'reporte_pruebas',   label: 'Reporte de Ejecución de Pruebas',         required: true },
            { tag: 'reporte_defectos',  label: 'Reporte de Defectos',                     required: true },
            { tag: 'certificacion_uat', label: 'Acta de Certificación / Aceptación UAT',  required: true }
        ]
    },
    {
        key: 'go_live', label: 'Go Live', icon: 'flag', color: '#10b981',
        docs: [
            { tag: 'checklist_produccion', label: 'Checklist de Pase a Producción',  required: true  },
            { tag: 'plan_despliegue',      label: 'Plan de Despliegue y Rollback',   required: true  },
            { tag: 'comunicacion_usuarios',label: 'Comunicación a Usuarios Finales', required: false },
            { tag: 'acta_produccion',      label: 'Acta de Puesta en Producción',    required: true  }
        ]
    },
    {
        key: 'cierre', label: 'Cierre', icon: 'task_alt', color: '#8b5cf6',
        docs: [
            { tag: 'acta_cierre',               label: 'Acta de Cierre del Proyecto',         required: true  },
            { tag: 'lecciones_aprendidas',      label: 'Informe de Lecciones Aprendidas',     required: true  },
            { tag: 'evaluacion_beneficios',     label: 'Evaluación de Beneficios Realizados', required: false },
            { tag: 'transferencia_conocimiento',label: 'Transferencia de Conocimiento',       required: false }
        ]
    }
];

/* ------------------------------- Estado --------------------------------- */

const AppState = {
    currentUser: null,
    currentView: null,
    requests: (() => {
        const A = 'admin@banco.com', S = 'solicitante@banco.com';
        const c = (author, date, text) => ({ author, date, text });
        const PEND = STATUS.PENDING, APPR = STATUS.APPROVED;
        const DRAF = STATUS.DRAFT, CHAN = STATUS.CHANGES, REJE = STATUS.REJECTED;
        const PMO = STAGE.PMO, TEC = STAGE.TECNICA, DIR = STAGE.DIRECTOR;

        const req = (id, title, status, stage, date, area, prioridad, tipo, necesidad, impacto, presupuesto, fechaInicio, comments = [], implementation = null) => ({
            id, title, status, stage, date,
            applicant: S, area, prioridad,
            tipoProyecto: tipo,
            necesidad, impacto,
            presupuestoEstimado: String(presupuesto),
            fechaEstimadaInicio: fechaInicio,
            comments,
            implementation
        });
        /* helpers solo para proyectos con implementation */
        const d  = (tag, name, format, date) => ({ id: `doc_${tag}`, tag, name, format, uploadedBy: 'pm@banco.com', uploadedAt: date });
        const pm = (date, text) => ({ author: 'pm@banco.com', date, text });
        const emptyDocs = () => ({ iniciacion:[], analisis:[], construccion:[], pruebas:[], go_live:[], cierre:[] });
        const mkImpl = (stage, startedAt, docs, comments, history) => ({
            stage, startedAt, assignedPM: 'pm@banco.com',
            stageHistory: history,
            documents: Object.assign(emptyDocs(), docs),
            comments
        });

        return [
        /* ── BORRADORES (10) ───────────────────────────────────────────────── */
        req(1,'Plataforma de Identidad Digital (IAM)',DRAF,PMO,'2026-04-20','ti','alta','seguridad',
            'La gestión de identidades y accesos se realiza con herramientas dispersas sin SSO ni MFA centralizado, exponiendo al banco a brechas y duplicidad de credenciales.',
            'Reducción del 70% en incidentes de acceso no autorizado, SSO para 120 aplicaciones internas y cumplimiento NIST 800-63.',
            1850000,'2026-10-01'),
        req(2,'Sistema de Scoring Conductual de Clientes',DRAF,PMO,'2026-04-19','riesgos','alta','analitica',
            'El modelo de riesgo crediticio actual sólo utiliza variables financieras estáticas, ignorando el comportamiento transaccional que predice la morosidad con mayor precisión.',
            'Incremento del 22% en la tasa de predicción de impago y reducción de la pérdida esperada en $8M anuales mediante un modelo de ML actualizado en tiempo real.',
            2100000,'2026-11-01'),
        req(3,'Portal de Autoservicio Regulatorio',DRAF,PMO,'2026-04-18','operaciones','media','desarrollo',
            'Las solicitudes de información regulatoria (SFC, UIAF, DIAN) se gestionan manualmente por un equipo de 6 personas con tiempos de respuesta promedio de 9 días.',
            'Reducción del tiempo de respuesta regulatoria de 9 a 2 días, liberación de 4 FTE para actividades de mayor valor y eliminación de multas por incumplimiento de plazos.',
            480000,'2026-09-15'),
        req(4,'Renovación de Red ATM Nacional',DRAF,PMO,'2026-04-17','ti','alta','infraestructura',
            'El 40% de la flota ATM opera con hardware de más de 8 años, con una tasa de indisponibilidad del 12%, el doble del estándar de la industria, generando pérdidas operativas.',
            'Reducir la indisponibilidad de ATM al 3%, habilitar funciones de depósito inteligente y pagos de servicios, y mejorar la satisfacción en canal físico.',
            3200000,'2026-08-01'),
        req(5,'Campaña Digital para Captación Hipotecaria',DRAF,PMO,'2026-04-16','marketing','media','desarrollo',
            'La captación de créditos hipotecarios se apoya exclusivamente en canales presenciales y llamadas outbound, sin presencia en motores de búsqueda ni comparadores digitales.',
            'Incrementar la originación hipotecaria digital en un 35% durante los primeros 6 meses, reduciendo el CAC de $1.200 a $480 por cliente adquirido.',
            390000,'2026-07-01'),
        req(6,'Sistema de Control de Contratos Corporativos',DRAF,PMO,'2026-04-15','finanzas','media','integracion',
            'Los contratos con proveedores y clientes corporativos se almacenan en repositorios dispersos sin alertas de vencimiento, generando renovaciones tácitas y contingencias legales.',
            'Centralización de 4.200 contratos activos, alertas automáticas 90/60/30 días antes del vencimiento y reducción del 80% en renovaciones no gestionadas.',
            650000,'2026-10-15'),
        req(7,'Actualización ERP Financiero SAP S/4HANA',DRAF,PMO,'2026-04-14','finanzas','alta','infraestructura',
            'El ERP financiero actual (SAP ECC 6.0) saldrá de soporte en 2027 y no soporta procesos de cierre en tiempo real, generando cierres mensuales de 5 días vs. 1 día en el benchmark.',
            'Migración a SAP S/4HANA con cierre financiero en 1 día, habilitación de reporting en tiempo real y reducción del 30% en el tiempo dedicado a conciliaciones manuales.',
            4800000,'2026-12-01'),
        req(8,'Chatbot Bancario con IA Generativa',DRAF,PMO,'2026-04-13','marketing','baja','desarrollo',
            'El contact center recibe 180.000 interacciones mensuales, de las cuales el 62% corresponde a consultas de saldo, movimientos y productos, que podrían automatizarse.',
            'Deflexión del 55% de interacciones al chatbot, reducción del costo por interacción de $4.200 a $600 y mejora del NPS de servicio en 8 puntos.',
            320000,'2026-08-15'),
        req(9,'Plataforma E-learning Corporativa',DRAF,PMO,'2026-04-12','recursos_humanos','baja','desarrollo',
            'El banco destina $2.1M anuales a capacitación presencial con una tasa de completitud del 34%, logística compleja y sin métricas de aprendizaje por colaborador.',
            'Reducción del 60% en costos de capacitación, incremento de la tasa de completitud al 78% y habilitación de rutas de aprendizaje personalizadas por rol.',
            210000,'2026-09-01'),
        req(10,'Modernización del Middleware ESB',DRAF,PMO,'2026-04-11','ti','media','infraestructura',
            'El ESB actual gestiona 3.200 integraciones con una latencia promedio de 800ms, limitando la capacidad de adoptar arquitecturas de microservicios y APIs en tiempo real.',
            'Reducción de la latencia de integración a menos de 120ms, capacidad para 10.000 mensajes/segundo y habilitación de un modelo de integración basado en eventos.',
            1200000,'2026-11-15'),

        /* ── REVISIÓN PMO (10) ─────────────────────────────────────────────── */
        req(11,'Sistema de Gestión de Colaterales',PEND,PMO,'2026-04-10','riesgos','alta','integracion',
            'Las garantías asociadas a la cartera de crédito se registran en tres sistemas distintos sin conciliación automática, generando diferencias contables que deben resolverse manualmente cada mes.',
            'Unificación del inventario de garantías en tiempo real, reducción del 90% en diferencias contables y visibilidad completa del LTV de la cartera para la gerencia de riesgos.',
            890000,'2026-08-01',
            [c(S,'2026-04-10','Solicitud enviada a revisión de la PMO. Se adjunta análisis de impacto en el portafolio de crédito.')]),
        req(12,'Automatización de Reportes a la SFC',PEND,PMO,'2026-04-08','finanzas','alta','desarrollo',
            'La generación de los 18 reportes periódicos exigidos por la SFC demanda 340 horas-analista mensuales, con riesgo de errores humanos en la consolidación de cifras.',
            'Reducción a 12 horas-analista por mes, cero errores de transcripción y entrega automática en los formatos XML exigidos por el regulador.',
            1400000,'2026-07-15',
            [c(S,'2026-04-08','Adjunto el inventario completo de reportes regulatorios y sus plazos de entrega.')]),
        req(13,'Plataforma Customer 360',PEND,PMO,'2026-04-06','marketing','media','analitica',
            'El banco tiene siete fuentes de datos de clientes sin integrar: core, CRM, app móvil, call center, sucursales, tarjetas y banca electrónica, impidiendo una visión unificada del cliente.',
            'Vista única del cliente en tiempo real, incremento del 28% en la efectividad de campañas de cross-sell y reducción del churn en un 15% mediante acciones preventivas.',
            1100000,'2026-09-01',
            [c(A,'2026-04-07','La PMO ha recibido la solicitud. Se agenda revisión con el comité de arquitectura de datos para la semana entrante.')]),
        req(14,'Renovación Infraestructura de Red LAN/WAN',PEND,PMO,'2026-04-05','ti','alta','infraestructura',
            'La infraestructura de red de 65 sucursales opera con equipos Cisco con más de 9 años de antigüedad, sin soporte de fabricante, con un uptime promedio del 91% vs. el SLA del 99.5%.',
            'Uptime del 99.8%, habilitación de SD-WAN para gestión centralizada, reducción del 35% en costos de MPLS y soporte para aplicaciones en tiempo real en todas las sucursales.',
            2700000,'2026-06-01',
            [c(S,'2026-04-05','Se adjunta inventario completo de equipos de red con fechas de fin de vida y análisis de criticidad.')]),
        req(15,'Onboarding Digital Persona Natural',PEND,PMO,'2026-04-03','marketing','baja','transformacion',
            'La apertura de productos para personas naturales requiere presencia física con un tiempo promedio de 45 minutos, frente a un estándar de industria de 8 minutos en digital.',
            'Reducción del tiempo de apertura de cuentas a 7 minutos, incremento de la conversión de prospectos digitales del 18% al 42% y habilitación de 24x7 sin fricción presencial.',
            560000,'2026-10-01',
            [c(A,'2026-04-04','Solicitud en revisión. La PMO evaluará el cumplimiento de la Circular 029 de la SFC para vinculación digital.')]),
        req(16,'Gestión de Riesgo Operacional (ORM)',PEND,PMO,'2026-04-01','riesgos','media','analitica',
            'Los eventos de riesgo operacional se registran en planillas Excel con frecuencia mensual, sin alertas tempranas ni seguimiento de controles, incumpliendo los estándares de Basilea III.',
            'Registro en tiempo real de eventos de riesgo, dashboards para el comité de riesgos y reducción del capital regulatorio requerido por mejor gestión de pérdidas operativas.',
            780000,'2026-08-15',
            [c(S,'2026-04-01','Se incluye matriz de riesgos operacionales actual y mapeo con los requerimientos de Basilea III.')]),
        req(17,'Automatización Mesa de Servicio TI',PEND,PMO,'2026-03-30','ti','baja','desarrollo',
            'El service desk recibe 4.200 tickets mensuales con un FCR del 38% y MTTR de 6.4 horas, por debajo del benchmark de la industria bancaria (FCR 65%, MTTR 2.1 horas).',
            'Incrementar el FCR al 68% mediante IA de clasificación y solución automática, reducir el MTTR a 2.3 horas y liberar 2 FTE para proyectos de mayor complejidad.',
            240000,'2026-07-01',
            [c(A,'2026-03-31','Solicitud recibida. El equipo de PMO verificará la integración con el ITSM existente antes de aprobar.')]),
        req(18,'Nómina en la Nube (HR Cloud)',PEND,PMO,'2026-03-28','recursos_humanos','media','integracion',
            'El sistema de nómina on-premise requiere 18 días de procesamiento mensual, es incapaz de liquidar componentes variables en tiempo real y no está integrado con el módulo de ausencias.',
            'Cierre de nómina en 3 días, integración con el sistema de control de tiempo, liquidación de comisiones en tiempo real y reducción del error de nómina del 2.8% al 0.1%.',
            920000,'2026-09-15',
            [c(S,'2026-03-28','Adjunto comparativo de proveedores cloud HR y análisis de impacto en la integración con el core financiero.')]),
        req(19,'Plataforma de Factoring Electrónico',PEND,PMO,'2026-03-26','finanzas','alta','desarrollo',
            'La operación de factoring se gestiona con formularios físicos y confirmación manual, con tiempos de desembolso de 5 días vs. el estándar del mercado de 4 horas.',
            'Reducción del tiempo de desembolso a 4 horas, procesamiento de 3.000 facturas diarias sin intervención manual y apertura del producto a 800 nuevas empresas proveedoras.',
            1650000,'2026-08-01',
            [c(A,'2026-03-27','La PMO confirma recepción. Se requerirá concepto jurídico sobre el marco regulatorio del factoring electrónico.')]),
        req(20,'Modernización Banca Corresponsal',PEND,PMO,'2026-03-24','operaciones','alta','transformacion',
            'La red de corresponsales no tiene visibilidad en tiempo real de transacciones, con conciliaciones T+2 que generan diferencias y reclamos que toman hasta 15 días hábiles en resolverse.',
            'Conciliación en tiempo real con los 1.200 corresponsales, reducción del 85% en diferencias y reclamos, y habilitación de nuevos servicios como recargas y pagos de impuestos.',
            3400000,'2026-07-15',
            [c(S,'2026-03-24','Solicitud ingresada. Incluye mapa de la red de corresponsales y análisis de impacto en el flujo de caja operativo.')]),

        /* ── EVALUACIÓN FINANCIERA (10) ────────────────────────────────────── */
        req(21,'Motor de Precios en Tiempo Real',PEND,TEC,'2026-03-10','finanzas','alta','analitica',
            'La fijación de tasas para créditos de consumo se actualiza manualmente cada semana, perdiendo competitividad ante fintechs que ajustan precios en tiempo real según el perfil del cliente.',
            'Personalización de tasas en tiempo real para 1.2M de clientes activos, incremento de la tasa de aprobación en un 18% y reducción de la prima de riesgo promedio en 40 puntos básicos.',
            2300000,'2026-08-01',
            [c(S,'2026-03-10','Solicitud enviada. Adjunto benchmark de capacidades de pricing dinámico en el sector bancario latinoamericano.'),
             c(A,'2026-03-15','Revisión PMO aprobada. Proyecto de alto impacto estratégico. Pasa a evaluación financiera para validar ROI y modelo de costo.')]),
        req(22,'Sistema AML v3.0 con ML',PEND,TEC,'2026-03-08','riesgos','alta','seguridad',
            'El sistema antilavado actual genera 2.400 alertas diarias con una tasa de falso positivo del 91%, consumiendo el 80% de la capacidad del equipo de cumplimiento en revisiones infructuosas.',
            'Reducción de alertas a 300 diarias con falso positivo del 35%, liberación de 12 analistas de cumplimiento para casos complejos y mejora en la detección de tipologías emergentes.',
            3100000,'2026-07-01',
            [c(S,'2026-03-08','Adjunto análisis de capacidades del sistema actual y benchmarks de soluciones de ML para AML en la región.'),
             c(A,'2026-03-12','PMO aprueba la iniciativa por urgencia regulatoria y riesgo reputacional. Evaluación financiera iniciada.')]),
        req(23,'Plataforma Leasing Digital',PEND,TEC,'2026-03-06','operaciones','media','desarrollo',
            'El proceso de arrendamiento financiero requiere 12 días desde la solicitud hasta el desembolso, con 9 puntos de intervención manual que generan errores y retrasos frecuentes.',
            'Reducción del ciclo de leasing de 12 a 3 días, habilitación del autoservicio para renovaciones y cierre anticipado, y expansión de la cartera de leasing en un 40%.',
            1050000,'2026-09-01',
            [c(A,'2026-03-07','Revisión PMO completada. Proyecto alineado con el plan de expansión de productos de tesorería corporativa.'),
             c(S,'2026-03-10','Adjunto análisis de competidores y propuesta técnica de la solución.')]),
        req(24,'Kubernetes Enterprise para Microservicios',PEND,TEC,'2026-03-05','ti','alta','infraestructura',
            'Las aplicaciones críticas se despliegan en servidores físicos con ciclos de release de 6 semanas y sin capacidad de escalado automático, impidiendo responder a picos de demanda.',
            'Reducción del ciclo de release a 2 días, escalado automático para soportar picos de hasta 10x la demanda promedio y reducción del 40% en costos de infraestructura.',
            1800000,'2026-07-15',
            [c(S,'2026-03-05','Adjunto roadmap técnico de adopción de contenedores y análisis de madurez DevOps del equipo de TI.'),
             c(A,'2026-03-10','PMO da visto bueno. El proyecto es habilitador de la estrategia de modernización tecnológica. Pasa a análisis financiero.')]),
        req(25,'Sistema Integral de Sucursales',PEND,TEC,'2026-03-03','operaciones','media','integracion',
            'Los 65 gestores de sucursal operan con cuatro aplicaciones diferentes sin integración, generando doble digitación y un tiempo de atención promedio de 18 minutos por transacción.',
            'Reducción del tiempo de atención a 7 minutos, experiencia unificada en la aplicación del gestor y capacidad de atención de 95 clientes/día por sucursal vs. los 52 actuales.',
            1300000,'2026-08-15',
            [c(A,'2026-03-04','PMO aprobó la iniciativa. El proyecto responde a la estrategia de eficiencia operativa en red de distribución.'),
             c(A,'2026-03-12','Evaluación financiera en proceso. Se solicita al solicitante un análisis detallado del costo de implementación por sucursal.')]),
        req(26,'Reskilling en Transformación Digital',PEND,TEC,'2026-03-01','recursos_humanos','baja','transformacion',
            'Solo el 23% del personal de la organización tiene competencias digitales básicas. La brecha aumenta con la aceleración tecnológica y pone en riesgo la adopción de nuevas plataformas.',
            'Certificación del 70% del personal en competencias digitales en 18 meses, incremento del 45% en la tasa de adopción de nuevas herramientas y reducción de la resistencia al cambio.',
            280000,'2026-09-01',
            [c(S,'2026-03-01','Solicitud acompañada del diagnóstico de brechas digitales por área y la propuesta de contenidos con proveedores especializados.'),
             c(A,'2026-03-05','PMO aprueba. Proyecto habilitador clave para la transformación digital organizacional. Evaluación financiera iniciada.')]),
        req(27,'Módulo de Divisas y FX en Línea',PEND,TEC,'2026-02-28','operaciones','media','desarrollo',
            'Las operaciones de cambio de divisas se procesan con un diferimiento de 15 minutos respecto al mercado, generando pérdidas por diferencial y riesgo de spread adverso en operaciones grandes.',
            'Operación FX en tiempo real con tasa interbancaria, reducción de la exposición cambiaria y habilitación del autoservicio de divisas para clientes empresariales vía banca electrónica.',
            950000,'2026-07-01',
            [c(A,'2026-02-28','PMO aprueba el proyecto por su impacto en el negocio de tesorería corporativa. Pasa a revisión financiera.'),
             c(S,'2026-03-03','Se adjunta análisis del impacto en el margen de intermediación y modelo de precios para el autoservicio de divisas.')]),
        req(28,'Analítica Predictiva de Abandono de Clientes',PEND,TEC,'2026-02-26','marketing','alta','analitica',
            'El banco pierde 4.800 clientes al mes por abandono sin detectar señales de churn con suficiente anticipación para activar campañas de retención efectivas.',
            'Predicción de churn con 21 días de anticipación, reducción de la tasa de abandono del 1.8% al 0.9% mensual y ahorro de $12M anuales en costos de reactivación.',
            740000,'2026-06-15',
            [c(S,'2026-02-26','Solicitud presentada con modelo conceptual de variables predictoras y benchmarks de efectividad en el sector financiero.'),
             c(A,'2026-03-01','PMO aprueba el proyecto por su alto impacto en la rentabilidad del portafolio de clientes activos. Evaluación financiera en curso.')]),
        req(29,'Compliance FATCA/CRS Automatizado',PEND,TEC,'2026-02-24','riesgos','alta','seguridad',
            'El proceso de reporte FATCA y CRS requiere 280 horas-analista anuales y utiliza exportaciones manuales de datos, con riesgo de errores e incumplimientos con la autoridad tributaria.',
            'Automatización del 100% del proceso de reporte, reducción a 8 horas-analista anuales y eliminación del riesgo de sanciones fiscales internacionales.',
            1550000,'2026-07-15',
            [c(A,'2026-02-25','PMO aprueba por urgencia regulatoria. El incumplimiento FATCA/CRS conlleva sanciones del IRS y pérdida de acceso a mercados internacionales.'),
             c(S,'2026-02-28','Se adjunta análisis técnico del gap entre los requerimientos actuales y la solución propuesta.')]),
        req(30,'Facturación Electrónica Integrada con Core',PEND,TEC,'2026-02-22','finanzas','media','integracion',
            'La generación de facturas electrónicas para los 42.000 clientes de banca empresarial no está integrada con el core bancario, requiriendo doble digitación y generando inconsistencias.',
            'Eliminación de la doble digitación, generación automática de 95.000 facturas mensuales integradas con el core y reducción del 99% en facturas con errores.',
            680000,'2026-08-01',
            [c(S,'2026-02-22','Solicitud enviada. Adjunto mapa de integraciones requeridas entre el sistema de facturación y los módulos del core bancario.'),
             c(A,'2026-02-26','PMO aprueba. El proyecto cumple con la normativa de facturación electrónica DIAN 2026. Pasa a evaluación de costos.')]),

        /* ── APROBACIÓN / DIRECTOR (10) ────────────────────────────────────── */
        req(31,'Cloud Híbrida Corporativa',PEND,DIR,'2026-01-15','ti','alta','infraestructura',
            'El 85% de las cargas de trabajo críticas corren on-premise, con una capacidad de cómputo que se proyecta al 95% de utilización en Q3 2026, sin posibilidad de escalar sin inversión en hierro.',
            'Migración del 60% de cargas no críticas a nube pública, reducción del 35% en CAPEX de infraestructura y habilitación de escalado elástico en horas para picos de demanda.',
            5200000,'2026-06-01',
            [c(S,'2026-01-15','Se adjunta arquitectura de referencia y análisis de TCO a 5 años vs. expansión on-premise.'),
             c(A,'2026-01-20','Revisión PMO aprobada. Proyecto estratégico alineado con la hoja de ruta tecnológica 2026-2030.'),
             c(A,'2026-02-10','Evaluación financiera completada. ROI de 28% en 3 años. TCO 35% inferior a la alternativa on-premise. Pasa a aprobación de dirección.')]),
        req(32,'Sistema de Trading Algorítmico',PEND,DIR,'2026-01-12','finanzas','alta','analitica',
            'La mesa de dinero ejecuta operaciones de renta fija y FX de forma manual, con latencias de decisión de 8 minutos que impiden aprovechar oportunidades de mercado de duración menor a 2 minutos.',
            'Reducción de la latencia de decisión a 150ms, incremento del ingreso de la mesa de dinero en $4.8M anuales y reducción del riesgo de mercado por sistematización de stops.',
            4100000,'2026-07-01',
            [c(S,'2026-01-12','Adjunto modelo conceptual del sistema de trading y análisis de impacto regulatorio según Circular 041 de la SFC.'),
             c(A,'2026-01-18','PMO aprueba. La iniciativa es clave para la competitividad de la tesorería corporativa.'),
             c(A,'2026-02-15','Análisis financiero concluido. VPN positivo en $6.2M a 3 años. Pendiente aprobación del director de tesorería.')]),
        req(33,'Pagos QR y Billetera Digital',PEND,DIR,'2026-01-10','operaciones','alta','desarrollo',
            'El banco no cuenta con solución de pagos QR interoperables, perdiendo cuota de mercado frente a competidores que ya procesan el 28% de sus transacciones retail por este canal.',
            'Captura del 18% de transacciones retail en QR al primer año, reducción del costo por transacción de $420 a $85 y habilitación de 2.1M de clientes en el ecosistema de pagos digitales.',
            2800000,'2026-05-15',
            [c(S,'2026-01-10','Propuesta técnica adjunta con arquitectura de interoperabilidad ACH Colombia y análisis de seguridad.'),
             c(A,'2026-01-15','PMO aprueba por urgencia competitiva. El mercado de pagos QR crece al 140% anual en Colombia.'),
             c(A,'2026-02-08','Evaluación financiera favorable. Payback a 22 meses. El comité financiero recomienda la aprobación.')]),
        req(34,'Transformación Core de Riesgos',PEND,DIR,'2026-01-08','riesgos','alta','transformacion',
            'El sistema de gestión de riesgos no está integrado con el core bancario en tiempo real, generando ventanas de exposición de hasta 4 horas en el cálculo de límites y concentraciones de crédito.',
            'Cálculo de riesgo en tiempo real, cumplimiento total de Basilea IV, reducción del capital regulatorio en $45M por mejor asignación y prevención de sobrelímites en concentración.',
            6500000,'2026-08-01',
            [c(S,'2026-01-08','Solicitud acompañada del análisis de brechas Basilea IV y roadmap técnico de integración con el core.'),
             c(A,'2026-01-14','PMO aprueba. La iniciativa responde a una exigencia regulatoria con plazo definido para 2027.'),
             c(A,'2026-02-05','Evaluación financiera concluida. El costo del proyecto es inferior al capital regulatorio adicional que se evita.')]),
        req(35,'Centro de Operaciones de Seguridad (SOC)',PEND,DIR,'2026-01-06','ti','alta','seguridad',
            'El banco no tiene capacidad de detección y respuesta ante incidentes de ciberseguridad en tiempo real. En 2025 se detectaron 3 incidentes mayores con tiempos de respuesta de 72 horas.',
            'Detección de amenazas en menos de 15 minutos, reducción del MTTD de 72 horas a 12 minutos, cumplimiento de la Circular 007 de la SFC y protección de $380M en activos digitales.',
            3700000,'2026-06-15',
            [c(S,'2026-01-06','Propuesta técnica con modelo de operación SOC 24x7 y análisis de los 3 incidentes del año anterior.'),
             c(A,'2026-01-12','PMO aprueba. La ciberseguridad es una prioridad regulatoria de máxima urgencia para la junta directiva.'),
             c(A,'2026-02-03','Análisis financiero favorable. El costo de un incidente mayor excede 8 veces la inversión del SOC.')]),
        req(36,'Sucursales Express Digitales',PEND,DIR,'2026-01-04','operaciones','media','transformacion',
            'El modelo de sucursal actual tiene un costo operativo promedio de $48M anuales por punto, mientras que los modelos express del mercado operan al 35% de ese costo con igual satisfacción.',
            'Conversión de 20 sucursales tradicionales a modelo express, ahorro de $520M anuales en OPEX, reducción del tiempo de atención en un 50% y habilitación del modelo híbrido.',
            1900000,'2026-07-01',
            [c(A,'2026-01-05','PMO aprueba la iniciativa. El rediseño de la red de distribución es parte del plan estratégico 2026-2028.'),
             c(S,'2026-01-10','Adjunto análisis de 20 sucursales candidatas y propuesta de rediseño del modelo de servicio.'),
             c(A,'2026-01-30','Evaluación financiera completada. Payback a 18 meses. Se recomienda iniciar con 5 sucursales piloto.')]),
        req(37,'Crédito PYME 100% Digital',PEND,DIR,'2026-01-02','finanzas','alta','desarrollo',
            'La banca PYME origina $1.200M mensuales en crédito con un proceso que tarda 18 días, mientras los competidores digitales lo hacen en 48 horas, generando pérdida de clientes.',
            'Originar crédito PYME en 24 horas, incrementar la cartera PYME en un 32% al primer año y reducir el costo de originación de $280.000 a $45.000 por operación.',
            2400000,'2026-05-01',
            [c(S,'2026-01-02','Solicitud con análisis del mercado PYME, benchmarks de la competencia y modelo de decisión crediticia propuesto.'),
             c(A,'2026-01-08','PMO aprueba. El segmento PYME es estratégico y el banco está perdiendo cuota ante fintechs especializadas.'),
             c(A,'2026-01-28','Evaluación financiera concluida. Incremento en NIM del 0.18% por mayor volumen y margen en PYME. Se eleva a aprobación del director.')]),
        req(38,'Change Management y Cultura Ágil',PEND,DIR,'2025-12-28','recursos_humanos','media','transformacion',
            'El 68% de los proyectos tecnológicos fallan en su adopción por resistencia organizacional, generando pérdidas en las inversiones realizadas y desmotivación de los equipos de proyecto.',
            'Reducción del índice de fracaso en adopción del 68% al 25%, incremento del engagement de empleados en proyectos de cambio y medición del ROI de change management por iniciativa.',
            680000,'2026-06-01',
            [c(A,'2025-12-29','PMO aprueba. El programa de gestión del cambio es un habilitador crítico para el portafolio de proyectos.'),
             c(S,'2026-01-05','Adjunto propuesta metodológica y presupuesto desglosado por actividad.'),
             c(A,'2026-01-25','Evaluación financiera favorable. El ROI se mide por reducción en fracasos de proyectos. Pasa a aprobación de dirección de RRHH.')]),
        req(39,'Business Intelligence Ejecutivo (BI)',PEND,DIR,'2025-12-26','finanzas','media','analitica',
            'La alta dirección recibe reportes de gestión con 3 días de rezago y en formato PDF estático, imposibilitando el análisis ad hoc y la toma de decisiones basada en datos en tiempo real.',
            'Dashboards ejecutivos en tiempo real, reducción del tiempo de preparación de comités de junta de 40 a 4 horas-analista y habilitación de análisis de escenarios en autoservicio.',
            1150000,'2026-07-01',
            [c(S,'2025-12-26','Propuesta técnica con inventario de indicadores clave por área de negocio y mockups de los dashboards ejecutivos.'),
             c(A,'2025-12-30','PMO aprueba. El proyecto responde a una solicitud directa de la junta directiva.'),
             c(A,'2026-01-20','Evaluación financiera completada. El costo es justificado por la mejora en la velocidad de decisión ejecutiva.')]),
        req(40,'Expansión Datacenter Región Norte',PEND,DIR,'2025-12-24','ti','alta','infraestructura',
            'La capacidad de cómputo en la región norte del país depende de la conectividad WAN al datacenter central, generando latencias de 280ms en operaciones críticas y riesgo de corte total.',
            'Latencia reducida a 8ms en la región norte, disponibilidad del 99.99% independiente de la conectividad WAN y soporte para el crecimiento del 45% proyectado en 3 años.',
            8200000,'2026-09-01',
            [c(S,'2025-12-24','Adjunto estudio de factibilidad técnica, análisis de proveedores y proyecciones de capacidad a 5 años.'),
             c(A,'2025-12-30','PMO aprueba. La expansión es crítica para la estrategia de regionalización del banco.'),
             c(A,'2026-01-22','Análisis financiero: TCO inferior en 28% a la alternativa de expansión del datacenter central. Listo para aprobación final.')]),

        /* ── APROBADAS (10) — con datos de implementación por etapa ─────────── */

        /* ── 1. INICIACIÓN ────────────────────────────────────── req 41 ── */
        req(41,'Migración Core Bancario a Temenos T24',APPR,DIR,'2025-08-10','ti','alta','transformacion',
            'El core bancario tiene 24 años de antigüedad, funciona en COBOL sobre mainframe con costos de mantenimiento crecientes al 18% anual y no soporta la oferta de productos digitales requerida.',
            'Plataforma bancaria moderna con API-first, reducción del 45% en costos de mantenimiento, time-to-market de nuevos productos de 6 meses a 3 semanas y base para Open Finance.',
            12500000,'2025-11-01',
            [c(S,'2025-08-10','Solicitud con análisis de 4 proveedores de core bancario, benchmarks de implementaciones en la región y análisis de riesgo.'),
             c(A,'2025-08-18','PMO aprueba. Proyecto de máxima prioridad estratégica. Alineado con el Plan de Transformación Digital 2025-2030.'),
             c(A,'2025-09-15','Evaluación financiera concluida. VPN de $28M a 7 años. El costo de no hacer supera 2x la inversión en 3 años.'),
             c(A,'2025-10-05','Junta Directiva aprueba el proyecto por unanimidad. El comité de transformación hará seguimiento mensual.')],
            mkImpl('iniciacion','2026-02-01',{
                iniciacion:[
                    d('acta_constitucion','Acta_Constitucion_CoreBancario_v1.0.pdf','pdf','2026-02-03'),
                    d('stakeholders','Registro_Stakeholders_CoreBancario.xlsx','excel','2026-02-05'),
                    d('plan_comunicacion','Plan_Comunicacion_Proyecto_Core.docx','word','2026-02-07'),
                    d('acta_kickoff','Acta_KickOff_CoreBancario_2026-02-10.pdf','pdf','2026-02-10')
                ]
            },[
                pm('2026-02-03','Proyecto iniciado formalmente. Acta de constitución firmada por el CEO y el CIO. Equipo base conformado: 3 PM, 2 arquitectos, 1 PMO.'),
                pm('2026-02-10','Kick-off realizado con asistencia de 45 personas. Stakeholders mapeados en 4 niveles de influencia/interés. Cronograma master presentado.')
            ],[
                {stage:'iniciacion',movedAt:'2026-02-01',movedBy:'pm@banco.com'}
            ])),

        /* ── 2. ANÁLISIS Y DISEÑO ─────────────────────── req 42 y 43 ──── */
        req(42,'Plataforma ML Antifraude en Tiempo Real',APPR,DIR,'2025-09-05','riesgos','alta','seguridad',
            'El sistema de detección de fraude procesa transacciones con latencia de 3 segundos y detecta solo el 61% de los eventos fraudulentos, con pérdidas de $18M anuales.',
            'Detección del 94% de fraudes en menos de 80ms, reducción de pérdidas por fraude de $18M a $2.8M anuales y disminución de la tasa de falsos positivos del 38% al 8%.',
            4800000,'2025-12-01',
            [c(S,'2025-09-05','Solicitud con análisis de pérdidas actuales, modelo conceptual de ML y evaluación de tres proveedores especializados.'),
             c(A,'2025-09-12','PMO aprueba. La reducción de pérdidas por fraude es prioritaria para el comité de riesgos.'),
             c(A,'2025-10-08','Análisis financiero: payback en 8 meses por ahorro en pérdidas. La junta aprobó la inversión sin objeciones.'),
             c(A,'2025-11-02','Proyecto aprobado y en ejecución. Fase 1 (modelos de scoring) completada. Fase 2 (integración tiempo real) en curso.')],
            mkImpl('analisis','2025-12-10',{
                iniciacion:[
                    d('acta_constitucion','Acta_Constitucion_MLAntifraude.pdf','pdf','2025-12-12'),
                    d('stakeholders','Stakeholders_MLAntifraude_v1.xlsx','excel','2025-12-13'),
                    d('plan_comunicacion','Plan_Comunicacion_Antifraude.docx','word','2025-12-15'),
                    d('acta_kickoff','Acta_KickOff_Antifraude.pdf','pdf','2025-12-18')
                ],
                analisis:[
                    d('brd_frd','BRD_MLAntifraude_v2.0.docx','word','2026-01-10'),
                    d('arquitectura','Arquitectura_ML_Pipeline_v1.3.pdf','pdf','2026-01-15'),
                    d('plan_proyecto','Cronograma_MLAntifraude_MS-Project.xlsx','excel','2026-01-18'),
                    d('matriz_riesgos','Matriz_Riesgos_Tecnica_Antifraude.xlsx','excel','2026-01-20')
                ]
            },[
                pm('2025-12-12','Iniciación completada en 8 días. Aprobación del PMO para avanzar a Análisis.'),
                pm('2026-01-10','BRD finalizado con 312 requerimientos funcionales y 48 no funcionales. Revisado por el equipo de riesgos.'),
                pm('2026-01-20','Arquitectura de referencia aprobada por el arquitecto empresarial. Pendiente plan de proyecto detallado con sprints.')
            ],[
                {stage:'iniciacion',movedAt:'2025-12-10',movedBy:'pm@banco.com'},
                {stage:'analisis',  movedAt:'2026-01-08',movedBy:'pm@banco.com'}
            ])),

        req(43,'Portal Corporativo de Inversiones',APPR,DIR,'2025-10-01','finanzas','alta','desarrollo',
            'Los clientes institucionales gestionan sus inversiones en renta fija y FX a través de llamadas telefónicas y correos, sin visibilidad en tiempo real de sus portafolios.',
            'Autoservicio de inversiones para 380 clientes institucionales, incremento del AUM en $850M en el primer año y reducción del 60% en operaciones manuales de la mesa de dinero.',
            2100000,'2026-01-15',
            [c(S,'2025-10-01','Propuesta con benchmarks de portales de inversión corporativa y análisis de la demanda de los principales 50 clientes institucionales.'),
             c(A,'2025-10-08','PMO aprueba. El portal es un diferenciador competitivo clave en banca corporativa.'),
             c(A,'2025-11-05','Evaluación financiera favorable. El incremento de AUM justifica la inversión en 14 meses.'),
             c(A,'2025-12-01','Aprobado por la dirección de banca corporativa y finanzas. Desarrollo iniciado.')],
            mkImpl('analisis','2026-01-15',{
                iniciacion:[
                    d('acta_constitucion','Acta_Constitucion_PortalInversiones.pdf','pdf','2026-01-17'),
                    d('stakeholders','Registro_Stakeholders_Portal.xlsx','excel','2026-01-18'),
                    d('acta_kickoff','Acta_KickOff_PortalInversiones.pdf','pdf','2026-01-22')
                ],
                analisis:[
                    d('brd_frd','FRD_PortalInversiones_v1.1.docx','word','2026-02-05'),
                    d('arquitectura','Arquitectura_Portal_Investment_v1.0.pdf','pdf','2026-02-10')
                ]
            },[
                pm('2026-01-22','Kick-off exitoso. 14 stakeholders identificados en banca corporativa y mesa de dinero.'),
                pm('2026-02-10','Arquitectura aprobada. Usaremos microservicios con API Gateway. Pendiente el cronograma detallado con el proveedor seleccionado.')
            ],[
                {stage:'iniciacion',movedAt:'2026-01-15',movedBy:'pm@banco.com'},
                {stage:'analisis',  movedAt:'2026-02-03',movedBy:'pm@banco.com'}
            ])),

        /* ── 3. CONSTRUCCIÓN ──────────────────────────── req 44 y 45 ──── */
        req(44,'Datacenter Tier IV Región Andina',APPR,DIR,'2025-07-15','ti','alta','infraestructura',
            'El banco no cuenta con infraestructura de procesamiento que garantice la continuidad ante desastres naturales o fallas de suministro eléctrico en la región andina donde opera el 70% del negocio.',
            'Disponibilidad del 99.999% (Tier IV), tiempo de conmutación menor a 30 segundos, certificación Uptime Institute y cumplimiento de la Circular de Continuidad Operacional.',
            9300000,'2026-02-01',
            [c(S,'2025-07-15','Adjunto estudio de factibilidad, análisis de 3 ubicaciones candidatas y análisis sísmico de la región.'),
             c(A,'2025-07-22','PMO aprueba. La continuidad operacional es una prioridad regulatoria de primer nivel.'),
             c(A,'2025-08-20','Evaluación financiera concluida. El costo de una interrupción mayor supera 4x la inversión en infraestructura.'),
             c(A,'2025-09-10','Junta Directiva aprueba la inversión. Proceso de licitación abierto con 5 constructores certificados Tier IV.')],
            mkImpl('construccion','2025-10-01',{
                iniciacion:[
                    d('acta_constitucion','Acta_Constitucion_DatacenterTierIV.pdf','pdf','2025-10-03'),
                    d('stakeholders','Stakeholders_Datacenter_v1.xlsx','excel','2025-10-05'),
                    d('plan_comunicacion','Plan_Comunicacion_Datacenter.docx','word','2025-10-07'),
                    d('acta_kickoff','Acta_KickOff_Datacenter_Oct2025.pdf','pdf','2025-10-10')
                ],
                analisis:[
                    d('brd_frd','Especificaciones_TecnicasDatacenter_v3.0.pdf','pdf','2025-11-05'),
                    d('arquitectura','Arquitectura_Datacenter_TierIV_v2.1.pdf','pdf','2025-11-12'),
                    d('plan_proyecto','Cronograma_Datacenter_24meses.xlsx','excel','2025-11-18'),
                    d('matriz_riesgos','Análisis_Riesgos_Datacenter_v1.pdf','pdf','2025-11-22'),
                    d('aprobacion_diseno','Acta_Aprobacion_Diseño_Datacenter.pdf','pdf','2025-12-01')
                ],
                construccion:[
                    d('informe_avance','Informe_Avance_Datacenter_Feb2026.pdf','pdf','2026-02-15'),
                    d('actas_seguimiento','Actas_Comite_Seguimiento_Datacenter.pdf','pdf','2026-03-01')
                ]
            },[
                pm('2025-10-10','Proyecto iniciado. Terreno seleccionado en zona franca de Bogotá. Contrato firmado con Turner Construction.'),
                pm('2025-12-01','Diseño arquitectónico y estructural aprobado por Uptime Institute. Inicio de obras civiles el 15-ene-2026.'),
                pm('2026-02-15','Obras civiles al 42%. Estructura metálica completada. Instalaciones eléctricas de alta tensión en progreso. Sin desviaciones de cronograma.')
            ],[
                {stage:'iniciacion',  movedAt:'2025-10-01',movedBy:'pm@banco.com'},
                {stage:'analisis',    movedAt:'2025-11-03',movedBy:'pm@banco.com'},
                {stage:'construccion',movedAt:'2026-01-20',movedBy:'pm@banco.com'}
            ])),

        req(45,'Omnicanalidad de Atención al Cliente',APPR,DIR,'2025-10-20','marketing','alta','transformacion',
            'Los 5 canales de atención operan en silos con experiencias inconsistentes, sin contexto compartido del cliente. El 43% de los clientes reporta haber repetido información al pasar de canal.',
            'Visión 360 del cliente en todos los canales, reducción del CSAT de 62 a 84 puntos, disminución del AHT en un 38% y eliminación de la necesidad de repetir información al cambiar de canal.',
            3600000,'2026-01-15',
            [c(S,'2025-10-20','Solicitud con customer journey map actual, análisis de pain points y propuesta de arquitectura omnicanal.'),
             c(A,'2025-10-27','PMO aprueba. La experiencia del cliente es el eje central de la estrategia comercial 2026-2028.'),
             c(A,'2025-11-25','Evaluación financiera favorable. El incremento en retención de clientes genera $6.2M anuales adicionales.'),
             c(A,'2025-12-15','Director Comercial aprueba. Proyecto en ejecución con Accenture como integrador principal.')],
            mkImpl('construccion','2026-01-05',{
                iniciacion:[
                    d('acta_constitucion','Acta_Constitucion_Omnicanalidad.pdf','pdf','2026-01-07'),
                    d('stakeholders','Stakeholders_Omnicanalidad.xlsx','excel','2026-01-08'),
                    d('plan_comunicacion','Plan_Comunicacion_Omnicanal.docx','word','2026-01-10'),
                    d('acta_kickoff','Acta_KickOff_Omnicanalidad.pdf','pdf','2026-01-12')
                ],
                analisis:[
                    d('brd_frd','BRD_Omnicanalidad_v2.docx','word','2026-01-28'),
                    d('arquitectura','Arquitectura_Omnicanal_CustomerData.pdf','pdf','2026-02-02'),
                    d('plan_proyecto','Cronograma_Omnicanalidad_Q2-2026.xlsx','excel','2026-02-05'),
                    d('aprobacion_diseno','Acta_Aprobacion_Diseño_Omnicanal.pdf','pdf','2026-02-12')
                ],
                construccion:[
                    d('informe_avance','Informe_Progreso_Sprint3_Omnicanalidad.pdf','pdf','2026-03-10'),
                    d('doc_tecnica','Documentacion_Tecnica_APIs_Omnicanal_v1.pdf','pdf','2026-03-12')
                ]
            },[
                pm('2026-01-12','Kick-off realizado. Accenture presentó el plan de trabajo. 4 sprints de 3 semanas para módulo de CDP (Customer Data Platform).'),
                pm('2026-02-18','Análisis y diseño completados. Arquitectura de Customer Data Platform aprobada. Integración con Salesforce y Genesys definida.'),
                pm('2026-03-10','Sprint 3 completado. CDP en integración con CRM. Canal de app móvil: 68% completado. Chat: 45%. Agente físico: 30%.')
            ],[
                {stage:'iniciacion',  movedAt:'2026-01-05',movedBy:'pm@banco.com'},
                {stage:'analisis',    movedAt:'2026-01-26',movedBy:'pm@banco.com'},
                {stage:'construccion',movedAt:'2026-02-16',movedBy:'pm@banco.com'}
            ])),

        /* ── 4. PRUEBAS ───────────────────────────────── req 46 y 47 ──── */
        req(46,'Sistema de Tesorería Integrado (TMS)',APPR,DIR,'2025-11-05','finanzas','alta','analitica',
            'La tesorería gestiona posiciones de liquidez en tiempo real con hojas de cálculo y actualizaciones manuales cada 2 horas, con riesgo de error en la gestión de límites de liquidez intradía.',
            'Visibilidad en tiempo real de la posición de liquidez en 12 divisas, cumplimiento LCR/NSFR automatizado y reducción del riesgo de incumplimiento de límites del banco central.',
            2850000,'2026-02-15',
            [c(S,'2025-11-05','Propuesta técnica con análisis del proceso actual de tesorería y evaluación de los tres principales TMS del mercado.'),
             c(A,'2025-11-12','PMO aprueba. La gestión de tesorería en tiempo real es un requerimiento regulatorio pendiente.'),
             c(A,'2025-12-10','Evaluación financiera concluida. El ahorro en costos de oportunidad por liquidez mal gestionada supera el costo del TMS.'),
             c(A,'2026-01-05','Aprobado por el director financiero y de tesorería. Implementación comenzó en febrero 2026.')],
            mkImpl('pruebas','2026-02-15',{
                iniciacion:[
                    d('acta_constitucion','Acta_Constitucion_TMS.pdf','pdf','2026-02-17'),
                    d('stakeholders','Stakeholders_TMS_Tesoreria.xlsx','excel','2026-02-18'),
                    d('plan_comunicacion','Plan_Comunicacion_TMS.docx','word','2026-02-20'),
                    d('acta_kickoff','Acta_KickOff_TMS.pdf','pdf','2026-02-22')
                ],
                analisis:[
                    d('brd_frd','FRD_TMS_Murex_v1.5.docx','word','2026-03-05'),
                    d('arquitectura','Arquitectura_Integracion_TMS_Core.pdf','pdf','2026-03-08'),
                    d('plan_proyecto','Gantt_TMS_Implementacion.xlsx','excel','2026-03-10'),
                    d('matriz_riesgos','Matriz_Riesgos_TMS.xlsx','excel','2026-03-12'),
                    d('aprobacion_diseno','Acta_Aprobacion_Diseño_TMS.pdf','pdf','2026-03-18')
                ],
                construccion:[
                    d('informe_avance','Informe_Construccion_TMS_Sem1.pdf','pdf','2026-04-01'),
                    d('doc_tecnica','Manual_Configuracion_Murex_v2.pdf','pdf','2026-04-05'),
                    d('actas_seguimiento','Actas_Seguimiento_Marzo_TMS.pdf','pdf','2026-04-08'),
                    d('control_cambios','Control_Cambios_Alcance_TMS_v1.docx','word','2026-04-10')
                ],
                pruebas:[
                    d('plan_pruebas','Plan_UAT_TMS_v2.0.pdf','pdf','2026-04-15'),
                    d('reporte_pruebas','Reporte_Ejecucion_UAT_TMS_Ciclo1.xlsx','excel','2026-04-20'),
                    d('reporte_defectos','Reporte_Defectos_TMS_Sprint5.xlsx','excel','2026-04-22')
                ]
            },[
                pm('2026-02-22','Kick-off TMS realizado con equipo de tesorería y consultoría de Murex. 14 semanas de implementación planificadas.'),
                pm('2026-03-18','Diseño de integración TMS-Core aprobado. 47 interfaces de datos mapeadas y documentadas.'),
                pm('2026-04-01','Construcción completada al 100%. Todos los procesos de tesorería configurados en Murex. Iniciando UAT.'),
                pm('2026-04-22','UAT Ciclo 1: 124 casos ejecutados, 108 exitosos (87%). 16 defectos encontrados, 12 resueltos. Ciclo 2 inicia el 25-abr.')
            ],[
                {stage:'iniciacion',  movedAt:'2026-02-15',movedBy:'pm@banco.com'},
                {stage:'analisis',    movedAt:'2026-03-03',movedBy:'pm@banco.com'},
                {stage:'construccion',movedAt:'2026-03-20',movedBy:'pm@banco.com'},
                {stage:'pruebas',     movedAt:'2026-04-14',movedBy:'pm@banco.com'}
            ])),

        req(47,'RPA de Procesos Operativos Back Office',APPR,DIR,'2025-11-18','operaciones','media','integracion',
            'El back office procesa manualmente 28 tipos de tareas repetitivas que consumen 2.400 horas-analista mensuales, con una tasa de error del 3.8% que genera reprocesos y reclamos.',
            'Automatización de 28 procesos con RPA, liberación de 2.400 horas-analista para actividades de mayor valor y reducción de la tasa de error al 0.02%.',
            1450000,'2026-03-01',
            [c(S,'2025-11-18','Solicitud con inventario de 28 procesos candidatos, métricas de volumen y análisis de viabilidad de automatización.'),
             c(A,'2025-11-24','PMO aprueba. El RPA tiene impacto inmediato en eficiencia operativa y es de bajo riesgo tecnológico.'),
             c(A,'2025-12-20','Evaluación financiera: payback en 11 meses. ROI del 340% a 3 años.'),
             c(A,'2026-01-10','Director de Operaciones aprueba. Implementación inició con los 5 procesos de mayor volumen.')],
            mkImpl('pruebas','2026-01-15',{
                iniciacion:[
                    d('acta_constitucion','Acta_Constitucion_RPA_BackOffice.pdf','pdf','2026-01-17'),
                    d('stakeholders','Stakeholders_RPA_v1.xlsx','excel','2026-01-18'),
                    d('plan_comunicacion','Plan_Comunicacion_RPA.docx','word','2026-01-20'),
                    d('acta_kickoff','Acta_KickOff_RPA.pdf','pdf','2026-01-22')
                ],
                analisis:[
                    d('brd_frd','Inventario_28Procesos_RPA_v2.docx','word','2026-02-05'),
                    d('arquitectura','Arquitectura_RPA_UiPath_v1.pdf','pdf','2026-02-10'),
                    d('plan_proyecto','Cronograma_RPA_28Procesos.xlsx','excel','2026-02-12'),
                    d('aprobacion_diseno','Acta_Aprobacion_Diseno_RPA.pdf','pdf','2026-02-20')
                ],
                construccion:[
                    d('informe_avance','Informe_Avance_RPA_Fase1_14bots.pdf','pdf','2026-03-15'),
                    d('doc_tecnica','Documentacion_Tecnica_Bots_RPA_v1.pdf','pdf','2026-03-20'),
                    d('actas_seguimiento','Actas_Sprint_Review_RPA.pdf','pdf','2026-03-25')
                ],
                pruebas:[
                    d('plan_pruebas','Plan_Pruebas_UAT_RPA_28Procesos.pdf','pdf','2026-04-01')
                ]
            },[
                pm('2026-01-22','Kick-off con UiPath y equipo de operaciones. 28 procesos priorizados en 3 oleadas de automatización.'),
                pm('2026-02-20','Análisis completado. Arquitectura UiPath Orchestrator aprobada. 14 bots en primera oleada.'),
                pm('2026-03-25','Oleada 1 (14 bots) desplegada en ambiente QA. Tasa de error: 0.015%. Oleada 2 en construcción.'),
                pm('2026-04-01','Plan de pruebas UAT registrado. Inicio de ejecución el 05-abr con 80 casos de prueba por proceso.')
            ],[
                {stage:'iniciacion',  movedAt:'2026-01-15',movedBy:'pm@banco.com'},
                {stage:'analisis',    movedAt:'2026-02-03',movedBy:'pm@banco.com'},
                {stage:'construccion',movedAt:'2026-02-22',movedBy:'pm@banco.com'},
                {stage:'pruebas',     movedAt:'2026-03-28',movedBy:'pm@banco.com'}
            ])),

        /* ── 5. GO LIVE ───────────────────────────────── req 48 y 49 ──── */
        req(48,'Plataforma Open Finance',APPR,DIR,'2025-09-20','ti','alta','transformacion',
            'La regulación de Open Finance exige exponer datos de clientes (con su consentimiento) a terceros certificados antes de Q4 2026, bajo un esquema de APIs estandarizadas.',
            'Cumplimiento regulatorio, posicionamiento como banco líder en Open Finance, generación de ingresos por APIs premium y habilitación de 45 socios fintech en el ecosistema.',
            3200000,'2026-01-01',
            [c(S,'2025-09-20','Propuesta técnica con arquitectura de APIs Open Finance y análisis del marco regulatorio de la Superintendencia Financiera.'),
             c(A,'2025-09-27','PMO aprueba con máxima prioridad. El incumplimiento regulatorio implica sanciones de hasta $2.000M.'),
             c(A,'2025-10-25','Evaluación financiera favorable. El modelo de monetización de APIs genera ingresos estimados de $1.8M anuales.'),
             c(A,'2025-11-15','Junta Directiva aprueba de forma unánime. Proyecto catalogado como crítico para la continuidad del negocio.')],
            mkImpl('go_live','2025-11-20',{
                iniciacion:[
                    d('acta_constitucion','Acta_Constitucion_OpenFinance.pdf','pdf','2025-11-22'),
                    d('stakeholders','Stakeholders_OpenFinance.xlsx','excel','2025-11-24'),
                    d('plan_comunicacion','Plan_Comunicacion_OpenFinance.docx','word','2025-11-25'),
                    d('acta_kickoff','Acta_KickOff_OpenFinance.pdf','pdf','2025-11-28')
                ],
                analisis:[
                    d('brd_frd','FRD_OpenFinance_APIs_v3.docx','word','2025-12-15'),
                    d('arquitectura','Arquitectura_OpenFinance_APIGateway.pdf','pdf','2025-12-20'),
                    d('plan_proyecto','Cronograma_OpenFinance_2025-2026.xlsx','excel','2025-12-22'),
                    d('matriz_riesgos','Analisis_Riesgos_Regulatorio_OpenFinance.xlsx','excel','2025-12-28'),
                    d('aprobacion_diseno','Acta_Aprobacion_Diseño_OpenFinance.pdf','pdf','2026-01-05')
                ],
                construccion:[
                    d('informe_avance','Informe_Avance_OpenFinance_Enero2026.pdf','pdf','2026-01-31'),
                    d('doc_tecnica','Documentacion_APIs_OpenFinance_Swagger.pdf','pdf','2026-02-05'),
                    d('actas_seguimiento','Actas_Comite_Tecnico_OpenFinance.pdf','pdf','2026-02-15'),
                    d('control_cambios','Control_Cambios_Alcance_OpenFinance.docx','word','2026-02-20')
                ],
                pruebas:[
                    d('plan_pruebas','Plan_UAT_OpenFinance_v1.pdf','pdf','2026-03-01'),
                    d('reporte_pruebas','Reporte_Ejecucion_UAT_OpenFinance.xlsx','excel','2026-03-15'),
                    d('reporte_defectos','Reporte_Defectos_OpenFinance_Final.xlsx','excel','2026-03-28'),
                    d('certificacion_uat','Acta_Certificacion_UAT_OpenFinance.pdf','pdf','2026-04-01')
                ],
                go_live:[
                    d('checklist_produccion','Checklist_Pase_Produccion_OpenFinance.pdf','pdf','2026-04-08'),
                    d('plan_despliegue','Plan_Despliegue_Rollback_OpenFinance.pdf','pdf','2026-04-10'),
                    d('comunicacion_usuarios','Comunicacion_Fintech_Partners_OpenFinance.pdf','pdf','2026-04-12'),
                    d('acta_produccion','Acta_Puesta_Produccion_OpenFinance.pdf','pdf','2026-04-15')
                ]
            },[
                pm('2025-11-28','Proyecto iniciado con máxima prioridad regulatoria. Equipo de 18 personas. Deadline SFC: 30-sep-2026.'),
                pm('2026-01-05','Diseño de las 32 APIs Open Finance aprobado por la Superintendencia Financiera en reunión de trabajo.'),
                pm('2026-02-15','Construcción al 100%. 32 APIs desarrolladas, documentadas en Swagger y desplegadas en sandbox.'),
                pm('2026-04-01','UAT completado. 0 defectos críticos pendientes. Certificación firmada por el Director de TI y el Oficial de Cumplimiento.'),
                pm('2026-04-15','GO LIVE exitoso. Plataforma productiva. 12 fintechs conectadas en primera ola. Sin incidentes en las primeras 48 horas.')
            ],[
                {stage:'iniciacion',  movedAt:'2025-11-20',movedBy:'pm@banco.com'},
                {stage:'analisis',    movedAt:'2025-12-12',movedBy:'pm@banco.com'},
                {stage:'construccion',movedAt:'2026-01-08',movedBy:'pm@banco.com'},
                {stage:'pruebas',     movedAt:'2026-02-28',movedBy:'pm@banco.com'},
                {stage:'go_live',     movedAt:'2026-04-05',movedBy:'pm@banco.com'}
            ])),

        req(49,'SAP HCM Nómina Global',APPR,DIR,'2025-10-10','recursos_humanos','media','integracion',
            'La nómina de 4.800 empleados en 3 países se gestiona con sistemas independientes sin integración, generando inconsistencias en los beneficios y 18 días de procesamiento mensual.',
            'Nómina unificada en 3 países, cierre en 3 días, integración con SAP S/4HANA financiero y reducción del 94% en ajustes post-cierre por inconsistencias.',
            1800000,'2026-02-01',
            [c(S,'2025-10-10','Solicitud con análisis de los tres sistemas actuales, inventario de integraciones requeridas y propuesta de SAP HCM.'),
             c(A,'2025-10-16','PMO aprueba. La unificación de nómina es un prerequisito para la migración a SAP S/4HANA financiero.'),
             c(A,'2025-11-14','Evaluación financiera concluida. El ahorro en licencias y personal de soporte recupera la inversión en 26 meses.'),
             c(A,'2025-12-08','Director de RRHH y CFO aprueban el proyecto. Implementación iniciada con Deloitte como integrador.')],
            mkImpl('go_live','2025-12-10',{
                iniciacion:[
                    d('acta_constitucion','Acta_Constitucion_SAPHCM.pdf','pdf','2025-12-12'),
                    d('stakeholders','Stakeholders_SAP_HCM.xlsx','excel','2025-12-13'),
                    d('plan_comunicacion','Plan_Comunicacion_SAP_HCM.docx','word','2025-12-15'),
                    d('acta_kickoff','Acta_KickOff_SAP_HCM_Nomina.pdf','pdf','2025-12-18')
                ],
                analisis:[
                    d('brd_frd','BBP_SAP_HCM_Nomina_v2.docx','word','2026-01-10'),
                    d('arquitectura','Arquitectura_Integracion_SAPHCM_S4HANA.pdf','pdf','2026-01-15'),
                    d('plan_proyecto','Cronograma_SAP_HCM_20semanas.xlsx','excel','2026-01-18'),
                    d('aprobacion_diseno','Acta_Aprobacion_Diseño_SAP_HCM.pdf','pdf','2026-01-25')
                ],
                construccion:[
                    d('informe_avance','Informe_Configuracion_SAPHCM_Fase1.pdf','pdf','2026-02-20'),
                    d('doc_tecnica','Documentacion_Tecnica_SAP_HCM_v1.pdf','pdf','2026-02-25'),
                    d('actas_seguimiento','Actas_Steering_SAP_HCM_Feb2026.pdf','pdf','2026-03-01')
                ],
                pruebas:[
                    d('plan_pruebas','Plan_UAT_Nomina_SAP_HCM.pdf','pdf','2026-03-05'),
                    d('reporte_pruebas','Reporte_UAT_Nomina_Ciclo1y2.xlsx','excel','2026-03-20'),
                    d('reporte_defectos','Defectos_UAT_SAPHCM_Resueltos.xlsx','excel','2026-03-28'),
                    d('certificacion_uat','Certificacion_UAT_Nomina_Firmada.pdf','pdf','2026-04-02')
                ],
                go_live:[
                    d('checklist_produccion','GoLive_Checklist_SAPHCM.xlsx','excel','2026-04-10'),
                    d('plan_despliegue','Plan_Cutover_Nomina_SAP_HCM.pdf','pdf','2026-04-12')
                ]
            },[
                pm('2025-12-18','Kick-off con Deloitte. Equipo de 22 personas. Metodología SAP Activate. 20 semanas de implementación.'),
                pm('2026-01-25','BBP (Business Blueprint) firmado. 847 objetos de configuración mapeados. Diseño aprobado.'),
                pm('2026-03-01','Configuración completada en 3 países. Migración de datos históricos: 96% exitosa. 4% requiere limpieza manual.'),
                pm('2026-04-02','UAT superado con 0 defectos críticos. 2 mejoras menores gestionadas en backlog post-go-live. Cutover planificado para 25-abr.')
            ],[
                {stage:'iniciacion',  movedAt:'2025-12-10',movedBy:'pm@banco.com'},
                {stage:'analisis',    movedAt:'2026-01-08',movedBy:'pm@banco.com'},
                {stage:'construccion',movedAt:'2026-01-27',movedBy:'pm@banco.com'},
                {stage:'pruebas',     movedAt:'2026-03-03',movedBy:'pm@banco.com'},
                {stage:'go_live',     movedAt:'2026-04-07',movedBy:'pm@banco.com'}
            ])),

        /* ── 6. CIERRE ────────────────────────────────── req 50 ──────── */
        req(50,'Transformación Ágil Organizacional',APPR,DIR,'2025-11-28','recursos_humanos','alta','transformacion',
            'El 80% de los proyectos se gestionan con metodología en cascada con tiempos de entrega de 18 meses promedio. La alta dirección ha definido como objetivo estratégico la reducción a 4 meses.',
            'Adopción de marcos ágiles (SAFe) en 12 tribus de producto, reducción del time-to-market de 18 a 4 meses, incremento del índice de satisfacción con proyectos del 34% al 78%.',
            2200000,'2026-02-15',
            [c(S,'2025-11-28','Propuesta con diagnóstico de madurez ágil, plan de adopción SAFe y análisis de las 12 organizaciones de producto candidatas.'),
             c(A,'2025-12-03','PMO aprueba. La transformación ágil es el habilitador principal de la estrategia de velocidad de entrega.'),
             c(A,'2025-12-28','Evaluación financiera: la reducción de time-to-market genera $8.4M adicionales anuales por aceleración de ingresos.'),
             c(A,'2026-01-18','CEO aprueba personalmente el programa. La transformación ágil es el proyecto #1 de la agenda del comité ejecutivo.')],
            mkImpl('cierre','2025-10-01',{
                iniciacion:[
                    d('acta_constitucion','Acta_Constitucion_TransformacionAgil.pdf','pdf','2025-10-03'),
                    d('stakeholders','Stakeholders_SAFe_12Tribus.xlsx','excel','2025-10-05'),
                    d('plan_comunicacion','Plan_Comunicacion_Agile_Transformation.docx','word','2025-10-07'),
                    d('acta_kickoff','Acta_KickOff_TransformacionAgil.pdf','pdf','2025-10-10')
                ],
                analisis:[
                    d('brd_frd','Diagnostico_Madurez_Agil_v2.docx','word','2025-11-05'),
                    d('arquitectura','Roadmap_Adopcion_SAFe_Banco.pdf','pdf','2025-11-12'),
                    d('plan_proyecto','Plan_Transformacion_Agil_18meses.xlsx','excel','2025-11-15'),
                    d('matriz_riesgos','Analisis_Riesgos_Transformacion_Agil.xlsx','excel','2025-11-20'),
                    d('aprobacion_diseno','Acta_Aprobacion_Roadmap_SAFe.pdf','pdf','2025-11-28')
                ],
                construccion:[
                    d('informe_avance','Informe_Avance_PI1_SAFe_Enero2026.pdf','pdf','2026-01-31'),
                    d('doc_tecnica','Guia_Implementacion_SAFe_Banco.pdf','pdf','2026-02-05'),
                    d('actas_seguimiento','Actas_PI_Planning_Q1-2026.pdf','pdf','2026-02-10'),
                    d('control_cambios','Control_Cambios_Alcance_Agile.docx','word','2026-02-15')
                ],
                pruebas:[
                    d('plan_pruebas','Plan_Validacion_Adopcion_SAFe.pdf','pdf','2026-02-20'),
                    d('reporte_pruebas','Reporte_Metricas_Velocidad_Tribus.xlsx','excel','2026-03-10'),
                    d('reporte_defectos','Registro_Issues_Transformacion_Agil.xlsx','excel','2026-03-15'),
                    d('certificacion_uat','Certificacion_Madurez_Agil_Tribus.pdf','pdf','2026-03-22')
                ],
                go_live:[
                    d('checklist_produccion','Checklist_Operacion_SAFe_Productivo.pdf','pdf','2026-03-25'),
                    d('plan_despliegue','Plan_Despliegue_Agile_AllTribes.pdf','pdf','2026-03-26'),
                    d('comunicacion_usuarios','Comunicacion_Colaboradores_SAFe.pdf','pdf','2026-03-28'),
                    d('acta_produccion','Acta_Activacion_SAFe_12Tribus.pdf','pdf','2026-04-01')
                ],
                cierre:[
                    d('acta_cierre','Acta_Cierre_Transformacion_Agil.pdf','pdf','2026-04-15'),
                    d('lecciones_aprendidas','Lecciones_Aprendidas_SAFe_Banco.docx','word','2026-04-16'),
                    d('evaluacion_beneficios','Evaluacion_Beneficios_Agil_Q1-2026.xlsx','excel','2026-04-18'),
                    d('transferencia_conocimiento','Guia_Operacion_SAFe_Centro_Excelencia.pdf','pdf','2026-04-19')
                ]
            },[
                pm('2025-10-10','Programa iniciado. 3 Agile Release Trains (ARTs) formados con coaches certificados SAFe 6.0.'),
                pm('2025-11-28','Análisis de madurez: nivel 1.8/5 promedio. 12 tribus identificadas. Roadmap de 18 meses aprobado por el CEO.'),
                pm('2026-01-31','PI Planning #1 completado con 12 tribus. 184 features comprometidas para Q1. Velocidad base establecida.'),
                pm('2026-03-22','Certificación de adopción SAFe completada. 11 de 12 tribus en nivel 3+. NPS de satisfacción: 72%.'),
                pm('2026-04-01','Go Live: 12 tribus operando en cadencia SAFe. Time-to-market promedio reducido de 18 a 5.4 meses (-70%).'),
                pm('2026-04-19','Proyecto cerrado formalmente. Beneficios realizados documentados. Centro de Excelencia Ágil operativo con 8 coaches internos.')
            ],[
                {stage:'iniciacion',  movedAt:'2025-10-01',movedBy:'pm@banco.com'},
                {stage:'analisis',    movedAt:'2025-11-01',movedBy:'pm@banco.com'},
                {stage:'construccion',movedAt:'2025-12-01',movedBy:'pm@banco.com'},
                {stage:'pruebas',     movedAt:'2026-02-18',movedBy:'pm@banco.com'},
                {stage:'go_live',     movedAt:'2026-03-23',movedBy:'pm@banco.com'},
                {stage:'cierre',      movedAt:'2026-04-12',movedBy:'pm@banco.com'}
            ]))
        ];
    })(),
    filters: {
        area: '',
        prioridad: '',
        estado: ''
    },
    pagination: {
        page: 1,
        pageSize: 5
    }
};

/* ------------------------------- Utilidades ----------------------------- */

function loadState() {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
        try {
            const parsed = JSON.parse(savedState);
            if (parsed.version !== STORAGE_VERSION) {
                localStorage.removeItem(STORAGE_KEY);
                return;
            }
            if (Array.isArray(parsed.requests)) {
                AppState.requests = parsed.requests.map((req) => ({
                    stage: STAGE.PMO,
                    implementation: null,
                    ...req
                }));
            }
            if (parsed.currentUser) {
                AppState.currentUser = parsed.currentUser;
            }
        } catch (error) {
            console.warn('No se pudo cargar el estado persistido.', error);
            localStorage.removeItem(STORAGE_KEY);
        }
    }
}

function saveState() {
    const toSave = {
        version: STORAGE_VERSION,
        currentUser: AppState.currentUser,
        requests: AppState.requests
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
}

function clearAppRoot() {
    const root = document.getElementById('app-root');
    while (root.firstChild) {
        root.removeChild(root.firstChild);
    }
    return root;
}

function formatRequestId(id) {
    const padded = String(id).padStart(3, '0');
    return `REQ-2024-${padded}`;
}

function formatCurrency(value) {
    const num = Number(value);
    if (Number.isNaN(num) || !Number.isFinite(num)) {
        return '$0';
    }
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
    }).format(num);
}

function formatDate(dateString) {
    if (!dateString) return '—';
    const parts = dateString.split('-');
    if (parts.length !== 3) return dateString;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function getStatusBadgeClass(status) {
    switch (status) {
        case STATUS.PENDING:
            return 'badge--pending';
        case STATUS.APPROVED:
            return 'badge--approved';
        case STATUS.REJECTED:
        case STATUS.CHANGES:
            return 'badge--error';
        case STATUS.CLOSED:
            return 'badge--closed';
        case STATUS.DRAFT:
        default:
            return 'badge--draft';
    }
}

function getLabelFromValue(list, value) {
    const found = list.find((item) => item.value === value);
    return found ? found.label : value || '—';
}

function createIcon(name, extraClass) {
    const span = document.createElement('span');
    span.className = 'material-symbols-outlined';
    if (extraClass) {
        span.classList.add(extraClass);
    }
    span.textContent = name;
    return span;
}

function createIconButton(iconName, title, onClick) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'icon-button';
    button.title = title;
    button.setAttribute('aria-label', title);
    button.appendChild(createIcon(iconName));
    if (typeof onClick === 'function') {
        button.addEventListener('click', onClick);
    }
    return button;
}

function createButton(text, variant, iconName, onClick, type) {
    const button = document.createElement('button');
    button.type = type || 'button';
    button.className = `button button--${variant || 'primary'}`;
    if (iconName) {
        const icon = createIcon(iconName, 'button__icon');
        button.appendChild(icon);
    }
    const label = document.createElement('span');
    label.textContent = text;
    button.appendChild(label);
    if (typeof onClick === 'function') {
        button.addEventListener('click', onClick);
    }
    return button;
}

function createBadge(status) {
    const badge = document.createElement('span');
    badge.className = `badge ${getStatusBadgeClass(status)}`;
    badge.textContent = status;
    return badge;
}

function createFormField(options) {
    const { id, label, type, required, placeholder, value, rows, choices } = options;

    const group = document.createElement('div');
    group.className = 'form-group';

    const labelEl = document.createElement('label');
    labelEl.className = 'form-label text-label-caps';
    labelEl.setAttribute('for', id);
    labelEl.textContent = label;
    group.appendChild(labelEl);

    let input;
    if (type === 'textarea') {
        input = document.createElement('textarea');
        input.rows = rows || 4;
    } else if (type === 'select') {
        input = document.createElement('select');
        const placeholderOption = document.createElement('option');
        placeholderOption.value = '';
        placeholderOption.disabled = true;
        placeholderOption.selected = true;
        placeholderOption.textContent = placeholder || 'Seleccione una opción...';
        input.appendChild(placeholderOption);
        if (Array.isArray(choices)) {
            choices.forEach((choice) => {
                const option = document.createElement('option');
                option.value = choice.value;
                option.textContent = choice.label;
                if (value === choice.value) {
                    option.selected = true;
                    placeholderOption.selected = false;
                }
                input.appendChild(option);
            });
        }
    } else {
        input = document.createElement('input');
        input.type = type || 'text';
    }

    input.id = id;
    input.name = id;
    input.className = 'form-input form-input--plain';
    if (required) {
        input.required = true;
    }
    if (placeholder && type !== 'select') {
        input.placeholder = placeholder;
    }
    if (value !== undefined && value !== null && type !== 'select') {
        input.value = value;
    }

    input.addEventListener('input', () => clearFieldError(input));
    input.addEventListener('change', () => clearFieldError(input));

    group.appendChild(input);

    return { group, input };
}

function showFieldError(input, message) {
    clearFieldError(input);
    input.classList.add('form-input--invalid');
    const error = document.createElement('span');
    error.className = 'form-error';
    error.textContent = message;
    error.dataset.errorFor = input.id;
    if (input.parentElement) {
        input.parentElement.appendChild(error);
    }
}

function clearFieldError(input) {
    input.classList.remove('form-input--invalid');
    if (input.parentElement) {
        const errors = input.parentElement.querySelectorAll('.form-error');
        errors.forEach((node) => node.remove());
    }
}

function ensureNotificationsContainer() {
    let container = document.getElementById('notifications');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notifications';
        container.className = 'notifications';
        document.body.appendChild(container);
    }
    return container;
}

function showNotification(message, type) {
    const kind = type || 'info';
    const container = ensureNotificationsContainer();

    const notification = document.createElement('div');
    notification.className = `notification notification--${kind}`;
    notification.setAttribute('role', 'status');

    const iconName = kind === 'success' ? 'check_circle'
        : kind === 'error' ? 'error'
        : 'info';
    notification.appendChild(createIcon(iconName, 'notification__icon'));

    const content = document.createElement('div');
    content.className = 'notification__content';
    content.textContent = message;
    notification.appendChild(content);

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'notification__close';
    closeBtn.setAttribute('aria-label', 'Cerrar notificación');
    closeBtn.appendChild(createIcon('close'));
    closeBtn.addEventListener('click', () => notification.remove());
    notification.appendChild(closeBtn);

    container.appendChild(notification);

    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 4000);
}

/* ------------------------------- Router --------------------------------- */

function navigateTo(route, param) {
    if (!AppState.currentUser && route !== 'login') {
        renderLogin();
        return;
    }

    switch (route) {
        case 'login':
            renderLogin();
            break;
        case 'dashboard_solicitante':
            renderDashboardSolicitante();
            break;
        case 'dashboard_admin':
            renderDashboardAdmin();
            break;
        case 'nueva_solicitud':
            renderNuevaSolicitud(param);
            break;
        case 'metricas':
            renderMetricas();
            break;
        case 'flujo_gobierno':
            renderFlujoGobierno();
            break;
        case 'etapa_pmo':
            renderEtapaSolicitudes('revision_pmo');
            break;
        case 'etapa_tecnica':
            renderEtapaSolicitudes('evaluacion');
            break;
        case 'etapa_director':
            renderEtapaSolicitudes('aprobacion');
            break;
        case 'etapa_aprobado':
            renderEtapaSolicitudes('aprobado');
            break;
        case 'detalle_solicitud':
            renderDetalleSolicitud(param);
            break;
        case 'dashboard_pm':
            renderDashboardPM(param || null);
            break;
        case 'detalle_pm':
            renderDetallePM(param);
            break;
        case 'metricas_pm':
            renderMetricasPM();
            break;
        case 'docs_pm':
            renderDocsPM(param);
            break;
        default:
            renderLogin();
    }
}

function navigateToHome() {
    if (AppState.currentUser?.role === ROLE_ADMIN) {
        navigateTo('dashboard_admin');
    } else if (AppState.currentUser?.role === ROLE_PM) {
        navigateTo('dashboard_pm');
    } else {
        navigateTo('dashboard_solicitante');
    }
}

function logout() {
    AppState.currentUser = null;
    saveState();
    showNotification('Sesión cerrada correctamente.', 'info');
    navigateTo('login');
}

/* ------------------------------- Login ---------------------------------- */

function renderLogin() {
    AppState.currentView = 'login';
    const root = clearAppRoot();
    document.body.classList.add('has-fixed-footer');

    const loginView = document.createElement('main');
    loginView.className = 'login-view';

    const loginCard = document.createElement('div');
    loginCard.className = 'login-card';

    const header = document.createElement('div');
    header.className = 'login-card__header';

    const iconContainer = document.createElement('div');
    iconContainer.className = 'login-card__icon-container';
    iconContainer.appendChild(createIcon('account_balance', 'login-card__icon'));
    header.appendChild(iconContainer);

    const title = document.createElement('h1');
    title.className = 'text-headline-md login-card__title';
    title.textContent = 'Portal de Gobierno PMO';
    header.appendChild(title);

    const subtitle = document.createElement('p');
    subtitle.className = 'text-body-sm login-card__subtitle';
    subtitle.textContent = 'Inicie sesión para administrar las solicitudes de proyecto';
    header.appendChild(subtitle);

    loginCard.appendChild(header);

    const form = document.createElement('form');
    form.noValidate = true;

    const emailField = createFormField({
        id: 'login-email',
        label: 'Correo Electrónico',
        type: 'email',
        required: true,
        placeholder: 'usuario@banco.com'
    });
    form.appendChild(emailField.group);

    const passwordField = createFormField({
        id: 'login-password',
        label: 'Contraseña',
        type: 'password',
        required: true,
        placeholder: 'Ingrese su contraseña'
    });
    form.appendChild(passwordField.group);

    const submitBtn = createButton('Iniciar Sesión', 'primary', 'login', null, 'submit');
    submitBtn.classList.add('button--block');
    form.appendChild(submitBtn);

    const demoInfo = document.createElement('div');
    demoInfo.className = 'login-card__demo';
    const demoTitle = document.createElement('div');
    const demoStrong = document.createElement('strong');
    demoStrong.textContent = 'Credenciales de demostración';
    demoTitle.appendChild(demoStrong);
    demoInfo.appendChild(demoTitle);

    const demoSol = document.createElement('div');
    demoSol.textContent = `Solicitante: ${DEMO_CREDENTIALS.solicitante.email} / ${DEMO_CREDENTIALS.solicitante.password}`;
    demoInfo.appendChild(demoSol);

    const demoAdm = document.createElement('div');
    demoAdm.textContent = `Administrador: ${DEMO_CREDENTIALS.admin.email} / ${DEMO_CREDENTIALS.admin.password}`;
    demoInfo.appendChild(demoAdm);

    const demoPM = document.createElement('div');
    demoPM.textContent = `Project Manager: ${DEMO_CREDENTIALS.pm.email} / ${DEMO_CREDENTIALS.pm.password}`;
    demoInfo.appendChild(demoPM);

    form.appendChild(demoInfo);

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const email = emailField.input.value.trim();
        const password = passwordField.input.value;

        let hasError = false;
        if (!email) {
            showFieldError(emailField.input, 'Ingrese un correo electrónico.');
            hasError = true;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showFieldError(emailField.input, 'Ingrese un correo electrónico válido.');
            hasError = true;
        }

        if (!password) {
            showFieldError(passwordField.input, 'Ingrese su contraseña.');
            hasError = true;
        }

        if (hasError) return;

        let role = null;
        if (email === DEMO_CREDENTIALS.solicitante.email && password === DEMO_CREDENTIALS.solicitante.password) {
            role = ROLE_SOLICITANTE;
        } else if (email === DEMO_CREDENTIALS.admin.email && password === DEMO_CREDENTIALS.admin.password) {
            role = ROLE_ADMIN;
        } else if (email === DEMO_CREDENTIALS.pm.email && password === DEMO_CREDENTIALS.pm.password) {
            role = ROLE_PM;
        }

        if (!role) {
            showFieldError(passwordField.input, 'Credenciales incorrectas. Verifique sus datos.');
            showNotification('No se pudo iniciar sesión. Verifique sus credenciales.', 'error');
            return;
        }

        AppState.currentUser = { role, email };
        saveState();
        showNotification(`Bienvenido al portal, ${email}.`, 'success');
        navigateToHome();
    });

    loginCard.appendChild(form);

    const footerNote = document.createElement('div');
    footerNote.className = 'login-footer-note text-body-sm';
    footerNote.appendChild(createIcon('verified_user'));
    const noteText = document.createElement('span');
    noteText.textContent = 'Acceso restringido a personal autorizado';
    footerNote.appendChild(noteText);
    loginCard.appendChild(footerNote);

    loginView.appendChild(loginCard);

    const footer = document.createElement('footer');
    footer.className = 'footer';

    const copyright = document.createElement('div');
    copyright.className = 'footer__copyright';
    copyright.textContent = '© 2024 Sistemas PMO Institucionales. Acceso restringido a personal autorizado.';
    footer.appendChild(copyright);

    const links = document.createElement('div');
    links.className = 'footer__links';
    ['Política de Seguridad', 'Términos del Servicio', 'Soporte de Sistemas'].forEach((text) => {
        const link = document.createElement('a');
        link.href = '#';
        link.className = 'footer__link';
        link.textContent = text;
        link.addEventListener('click', (event) => event.preventDefault());
        links.appendChild(link);
    });
    footer.appendChild(links);

    root.appendChild(loginView);
    root.appendChild(footer);
}

/* -------------------------- Layout de Dashboard ------------------------- */

function createDashboardLayout(activeRoute) {
    document.body.classList.remove('has-fixed-footer');
    const root = clearAppRoot();

    const layout = document.createElement('div');
    layout.className = 'dashboard-layout';

    const sidebar = document.createElement('aside');
    sidebar.className = 'sidebar';

    const sidebarHeader = document.createElement('div');
    sidebarHeader.className = 'sidebar__header';

    const sidebarTitle = document.createElement('h1');
    sidebarTitle.className = 'sidebar__title';
    sidebarTitle.textContent = 'PMO Bancaria';
    sidebarHeader.appendChild(sidebarTitle);

    const sidebarSubtitle = document.createElement('p');
    sidebarSubtitle.className = 'sidebar__subtitle';
    sidebarSubtitle.textContent = 'Gobierno y Riesgos';
    sidebarHeader.appendChild(sidebarSubtitle);

    sidebar.appendChild(sidebarHeader);

    const nav = document.createElement('nav');
    nav.className = 'sidebar__nav';

    const role = AppState.currentUser?.role;
    let menuItems = [];
    if (role === ROLE_ADMIN) {
        menuItems = [
            { id: 'dashboard_admin',   icon: 'dashboard',     text: 'Panel de Solicitudes' },
            { id: 'flujo_gobierno',    icon: 'account_tree',  text: 'Flujo de Gobierno'    },
            { type: 'divider', label: 'Etapas' },
            { id: 'etapa_pmo',         icon: 'engineering',   text: 'Revisión PMO'         },
            { id: 'etapa_tecnica',     icon: 'balance',       text: 'Evaluación Financiera'},
            { id: 'etapa_director',    icon: 'verified_user', text: 'Aprobación'           },
            { id: 'etapa_aprobado',    icon: 'verified',      text: 'Aprobadas'            },
            { type: 'divider', label: 'Reportes' },
            { id: 'metricas',          icon: 'analytics',     text: 'Métricas y Reportes'  }
        ];
    } else if (role === ROLE_PM) {
        menuItems = [
            { id: 'dashboard_pm',  icon: 'view_kanban',  text: 'Kanban de Proyectos' },
            { type: 'divider', label: 'Reportes' },
            { id: 'metricas_pm',   icon: 'analytics',    text: 'Métricas de Implementación' }
        ];
    } else {
        menuItems = [
            { id: 'dashboard_solicitante', icon: 'dashboard',       text: 'Mis Solicitudes' },
            { id: 'nueva_solicitud',       icon: 'assignment_add',  text: 'Nueva Solicitud' }
        ];
    }

    menuItems.forEach((item) => {
        if (item.type === 'divider') {
            const label = document.createElement('p');
            label.className = 'nav-section-label';
            label.textContent = item.label;
            nav.appendChild(label);
            return;
        }
        const link = document.createElement('a');
        link.href = '#';
        link.className = 'nav-item';
        if (activeRoute === item.id) {
            link.classList.add('nav-item--active');
        }
        link.appendChild(createIcon(item.icon));
        const textEl = document.createElement('span');
        textEl.textContent = item.text;
        link.appendChild(textEl);
        link.addEventListener('click', (event) => {
            event.preventDefault();
            navigateTo(item.id);
        });
        nav.appendChild(link);
    });
    sidebar.appendChild(nav);

    const sidebarFooter = document.createElement('div');
    sidebarFooter.className = 'sidebar__footer';

    const logoutBtn = document.createElement('button');
    logoutBtn.type = 'button';
    logoutBtn.className = 'sidebar__logout';
    logoutBtn.appendChild(createIcon('logout', 'button__icon'));
    const logoutLabel = document.createElement('span');
    logoutLabel.textContent = 'Cerrar Sesión';
    logoutBtn.appendChild(logoutLabel);
    logoutBtn.addEventListener('click', logout);
    sidebarFooter.appendChild(logoutBtn);

    sidebar.appendChild(sidebarFooter);
    layout.appendChild(sidebar);

    const mainArea = document.createElement('div');
    mainArea.className = 'main-area';

    const mobileHeader = document.createElement('header');
    mobileHeader.className = 'mobile-header';

    const mobileTitle = document.createElement('div');
    mobileTitle.className = 'mobile-header__title';
    mobileTitle.textContent = 'Portal PMO';
    mobileHeader.appendChild(mobileTitle);

    const mobileActions = document.createElement('div');
    mobileActions.className = 'mobile-header__actions';
    mobileActions.appendChild(createIconButton('logout', 'Cerrar sesión', logout));
    mobileHeader.appendChild(mobileActions);

    mainArea.appendChild(mobileHeader);

    const canvas = document.createElement('main');
    canvas.className = 'main-content';
    mainArea.appendChild(canvas);

    layout.appendChild(mainArea);
    root.appendChild(layout);

    return canvas;
}

function createPageHeader(title, subtitle, actionButton) {
    const pageHeader = document.createElement('div');
    pageHeader.className = 'page-header';

    const titles = document.createElement('div');

    const titleEl = document.createElement('h1');
    titleEl.className = 'page-header__title';
    titleEl.textContent = title;
    titles.appendChild(titleEl);

    if (subtitle) {
        const subtitleEl = document.createElement('p');
        subtitleEl.className = 'page-header__subtitle';
        subtitleEl.textContent = subtitle;
        titles.appendChild(subtitleEl);
    }

    pageHeader.appendChild(titles);

    if (actionButton) {
        const actions = document.createElement('div');
        actions.className = 'page-header__actions';
        actions.appendChild(actionButton);
        pageHeader.appendChild(actions);
    }

    return pageHeader;
}

/* ----------------------------- Summary Card ----------------------------- */

function createSummaryCard(title, value, iconName, trendIconName, trendText) {
    const card = document.createElement('div');
    card.className = 'summary-card';

    const header = document.createElement('div');
    header.className = 'summary-card__header';

    const titleEl = document.createElement('span');
    titleEl.className = 'summary-card__title';
    titleEl.textContent = title;
    header.appendChild(titleEl);

    const iconWrapper = document.createElement('div');
    iconWrapper.className = 'summary-card__icon-wrapper';
    iconWrapper.appendChild(createIcon(iconName));
    header.appendChild(iconWrapper);

    card.appendChild(header);

    const valueEl = document.createElement('div');
    valueEl.className = 'summary-card__value';
    valueEl.textContent = String(value);
    card.appendChild(valueEl);

    if (trendText) {
        const trend = document.createElement('div');
        trend.className = 'summary-card__trend';
        if (trendIconName) {
            trend.appendChild(createIcon(trendIconName, 'trend-icon'));
        }
        const trendSpan = document.createElement('span');
        trendSpan.textContent = trendText;
        trend.appendChild(trendSpan);
        card.appendChild(trend);
    }

    return card;
}

/* ------------------------------- Tablas --------------------------------- */

function createEmptyState(iconName, message, colSpan) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = colSpan;

    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.appendChild(createIcon(iconName, 'empty-state__icon'));
    const text = document.createElement('div');
    text.className = 'empty-state__text';
    text.textContent = message;
    empty.appendChild(text);

    td.appendChild(empty);
    tr.appendChild(td);
    return tr;
}

function createTableHead(headers) {
    const thead = document.createElement('thead');
    const tr = document.createElement('tr');
    headers.forEach((header) => {
        const th = document.createElement('th');
        if (typeof header === 'string') {
            th.textContent = header;
        } else {
            th.textContent = header.text;
            if (header.align === 'center') {
                th.classList.add('text-center');
            } else if (header.align === 'right') {
                th.classList.add('text-right');
            }
        }
        tr.appendChild(th);
    });
    thead.appendChild(tr);
    return thead;
}

function createRequestRow(req, includeApplicant) {
    const tr = document.createElement('tr');

    const tdId = document.createElement('td');
    tdId.className = 'text-subtle';
    tdId.textContent = formatRequestId(req.id);
    tr.appendChild(tdId);

    const tdTitle = document.createElement('td');
    tdTitle.className = 'text-primary-color text-bold';
    tdTitle.textContent = req.title;
    tr.appendChild(tdTitle);

    if (includeApplicant) {
        const tdApplicant = document.createElement('td');
        tdApplicant.className = 'text-subtle';
        tdApplicant.textContent = req.applicant;
        tr.appendChild(tdApplicant);
    }

    const tdStatus = document.createElement('td');
    tdStatus.appendChild(createBadge(req.status));
    tr.appendChild(tdStatus);

    const tdDate = document.createElement('td');
    tdDate.className = 'text-subtle';
    tdDate.textContent = formatDate(req.date);
    tr.appendChild(tdDate);

    const tdActions = document.createElement('td');
    tdActions.classList.add('text-center');
    if (req.status === STATUS.DRAFT) {
        tdActions.appendChild(createIconButton('edit', 'Editar borrador', () => {
            navigateTo('nueva_solicitud', req.id);
        }));
    } else if (req.status === STATUS.CHANGES) {
        tdActions.appendChild(createIconButton('rate_review', 'Realizar ajustes', () => {
            navigateTo('detalle_solicitud', req.id);
        }));
    } else {
        tdActions.appendChild(createIconButton('visibility', 'Ver detalle', () => {
            navigateTo('detalle_solicitud', req.id);
        }));
    }
    tr.appendChild(tdActions);

    return tr;
}

/* -------------------- Dashboard del Solicitante ------------------------- */

function renderDashboardSolicitante() {
    AppState.currentView = 'dashboard_solicitante';
    const canvas = createDashboardLayout('dashboard_solicitante');

    const emailPrefix = AppState.currentUser?.email
        ? AppState.currentUser.email.split('@')[0]
        : 'Usuario';

    const newReqBtn = createButton('Nueva Solicitud', 'primary', 'add_circle',
        () => navigateTo('nueva_solicitud'));

    canvas.appendChild(createPageHeader(
        `Hola, ${emailPrefix}`,
        'Resumen de sus solicitudes de proyecto',
        newReqBtn
    ));

    const myRequests = AppState.requests.filter(
        (req) => req.applicant === AppState.currentUser?.email
    );

    const approvedCount = myRequests.filter((r) => r.status === STATUS.APPROVED).length;
    const pendingCount = myRequests.filter((r) => r.status === STATUS.PENDING).length;
    const changesCount = myRequests.filter((r) => r.status === STATUS.CHANGES).length;
    const draftCount = myRequests.filter((r) => r.status === STATUS.DRAFT).length;

    const cardsGrid = document.createElement('div');
    cardsGrid.className = 'cards-grid';
    cardsGrid.appendChild(createSummaryCard(
        'Mis Solicitudes', myRequests.length, 'folder_open',
        'trending_up', 'Total histórico'
    ));
    cardsGrid.appendChild(createSummaryCard(
        'Borradores', draftCount, 'edit_note',
        'save', 'Pendientes de envío'
    ));
    cardsGrid.appendChild(createSummaryCard(
        'En Revisión', pendingCount, 'pending_actions',
        'schedule', 'Pendientes del comité'
    ));
    cardsGrid.appendChild(createSummaryCard(
        'Aprobadas', approvedCount, 'verified',
        'check_circle', 'En ejecución'
    ));
    canvas.appendChild(cardsGrid);

    if (draftCount > 0) {
        const draftCard = document.createElement('div');
        draftCard.className = 'summary-card summary-card--alert';

        const draftTitle = document.createElement('div');
        draftTitle.className = 'summary-card__title';
        draftTitle.textContent = 'Borradores sin enviar';
        draftCard.appendChild(draftTitle);

        const draftText = document.createElement('p');
        draftText.className = 'text-body-md';
        draftText.textContent = `Tiene ${draftCount} borrador(es) guardado(s). Complételos y envíelos para iniciar el proceso de aprobación.`;
        draftCard.appendChild(draftText);

        canvas.appendChild(draftCard);
    }

    if (changesCount > 0) {
        const infoCard = document.createElement('div');
        infoCard.className = 'summary-card summary-card--alert';

        const infoTitle = document.createElement('div');
        infoTitle.className = 'summary-card__title';
        infoTitle.textContent = 'Solicitudes que requieren ajustes';
        infoCard.appendChild(infoTitle);

        const infoText = document.createElement('p');
        infoText.className = 'text-body-md';
        infoText.textContent = `Tiene ${changesCount} solicitud(es) con ajustes pendientes. Ábralas, realice los cambios solicitados por la PMO y envíelas nuevamente a revisión.`;
        infoCard.appendChild(infoText);

        canvas.appendChild(infoCard);
    }

    const tableCard = document.createElement('div');
    tableCard.className = 'table-card';

    const tableHeader = document.createElement('div');
    tableHeader.className = 'table-card__header';
    const tableTitle = document.createElement('h3');
    tableTitle.className = 'table-card__title';
    tableTitle.textContent = 'Mis Solicitudes Recientes';
    tableHeader.appendChild(tableTitle);
    tableCard.appendChild(tableHeader);

    const tableContainer = document.createElement('div');
    tableContainer.className = 'table-container';

    const table = document.createElement('table');
    table.className = 'data-table';

    table.appendChild(createTableHead([
        'ID',
        'Título del Proyecto',
        'Estado',
        'Fecha de Creación',
        { text: 'Acciones', align: 'center' }
    ]));

    const tbody = document.createElement('tbody');

    if (myRequests.length === 0) {
        tbody.appendChild(createEmptyState(
            'folder_off',
            'Aún no ha creado solicitudes. Use el botón "Nueva Solicitud" para comenzar.',
            5
        ));
    } else {
        myRequests
            .slice()
            .sort((a, b) => b.date.localeCompare(a.date))
            .forEach((req) => tbody.appendChild(createRequestRow(req, false)));
    }

    table.appendChild(tbody);
    tableContainer.appendChild(table);
    tableCard.appendChild(tableContainer);

    canvas.appendChild(tableCard);
}

/* ------------------------- Nueva Solicitud ------------------------------ */

function renderNuevaSolicitud(draftId) {
    const existingDraft = draftId
        ? AppState.requests.find((r) => r.id === parseInt(draftId, 10) && r.status === STATUS.DRAFT)
        : null;

    AppState.currentView = 'nueva_solicitud';
    const canvas = createDashboardLayout('nueva_solicitud');

    const pageTitle = existingDraft ? 'Editar Borrador' : 'Nueva Solicitud';
    const pageSubtitle = existingDraft
        ? `Editando ${formatRequestId(existingDraft.id)} — complete todos los campos y envíe cuando esté listo.`
        : 'Complete el formulario de intake para iniciar la evaluación del proyecto.';

    canvas.appendChild(createPageHeader(pageTitle, pageSubtitle));

    const formWrapper = document.createElement('div');
    formWrapper.className = 'form-wrapper';

    const form = document.createElement('form');
    form.noValidate = true;

    const section1 = document.createElement('section');
    section1.className = 'form-section';

    const section1Title = document.createElement('h2');
    section1Title.className = 'form-section__title';
    section1Title.textContent = '1. Información General';
    section1.appendChild(section1Title);

    const grid1 = document.createElement('div');
    grid1.className = 'form-section__grid form-section__grid--2cols';

    const fieldTitulo = createFormField({
        id: 'titulo',
        label: 'Título del Proyecto',
        type: 'text',
        required: true,
        placeholder: 'Ej. Actualización del CRM Central',
        value: existingDraft ? existingDraft.title : undefined
    });
    fieldTitulo.group.classList.add('form-section__full');
    grid1.appendChild(fieldTitulo.group);

    const fieldArea = createFormField({
        id: 'area',
        label: 'Área Solicitante',
        type: 'select',
        required: true,
        placeholder: 'Seleccione un área...',
        choices: AREAS,
        value: existingDraft ? existingDraft.area : undefined
    });
    grid1.appendChild(fieldArea.group);

    const fieldTipo = createFormField({
        id: 'tipoProyecto',
        label: 'Tipo de Proyecto',
        type: 'select',
        required: true,
        placeholder: 'Seleccione un tipo...',
        choices: TIPOS_PROYECTO,
        value: existingDraft ? existingDraft.tipoProyecto : undefined
    });
    grid1.appendChild(fieldTipo.group);

    const fieldPrioridad = createFormField({
        id: 'prioridad',
        label: 'Prioridad Sugerida',
        type: 'select',
        required: true,
        placeholder: 'Seleccione prioridad...',
        choices: PRIORIDADES,
        value: existingDraft ? existingDraft.prioridad : undefined
    });
    grid1.appendChild(fieldPrioridad.group);

    const fieldFecha = createFormField({
        id: 'fechaEstimadaInicio',
        label: 'Fecha Estimada de Inicio',
        type: 'date',
        required: true,
        value: existingDraft ? existingDraft.fechaEstimadaInicio : undefined
    });
    grid1.appendChild(fieldFecha.group);

    section1.appendChild(grid1);
    form.appendChild(section1);

    const section2 = document.createElement('section');
    section2.className = 'form-section';

    const section2Title = document.createElement('h2');
    section2Title.className = 'form-section__title';
    section2Title.textContent = '2. Justificación';
    section2.appendChild(section2Title);

    const grid2 = document.createElement('div');
    grid2.className = 'form-section__grid';

    const fieldNecesidad = createFormField({
        id: 'necesidad',
        label: 'Necesidad de Negocio',
        type: 'textarea',
        required: true,
        rows: 4,
        placeholder: 'Describa la necesidad u oportunidad que motiva este proyecto...',
        value: existingDraft ? existingDraft.necesidad : undefined
    });
    grid2.appendChild(fieldNecesidad.group);

    const fieldImpacto = createFormField({
        id: 'impacto',
        label: 'Impacto Esperado',
        type: 'textarea',
        required: true,
        rows: 3,
        placeholder: '¿Cómo beneficiará este proyecto al área y a la institución?',
        value: existingDraft ? existingDraft.impacto : undefined
    });
    grid2.appendChild(fieldImpacto.group);

    section2.appendChild(grid2);
    form.appendChild(section2);

    const section3 = document.createElement('section');
    section3.className = 'form-section';

    const section3Title = document.createElement('h2');
    section3Title.className = 'form-section__title';
    section3Title.textContent = '3. Presupuesto';
    section3.appendChild(section3Title);

    const grid3 = document.createElement('div');
    grid3.className = 'form-section__grid form-section__grid--2cols';

    const fieldPresupuesto = createFormField({
        id: 'presupuestoEstimado',
        label: 'Presupuesto Estimado (USD)',
        type: 'number',
        required: true,
        placeholder: 'Ej. 500000',
        value: existingDraft ? existingDraft.presupuestoEstimado : undefined
    });
    fieldPresupuesto.input.min = '0';
    fieldPresupuesto.input.step = '1000';
    grid3.appendChild(fieldPresupuesto.group);

    section3.appendChild(grid3);
    form.appendChild(section3);

    const actions = document.createElement('div');
    actions.className = 'form-actions';

    const btnCancel = createButton('Cancelar', 'secondary', null,
        () => navigateTo('dashboard_solicitante'));
    actions.appendChild(btnCancel);

    const btnDraft = createButton('Guardar Borrador', 'secondary', 'save', (event) => {
        event.preventDefault();
        saveDraft();
    });
    actions.appendChild(btnDraft);

    const btnSubmit = createButton('Enviar Solicitud', 'primary', 'send', null, 'submit');
    actions.appendChild(btnSubmit);

    form.appendChild(actions);

    function saveDraft() {
        const titleValue = fieldTitulo.input.value.trim();
        if (!titleValue || titleValue.length < 3) {
            showFieldError(fieldTitulo.input, 'Ingrese un título de al menos 3 caracteres para guardar el borrador.');
            showNotification('El título es obligatorio para guardar el borrador.', 'error');
            return;
        }

        const draftData = {
            title: titleValue,
            status: STATUS.DRAFT,
            stage: STAGE.PMO,
            applicant: AppState.currentUser.email,
            area: fieldArea.input.value || '',
            prioridad: fieldPrioridad.input.value || '',
            tipoProyecto: fieldTipo.input.value || '',
            necesidad: fieldNecesidad.input.value.trim(),
            impacto: fieldImpacto.input.value.trim(),
            presupuestoEstimado: fieldPresupuesto.input.value || '0',
            fechaEstimadaInicio: fieldFecha.input.value || ''
        };

        if (existingDraft) {
            const index = AppState.requests.findIndex((r) => r.id === existingDraft.id);
            if (index !== -1) {
                AppState.requests[index] = { ...AppState.requests[index], ...draftData };
            }
            saveState();
            showNotification(`Borrador ${formatRequestId(existingDraft.id)} actualizado correctamente.`, 'success');
        } else {
            const maxId = AppState.requests.reduce((max, r) => Math.max(max, r.id), 0);
            const newDraft = {
                id: maxId + 1,
                date: new Date().toISOString().split('T')[0],
                comments: [],
                ...draftData
            };
            AppState.requests.push(newDraft);
            saveState();
            showNotification(`Borrador ${formatRequestId(newDraft.id)} guardado correctamente.`, 'success');
        }

        navigateTo('dashboard_solicitante');
    }

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const fields = [
            { field: fieldTitulo, message: 'Ingrese el título del proyecto.', validate: (v) => v.trim().length >= 3, minMessage: 'El título debe tener al menos 3 caracteres.' },
            { field: fieldArea, message: 'Seleccione el área solicitante.' },
            { field: fieldTipo, message: 'Seleccione el tipo de proyecto.' },
            { field: fieldPrioridad, message: 'Seleccione la prioridad.' },
            { field: fieldFecha, message: 'Seleccione una fecha estimada de inicio.' },
            { field: fieldNecesidad, message: 'Describa la necesidad de negocio.', validate: (v) => v.trim().length >= 10, minMessage: 'Describa con al menos 10 caracteres.' },
            { field: fieldImpacto, message: 'Describa el impacto esperado.', validate: (v) => v.trim().length >= 10, minMessage: 'Describa con al menos 10 caracteres.' },
            { field: fieldPresupuesto, message: 'Ingrese el presupuesto estimado.', validate: (v) => Number(v) > 0, minMessage: 'Ingrese un monto mayor a cero.' }
        ];

        let hasError = false;
        fields.forEach(({ field, message, validate, minMessage }) => {
            const value = field.input.value;
            if (!value || (typeof value === 'string' && value.trim() === '')) {
                showFieldError(field.input, message);
                hasError = true;
                return;
            }
            if (typeof validate === 'function' && !validate(value)) {
                showFieldError(field.input, minMessage || message);
                hasError = true;
            }
        });

        if (hasError) {
            showNotification('Revise los campos resaltados del formulario.', 'error');
            return;
        }

        if (existingDraft) {
            const index = AppState.requests.findIndex((r) => r.id === existingDraft.id);
            if (index !== -1) {
                AppState.requests[index] = {
                    ...AppState.requests[index],
                    title: fieldTitulo.input.value.trim(),
                    status: STATUS.PENDING,
                    stage: STAGE.PMO,
                    area: fieldArea.input.value,
                    prioridad: fieldPrioridad.input.value,
                    tipoProyecto: fieldTipo.input.value,
                    necesidad: fieldNecesidad.input.value.trim(),
                    impacto: fieldImpacto.input.value.trim(),
                    presupuestoEstimado: fieldPresupuesto.input.value,
                    fechaEstimadaInicio: fieldFecha.input.value
                };
            }
            saveState();
            showNotification(`Solicitud ${formatRequestId(existingDraft.id)} enviada correctamente.`, 'success');
        } else {
            const maxId = AppState.requests.reduce((max, r) => Math.max(max, r.id), 0);
            const newRequest = {
                id: maxId + 1,
                title: fieldTitulo.input.value.trim(),
                status: STATUS.PENDING,
                stage: STAGE.PMO,
                date: new Date().toISOString().split('T')[0],
                applicant: AppState.currentUser.email,
                area: fieldArea.input.value,
                prioridad: fieldPrioridad.input.value,
                tipoProyecto: fieldTipo.input.value,
                necesidad: fieldNecesidad.input.value.trim(),
                impacto: fieldImpacto.input.value.trim(),
                presupuestoEstimado: fieldPresupuesto.input.value,
                fechaEstimadaInicio: fieldFecha.input.value,
                comments: []
            };
            AppState.requests.push(newRequest);
            saveState();
            showNotification(`Solicitud ${formatRequestId(newRequest.id)} enviada correctamente.`, 'success');
        }

        navigateTo('dashboard_solicitante');
    });

    formWrapper.appendChild(form);
    canvas.appendChild(formWrapper);
}

/* ----------------------- Detalle de Solicitud --------------------------- */

function renderDetalleSolicitud(id) {
    const req = AppState.requests.find((r) => r.id === parseInt(id, 10));
    if (!req) {
        showNotification('La solicitud solicitada no existe.', 'error');
        navigateToHome();
        return;
    }

    AppState.currentView = 'detalle_solicitud';

    if (AppState.currentUser?.role === ROLE_ADMIN) {
        renderDetalleSolicitudAdmin(req);
    } else {
        renderDetalleSolicitudSolicitante(req);
    }
}

function renderDetalleSolicitudSolicitante(req) {
    const canvas = createDashboardLayout('');

    const backBtn = document.createElement('button');
    backBtn.type = 'button';
    backBtn.className = 'back-button';
    backBtn.appendChild(createIcon('arrow_back'));
    const backLabel = document.createElement('span');
    backLabel.textContent = 'Volver al panel';
    backBtn.appendChild(backLabel);
    backBtn.addEventListener('click', navigateToHome);
    canvas.appendChild(backBtn);

    const titleRow = document.createElement('div');
    titleRow.className = 'detail-title-row';

    const titleCol = document.createElement('div');

    const titleEl = document.createElement('h1');
    titleEl.className = 'detail-title-row__title';
    titleEl.textContent = req.title;
    titleCol.appendChild(titleEl);

    const idEl = document.createElement('p');
    idEl.className = 'text-body-sm text-outline';
    idEl.textContent = formatRequestId(req.id);
    titleCol.appendChild(idEl);

    titleRow.appendChild(titleCol);

    const statusBadge = createBadge(req.status);
    statusBadge.classList.add('badge--lg');
    titleRow.appendChild(statusBadge);

    canvas.appendChild(titleRow);

    if (req.status === STATUS.CHANGES) {
        canvas.appendChild(createAjustesLayout(req));
    } else {
        const grid = document.createElement('div');
        grid.className = 'detail-grid';

        const leftCol = document.createElement('div');
        leftCol.className = 'detail-col';
        leftCol.appendChild(createDatosGeneralesCard(req));
        leftCol.appendChild(createJustificacionCard(req));
        grid.appendChild(leftCol);

        const rightCol = document.createElement('div');
        rightCol.className = 'detail-col';
        rightCol.appendChild(createComentariosCard(req));
        grid.appendChild(rightCol);

        canvas.appendChild(grid);
    }
}

function createAjustesLayout(req) {
    const wrapper = document.createElement('div');

    /* ---- Banner de alerta con el último comentario del admin ---- */
    const lastAdminComment = req.comments && req.comments.length > 0
        ? [...req.comments].sort((a, b) => b.date.localeCompare(a.date))[0]
        : null;

    const banner = document.createElement('div');
    banner.className = 'summary-card summary-card--alert';

    const bannerHeader = document.createElement('div');
    bannerHeader.className = 'summary-card__title';
    bannerHeader.textContent = 'Se solicitaron ajustes a esta solicitud';
    banner.appendChild(bannerHeader);

    if (lastAdminComment) {
        const bannerQuote = document.createElement('p');
        bannerQuote.className = 'text-body-md';
        bannerQuote.textContent = `"${lastAdminComment.text}"`;
        banner.appendChild(bannerQuote);

        const bannerMeta = document.createElement('p');
        bannerMeta.className = 'text-body-sm text-outline';
        bannerMeta.textContent = `${lastAdminComment.author} · ${formatDate(lastAdminComment.date)}`;
        banner.appendChild(bannerMeta);
    } else {
        const bannerText = document.createElement('p');
        bannerText.className = 'text-body-md';
        bannerText.textContent = 'Revise los comentarios, realice los ajustes necesarios y vuelva a enviar la solicitud.';
        banner.appendChild(bannerText);
    }

    wrapper.appendChild(banner);

    /* ---- Layout de dos columnas ---- */
    const grid = document.createElement('div');
    grid.className = 'detail-grid';

    /* Columna izquierda: formulario editable */
    const leftCol = document.createElement('div');
    leftCol.className = 'detail-col';

    const formCard = document.createElement('div');
    formCard.className = 'detail-card';

    const formCardTitle = document.createElement('h2');
    formCardTitle.className = 'detail-card__title';
    formCardTitle.textContent = 'Editar y reenviar solicitud';
    formCard.appendChild(formCardTitle);

    const form = document.createElement('form');
    form.noValidate = true;

    /* Sección 1 */
    const sec1 = document.createElement('div');
    const sec1Title = document.createElement('h3');
    sec1Title.className = 'form-section__title';
    sec1Title.textContent = '1. Información General';
    sec1.appendChild(sec1Title);

    const grid1 = document.createElement('div');
    grid1.className = 'form-section__grid form-section__grid--2cols';

    const fieldTitulo = createFormField({
        id: `ajuste-titulo-${req.id}`,
        label: 'Título del Proyecto',
        type: 'text',
        required: true,
        placeholder: 'Ej. Actualización del CRM Central',
        value: req.title
    });
    fieldTitulo.group.classList.add('form-section__full');
    grid1.appendChild(fieldTitulo.group);

    const fieldArea = createFormField({
        id: `ajuste-area-${req.id}`,
        label: 'Área Solicitante',
        type: 'select',
        required: true,
        placeholder: 'Seleccione un área...',
        choices: AREAS,
        value: req.area
    });
    grid1.appendChild(fieldArea.group);

    const fieldTipo = createFormField({
        id: `ajuste-tipo-${req.id}`,
        label: 'Tipo de Proyecto',
        type: 'select',
        required: true,
        placeholder: 'Seleccione un tipo...',
        choices: TIPOS_PROYECTO,
        value: req.tipoProyecto
    });
    grid1.appendChild(fieldTipo.group);

    const fieldPrioridad = createFormField({
        id: `ajuste-prioridad-${req.id}`,
        label: 'Prioridad Sugerida',
        type: 'select',
        required: true,
        placeholder: 'Seleccione prioridad...',
        choices: PRIORIDADES,
        value: req.prioridad
    });
    grid1.appendChild(fieldPrioridad.group);

    const fieldFecha = createFormField({
        id: `ajuste-fecha-${req.id}`,
        label: 'Fecha Estimada de Inicio',
        type: 'date',
        required: true,
        value: req.fechaEstimadaInicio
    });
    grid1.appendChild(fieldFecha.group);

    sec1.appendChild(grid1);
    form.appendChild(sec1);

    /* Sección 2 */
    const sec2 = document.createElement('div');
    const sec2Title = document.createElement('h3');
    sec2Title.className = 'form-section__title';
    sec2Title.textContent = '2. Justificación';
    sec2.appendChild(sec2Title);

    const grid2 = document.createElement('div');
    grid2.className = 'form-section__grid';

    const fieldNecesidad = createFormField({
        id: `ajuste-necesidad-${req.id}`,
        label: 'Necesidad de Negocio',
        type: 'textarea',
        required: true,
        rows: 4,
        placeholder: 'Describa la necesidad u oportunidad que motiva este proyecto...',
        value: req.necesidad
    });
    grid2.appendChild(fieldNecesidad.group);

    const fieldImpacto = createFormField({
        id: `ajuste-impacto-${req.id}`,
        label: 'Impacto Esperado',
        type: 'textarea',
        required: true,
        rows: 3,
        placeholder: '¿Cómo beneficiará este proyecto al área y a la institución?',
        value: req.impacto
    });
    grid2.appendChild(fieldImpacto.group);

    sec2.appendChild(grid2);
    form.appendChild(sec2);

    /* Sección 3 */
    const sec3 = document.createElement('div');
    const sec3Title = document.createElement('h3');
    sec3Title.className = 'form-section__title';
    sec3Title.textContent = '3. Presupuesto';
    sec3.appendChild(sec3Title);

    const grid3 = document.createElement('div');
    grid3.className = 'form-section__grid form-section__grid--2cols';

    const fieldPresupuesto = createFormField({
        id: `ajuste-presupuesto-${req.id}`,
        label: 'Presupuesto Estimado (USD)',
        type: 'number',
        required: true,
        placeholder: 'Ej. 500000',
        value: req.presupuestoEstimado
    });
    fieldPresupuesto.input.min = '0';
    fieldPresupuesto.input.step = '1000';
    grid3.appendChild(fieldPresupuesto.group);

    sec3.appendChild(grid3);
    form.appendChild(sec3);

    /* Acciones del formulario */
    const actions = document.createElement('div');
    actions.className = 'form-actions';

    const btnCancel = createButton('Cancelar', 'secondary', null, navigateToHome);
    actions.appendChild(btnCancel);

    const btnSubmit = createButton('Enviar a Revisión', 'primary', 'send', null, 'submit');
    actions.appendChild(btnSubmit);

    form.appendChild(actions);

    /* Validación y envío */
    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const validationFields = [
            { field: fieldTitulo, message: 'Ingrese el título del proyecto.', validate: (v) => v.trim().length >= 3, minMessage: 'El título debe tener al menos 3 caracteres.' },
            { field: fieldArea, message: 'Seleccione el área solicitante.' },
            { field: fieldTipo, message: 'Seleccione el tipo de proyecto.' },
            { field: fieldPrioridad, message: 'Seleccione la prioridad.' },
            { field: fieldFecha, message: 'Seleccione una fecha estimada de inicio.' },
            { field: fieldNecesidad, message: 'Describa la necesidad de negocio.', validate: (v) => v.trim().length >= 10, minMessage: 'Describa con al menos 10 caracteres.' },
            { field: fieldImpacto, message: 'Describa el impacto esperado.', validate: (v) => v.trim().length >= 10, minMessage: 'Describa con al menos 10 caracteres.' },
            { field: fieldPresupuesto, message: 'Ingrese el presupuesto estimado.', validate: (v) => Number(v) > 0, minMessage: 'Ingrese un monto mayor a cero.' }
        ];

        let hasError = false;
        validationFields.forEach(({ field, message, validate, minMessage }) => {
            const value = field.input.value;
            if (!value || (typeof value === 'string' && value.trim() === '')) {
                showFieldError(field.input, message);
                hasError = true;
                return;
            }
            if (typeof validate === 'function' && !validate(value)) {
                showFieldError(field.input, minMessage || message);
                hasError = true;
            }
        });

        if (hasError) {
            showNotification('Revise los campos resaltados antes de enviar.', 'error');
            return;
        }

        const returnStage = req.stage || STAGE.PMO;
        const returnStageLabel = STAGE_LABELS[returnStage] || 'Revisión PMO';

        const index = AppState.requests.findIndex((r) => r.id === req.id);
        if (index !== -1) {
            AppState.requests[index] = {
                ...AppState.requests[index],
                title: fieldTitulo.input.value.trim(),
                status: STATUS.PENDING,
                stage: returnStage,
                area: fieldArea.input.value,
                prioridad: fieldPrioridad.input.value,
                tipoProyecto: fieldTipo.input.value,
                necesidad: fieldNecesidad.input.value.trim(),
                impacto: fieldImpacto.input.value.trim(),
                presupuestoEstimado: fieldPresupuesto.input.value,
                fechaEstimadaInicio: fieldFecha.input.value
            };

            if (!AppState.requests[index].comments) {
                AppState.requests[index].comments = [];
            }
            AppState.requests[index].comments.push({
                author: AppState.currentUser.email,
                date: new Date().toISOString().split('T')[0],
                text: `Solicitud ajustada y reenviada a ${returnStageLabel} por el solicitante.`
            });
        }

        saveState();
        showNotification(`Solicitud reenviada a ${returnStageLabel}. El administrador podrá evaluarla nuevamente.`, 'success');
        navigateTo('dashboard_solicitante');
    });

    formCard.appendChild(form);
    leftCol.appendChild(formCard);
    grid.appendChild(leftCol);

    /* Columna derecha: historial de comentarios (solo lectura) */
    const rightCol = document.createElement('div');
    rightCol.className = 'detail-col';
    rightCol.appendChild(createComentariosCard(req));
    grid.appendChild(rightCol);

    wrapper.appendChild(grid);
    return wrapper;
}

/* ---------------------- Detalle de Solicitud (Admin) --------------------- */

function renderDetalleSolicitudAdmin(req) {
    const canvas = createDashboardLayout('');
    canvas.classList.add('detail-admin');

    canvas.appendChild(createAdminContextHeader(req));
    canvas.appendChild(createWorkflowStepper(req));

    const grid = document.createElement('div');
    grid.className = 'detail-admin__grid';

    const main = document.createElement('div');
    main.className = 'detail-admin__main';
    main.appendChild(createResumenEjecutivoSection(req));

    const bentoRow = document.createElement('div');
    bentoRow.className = 'detail-admin__two-col';
    bentoRow.appendChild(createDatosGeneralesSection(req));
    bentoRow.appendChild(createImpactoFinanzasSection(req));
    main.appendChild(bentoRow);

    grid.appendChild(main);

    const aside = document.createElement('aside');
    aside.className = 'detail-admin__aside';
    aside.appendChild(createDecisionesPanel(req));
    grid.appendChild(aside);

    canvas.appendChild(grid);
}

function createAdminContextHeader(req) {
    const header = document.createElement('div');
    header.className = 'context-header';

    const backLink = document.createElement('button');
    backLink.type = 'button';
    backLink.className = 'context-header__back';
    backLink.appendChild(createIcon('arrow_back'));
    const backLabel = document.createElement('span');
    backLabel.textContent = 'Volver al Panel';
    backLink.appendChild(backLabel);
    backLink.addEventListener('click', () => {
        navigateTo('dashboard_admin');
    });
    header.appendChild(backLink);

    const titleRow = document.createElement('div');
    titleRow.className = 'context-header__title-row';

    const titleBlock = document.createElement('div');
    titleBlock.className = 'context-header__title-block';

    const idLabel = document.createElement('span');
    idLabel.className = 'context-header__id';
    idLabel.textContent = `ID: ${formatRequestId(req.id)}`;
    titleBlock.appendChild(idLabel);

    const title = document.createElement('h1');
    title.className = 'context-header__title';
    title.textContent = req.title;
    titleBlock.appendChild(title);

    titleRow.appendChild(titleBlock);

    const actions = document.createElement('div');
    actions.className = 'context-header__actions';

    actions.appendChild(createContextStatusBadge(req));

    const moreBtn = document.createElement('button');
    moreBtn.type = 'button';
    moreBtn.className = 'context-header__more';
    moreBtn.setAttribute('aria-label', 'Más acciones');
    moreBtn.title = 'Exportar al portafolio';
    moreBtn.appendChild(createIcon('more_vert'));
    moreBtn.addEventListener('click', () => {
        navigateTo('dashboard_admin');
    });
    actions.appendChild(moreBtn);

    titleRow.appendChild(actions);
    header.appendChild(titleRow);

    return header;
}

function createContextStatusBadge(req) {
    const badge = document.createElement('span');
    badge.className = 'context-badge';

    let icon = 'pending_actions';
    let text = req.status;
    let variant = 'info';

    if (req.status === STATUS.PENDING) {
        const stage = req.stage || STAGE.PMO;
        text = `En ${STAGE_LABELS[stage]}`;
        if (stage === STAGE.PMO) {
            icon = 'engineering';
            variant = 'info';
        } else if (stage === STAGE.TECNICA) {
            icon = 'balance';
            variant = 'info';
        } else if (stage === STAGE.DIRECTOR) {
            icon = 'verified_user';
            variant = 'warning';
        }
    } else if (req.status === STATUS.APPROVED) {
        icon = 'task_alt';
        variant = 'success';
    } else if (req.status === STATUS.REJECTED) {
        icon = 'block';
        variant = 'danger';
    } else if (req.status === STATUS.CHANGES) {
        icon = 'edit';
        variant = 'warning';
    } else if (req.status === STATUS.DRAFT) {
        icon = 'edit_note';
        variant = 'muted';
    }

    badge.classList.add(`context-badge--${variant}`);
    badge.appendChild(createIcon(icon));
    const textEl = document.createElement('span');
    textEl.textContent = text;
    badge.appendChild(textEl);

    return badge;
}

function createWorkflowStepper(req) {
    const card = document.createElement('div');
    card.className = 'workflow-stepper';

    const scroller = document.createElement('div');
    scroller.className = 'workflow-stepper__scroller';

    const steps = document.createElement('ol');
    steps.className = 'workflow-stepper__steps';

    const currentIndex = getLifecycleIndex(req);
    const totalSteps = LIFECYCLE_STEPS.length;
    const isTerminal = req.status === STATUS.REJECTED || req.status === STATUS.CHANGES;

    const progressWidth = totalSteps > 1
        ? Math.min(100, Math.max(0, (currentIndex / (totalSteps - 1)) * 100))
        : 0;

    const track = document.createElement('div');
    track.className = 'workflow-stepper__track';
    steps.appendChild(track);

    const progress = document.createElement('div');
    progress.className = 'workflow-stepper__progress';
    progress.style.width = `${progressWidth}%`;
    if (isTerminal) {
        progress.classList.add('workflow-stepper__progress--danger');
    }
    steps.appendChild(progress);

    LIFECYCLE_STEPS.forEach((step, index) => {
        const item = document.createElement('li');
        item.className = 'workflow-step';

        let stateClass = 'workflow-step--pending';
        if (index < currentIndex) {
            stateClass = 'workflow-step--done';
        } else if (index === currentIndex) {
            stateClass = isTerminal ? 'workflow-step--blocked' : 'workflow-step--active';
        }
        item.classList.add(stateClass);

        const dot = document.createElement('span');
        dot.className = 'workflow-step__dot';
        if (index < currentIndex) {
            dot.appendChild(createIcon('check'));
        } else if (index === currentIndex && isTerminal) {
            dot.appendChild(createIcon(req.status === STATUS.REJECTED ? 'close' : 'edit'));
        } else {
            dot.appendChild(createIcon(step.icon));
        }
        item.appendChild(dot);

        const label = document.createElement('span');
        label.className = 'workflow-step__label';
        label.textContent = step.label;
        item.appendChild(label);

        const caption = document.createElement('span');
        caption.className = 'workflow-step__caption';
        if (index === 0 && req.date) {
            caption.textContent = formatDate(req.date);
        } else if (index === currentIndex) {
            if (isTerminal) {
                caption.textContent = req.status === STATUS.REJECTED ? 'Solicitud rechazada' : 'Requiere ajustes';
                caption.classList.add('workflow-step__caption--danger');
            } else {
                caption.textContent = 'Actual';
                caption.classList.add('workflow-step__caption--active');
            }
        } else if (index < currentIndex) {
            caption.textContent = 'Completado';
        }
        if (caption.textContent) {
            item.appendChild(caption);
        }

        steps.appendChild(item);
    });

    scroller.appendChild(steps);
    card.appendChild(scroller);

    return card;
}

function createSectionCard(options) {
    const section = document.createElement('section');
    section.className = 'section-card';
    if (options.variant) {
        section.classList.add(`section-card--${options.variant}`);
    }

    const header = document.createElement('header');
    header.className = 'section-card__header';
    if (options.icon) {
        header.appendChild(createIcon(options.icon));
    }
    const title = document.createElement('h3');
    title.className = 'section-card__title';
    title.textContent = options.title;
    header.appendChild(title);

    section.appendChild(header);

    const body = document.createElement('div');
    body.className = 'section-card__body';
    section.appendChild(body);

    return { section, body };
}

function createResumenEjecutivoSection(req) {
    const { section, body } = createSectionCard({
        title: 'Resumen Ejecutivo',
        icon: 'description'
    });

    const summary = document.createElement('p');
    summary.className = 'section-card__paragraph';
    summary.textContent = req.necesidad || 'Sin resumen ejecutivo proporcionado.';
    body.appendChild(summary);

    if (req.impacto) {
        const impactLabel = document.createElement('span');
        impactLabel.className = 'section-card__sublabel';
        impactLabel.textContent = 'Impacto esperado';
        body.appendChild(impactLabel);

        const impactText = document.createElement('p');
        impactText.className = 'section-card__paragraph section-card__paragraph--muted';
        impactText.textContent = req.impacto;
        body.appendChild(impactText);
    }

    const tags = buildResumeTags(req);
    if (tags.length > 0) {
        const tagList = document.createElement('div');
        tagList.className = 'tag-list';
        tags.forEach((tag) => {
            const tagEl = document.createElement('span');
            tagEl.className = 'tag';
            tagEl.textContent = `#${tag}`;
            tagList.appendChild(tagEl);
        });
        body.appendChild(tagList);
    }

    return section;
}

function buildResumeTags(req) {
    const tags = [];
    const areaLabel = getLabelFromValue(AREAS, req.area);
    if (areaLabel) tags.push(slugifyTag(areaLabel));
    const tipoLabel = getLabelFromValue(TIPOS_PROYECTO, req.tipoProyecto);
    if (tipoLabel) tags.push(slugifyTag(tipoLabel));
    if (req.prioridad === 'alta') tags.push('AltaPrioridad');
    return tags;
}

function slugifyTag(text) {
    return text
        .split(/\s+/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('')
        .replace(/[^A-Za-z0-9]/g, '');
}

function createDatosGeneralesSection(req) {
    const { section, body } = createSectionCard({
        title: 'Datos Generales',
        icon: 'info'
    });

    const sponsor = document.createElement('div');
    sponsor.className = 'info-field';
    const sponsorLabel = document.createElement('span');
    sponsorLabel.className = 'info-field__label';
    sponsorLabel.textContent = 'Solicitante';
    sponsor.appendChild(sponsorLabel);

    const sponsorValue = document.createElement('div');
    sponsorValue.className = 'info-field__sponsor';
    const avatar = document.createElement('span');
    avatar.className = `avatar avatar--${getAvatarVariant(req.applicant)}`;
    avatar.textContent = getInitials(req.applicant);
    sponsorValue.appendChild(avatar);
    const sponsorName = document.createElement('span');
    sponsorName.className = 'info-field__value';
    sponsorName.textContent = formatApplicantName(req.applicant);
    sponsorValue.appendChild(sponsorName);
    sponsor.appendChild(sponsorValue);

    body.appendChild(sponsor);
    body.appendChild(createDivider());

    body.appendChild(buildInfoField('Departamento Patrocinador',
        getLabelFromValue(AREAS, req.area) || 'No especificado'));
    body.appendChild(createDivider());

    const twoCol = document.createElement('div');
    twoCol.className = 'info-grid';
    twoCol.appendChild(buildInfoField('Fecha Inicio Propuesta',
        req.fechaEstimadaInicio ? formatDate(req.fechaEstimadaInicio) : '—'));
    twoCol.appendChild(buildInfoField('Tipo de Proyecto',
        getLabelFromValue(TIPOS_PROYECTO, req.tipoProyecto) || '—'));
    body.appendChild(twoCol);
    body.appendChild(createDivider());

    body.appendChild(buildInfoField('Fecha de Creación', formatDate(req.date)));

    return section;
}

function createImpactoFinanzasSection(req) {
    const { section, body } = createSectionCard({
        title: 'Impacto y Finanzas',
        icon: 'trending_up'
    });

    const budgetField = document.createElement('div');
    budgetField.className = 'info-field';
    const budgetLabel = document.createElement('span');
    budgetLabel.className = 'info-field__label';
    budgetLabel.textContent = 'Presupuesto Estimado (CAPEX/OPEX)';
    budgetField.appendChild(budgetLabel);
    const budgetValue = document.createElement('span');
    budgetValue.className = 'info-field__value info-field__value--hero';
    budgetValue.textContent = req.presupuestoEstimado ? formatCurrency(req.presupuestoEstimado) : 'No definido';
    budgetField.appendChild(budgetValue);
    body.appendChild(budgetField);
    body.appendChild(createDivider());

    const twoCol = document.createElement('div');
    twoCol.className = 'info-grid';

    const roiValue = computeProjectedRoi(req);
    const roiField = buildInfoField('ROI Proyectado', roiValue.label);
    if (roiValue.positive) {
        roiField.querySelector('.info-field__value').classList.add('info-field__value--positive');
    }
    twoCol.appendChild(roiField);

    twoCol.appendChild(buildInfoField('Prioridad', getLabelFromValue(PRIORIDADES, req.prioridad) || '—'));
    body.appendChild(twoCol);
    body.appendChild(createDivider());

    body.appendChild(buildInfoField('Alineación Estratégica OKR',
        buildOkrAlignment(req)));

    return section;
}

function computeProjectedRoi(req) {
    const budget = parseFloat(req.presupuestoEstimado);
    if (!budget || Number.isNaN(budget)) {
        return { label: 'No calculado', positive: false };
    }
    const baseRate = req.prioridad === 'alta' ? 0.22 : req.prioridad === 'media' ? 0.16 : 0.10;
    const percentage = (baseRate * 100).toFixed(1);
    return { label: `${percentage}% (Año 2)`, positive: true };
}

function buildOkrAlignment(req) {
    if (req.tipoProyecto === 'infraestructura') {
        return 'Obj 2: Modernización Tecnológica';
    }
    if (req.tipoProyecto === 'seguridad') {
        return 'Obj 1: Gobierno de Riesgo y Cumplimiento';
    }
    if (req.tipoProyecto === 'analitica') {
        return 'Obj 3: Decisiones basadas en datos';
    }
    if (req.tipoProyecto === 'desarrollo') {
        return 'Obj 4: Transformación Digital Eficiente';
    }
    return 'Alineado al plan estratégico anual';
}

function buildInfoField(label, value) {
    const field = document.createElement('div');
    field.className = 'info-field';

    const labelEl = document.createElement('span');
    labelEl.className = 'info-field__label';
    labelEl.textContent = label;
    field.appendChild(labelEl);

    const valueEl = document.createElement('span');
    valueEl.className = 'info-field__value';
    valueEl.textContent = value || '—';
    field.appendChild(valueEl);

    return field;
}

function createDivider() {
    const divider = document.createElement('span');
    divider.className = 'info-divider';
    return divider;
}

function createDecisionesPanel(req) {
    const panel = document.createElement('div');
    panel.className = 'decisions-panel';

    const header = document.createElement('header');
    header.className = 'decisions-panel__header';
    header.appendChild(createIcon('forum'));
    const title = document.createElement('h3');
    title.className = 'decisions-panel__title';
    title.textContent = 'Decisiones y Comentarios';
    header.appendChild(title);
    panel.appendChild(header);

    panel.appendChild(createDecisionesTimeline(req));

    if (req.status === STATUS.PENDING || req.status === STATUS.CHANGES) {
        panel.appendChild(createDecisionesActionArea(req));
    } else if (req.status === STATUS.REJECTED) {
        panel.appendChild(createReopenFooter(req));
    } else {
        panel.appendChild(createDecisionesReadOnlyFooter(req));
    }

    return panel;
}

function createDecisionesTimeline(req) {
    const list = document.createElement('ol');
    list.className = 'decisions-timeline';

    list.appendChild(createTimelineItem({
        icon: 'upload',
        variant: 'default',
        title: 'Solicitud Enviada',
        date: formatDate(req.date),
        subtitle: `Por ${formatApplicantName(req.applicant)}`
    }));

    const sortedComments = (req.comments || [])
        .slice()
        .sort((a, b) => a.date.localeCompare(b.date));

    sortedComments.forEach((comment) => {
        const isStageTransition = /avanz[óo]|regres[oó]/i.test(comment.text);
        list.appendChild(createTimelineItem({
            icon: isStageTransition ? 'timeline' : 'edit_note',
            variant: isStageTransition ? 'neutral' : 'comment',
            title: isStageTransition
                ? 'Actualización de flujo'
                : `Nota de ${formatApplicantName(comment.author)}`,
            date: formatDate(comment.date),
            text: isStageTransition ? null : comment.text,
            subtitle: `Por ${formatApplicantName(comment.author)}`,
            highlight: isStageTransition ? comment.text : null
        }));
    });

    if (req.status === STATUS.PENDING) {
        list.appendChild(createTimelineItem({
            icon: 'hourglass_empty',
            variant: 'waiting',
            title: 'Esperando tu revisión',
            emphasized: true
        }));
    } else if (req.status === STATUS.APPROVED) {
        list.appendChild(createTimelineItem({
            icon: 'verified',
            variant: 'success',
            title: 'Solicitud aprobada',
            emphasized: true
        }));
    } else if (req.status === STATUS.REJECTED) {
        list.appendChild(createTimelineItem({
            icon: 'block',
            variant: 'danger',
            title: 'Solicitud rechazada',
            emphasized: true
        }));
    } else if (req.status === STATUS.CHANGES) {
        list.appendChild(createTimelineItem({
            icon: 'edit',
            variant: 'warning',
            title: 'Requiere ajustes del solicitante',
            emphasized: true
        }));
    }

    return list;
}

function createTimelineItem(options) {
    const item = document.createElement('li');
    item.className = `timeline-item timeline-item--${options.variant || 'default'}`;
    if (options.emphasized) {
        item.classList.add('timeline-item--emphasized');
    }

    const dot = document.createElement('span');
    dot.className = 'timeline-item__dot';
    if (options.icon) {
        dot.appendChild(createIcon(options.icon));
    }
    item.appendChild(dot);

    const body = document.createElement('div');
    body.className = 'timeline-item__body';

    const headerRow = document.createElement('div');
    headerRow.className = 'timeline-item__header';

    const title = document.createElement('span');
    title.className = 'timeline-item__title';
    title.textContent = options.title || '';
    headerRow.appendChild(title);

    if (options.date) {
        const date = document.createElement('span');
        date.className = 'timeline-item__date';
        date.textContent = options.date;
        headerRow.appendChild(date);
    }

    body.appendChild(headerRow);

    if (options.text) {
        const bubble = document.createElement('p');
        bubble.className = 'timeline-item__bubble';
        bubble.textContent = options.text;
        body.appendChild(bubble);
    }

    if (options.highlight) {
        const highlight = document.createElement('p');
        highlight.className = 'timeline-item__highlight';
        highlight.textContent = options.highlight;
        body.appendChild(highlight);
    }

    if (options.subtitle) {
        const subtitle = document.createElement('span');
        subtitle.className = 'timeline-item__subtitle';
        subtitle.textContent = options.subtitle;
        body.appendChild(subtitle);
    }

    item.appendChild(body);
    return item;
}

function createDecisionesActionArea(req) {
    const wrapper = document.createElement('div');
    wrapper.className = 'decisions-action';

    const commentField = createFormField({
        id: `decision-comment-${req.id}`,
        label: 'Añadir Comentario o Decisión',
        type: 'textarea',
        rows: 3,
        placeholder: 'Escribe tus observaciones aquí...'
    });
    wrapper.appendChild(commentField.group);

    const currentIndex = getLifecycleIndex(req);
    const currentStage = req.stage || STAGE.PMO;
    const isLastStage = currentStage === STAGE.DIRECTOR;

    const getComment = () => commentField.input.value.trim();

    const addComment = (text) => {
        if (!req.comments) req.comments = [];
        req.comments.push({
            author: AppState.currentUser.email,
            date: new Date().toISOString().split('T')[0],
            text
        });
    };

    const buttons = document.createElement('div');
    buttons.className = 'decisions-action__buttons';

    if (!isLastStage && req.status === STATUS.PENDING) {
        const nextStage = STAGE_ORDER[STAGE_ORDER.indexOf(currentStage) + 1];
        const advanceLabel = `Aprobar Fase ${STAGE_LABELS[currentStage]}`;
        const advanceBtn = createButton(advanceLabel, 'primary', 'thumb_up', () => {
            const comment = getComment();
            addComment(comment || `La solicitud avanzó a la etapa "${STAGE_LABELS[nextStage]}".`);
            req.stage = nextStage;
            saveState();
            showNotification(`Solicitud avanzada a ${STAGE_LABELS[nextStage]}.`, 'success');
            renderDetalleSolicitud(req.id);
        });
        advanceBtn.classList.add('button--block');
        buttons.appendChild(advanceBtn);
    }

    if (isLastStage && req.status === STATUS.PENDING) {
        const finalApproveBtn = createButton('Aprobar Solicitud', 'primary', 'task_alt', () => {
            const comment = getComment();
            addComment(comment || 'Solicitud aprobada por el director.');
            req.status = STATUS.APPROVED;
            saveState();
            showNotification('Solicitud aprobada correctamente.', 'success');
            renderDetalleSolicitud(req.id);
        });
        finalApproveBtn.classList.add('button--block');
        buttons.appendChild(finalApproveBtn);
    }

    const changesBtn = createButton('Solicitar Ajustes', 'secondary', 'edit', () => {
        const comment = getComment();
        if (!comment) {
            showFieldError(commentField.input, 'Agrega un comentario indicando los ajustes requeridos.');
            return;
        }
        addComment(comment);
        req.status = STATUS.CHANGES;
        saveState();
        showNotification('Se solicitaron ajustes al solicitante.', 'info');
        renderDetalleSolicitud(req.id);
    });
    buttons.appendChild(changesBtn);

    const rejectBtn = createButton('Rechazar', 'danger', 'close', () => {
        const comment = getComment();
        if (!comment) {
            showFieldError(commentField.input, 'Agrega un comentario justificando el rechazo.');
            return;
        }
        addComment(comment);
        req.status = STATUS.REJECTED;
        saveState();
        showNotification('La solicitud fue rechazada.', 'error');
        renderDetalleSolicitud(req.id);
    });
    buttons.appendChild(rejectBtn);

    wrapper.appendChild(buttons);

    if (req.status === STATUS.PENDING && STAGE_ORDER.indexOf(currentStage) > 0) {
        const backInfo = document.createElement('p');
        backInfo.className = 'decisions-action__hint';
        const prevStage = STAGE_ORDER[STAGE_ORDER.indexOf(currentStage) - 1];
        const backLink = document.createElement('button');
        backLink.type = 'button';
        backLink.className = 'decisions-action__link';
        backLink.textContent = `← Regresar a ${STAGE_LABELS[prevStage]}`;
        backLink.addEventListener('click', () => {
            const comment = getComment();
            if (!req.comments) req.comments = [];
            req.comments.push({
                author: AppState.currentUser.email,
                date: new Date().toISOString().split('T')[0],
                text: comment || `La solicitud fue regresada a la etapa "${STAGE_LABELS[prevStage]}".`
            });
            req.stage = prevStage;
            saveState();
            showNotification(`Solicitud regresada a ${STAGE_LABELS[prevStage]}.`, 'info');
            renderDetalleSolicitud(req.id);
        });
        backInfo.appendChild(backLink);
        wrapper.appendChild(backInfo);
    }

    if (currentIndex > 0 || !isLastStage) {
        /* keep layout */
    }

    return wrapper;
}

function createDecisionesReadOnlyFooter(req) {
    const footer = document.createElement('div');
    footer.className = 'decisions-action decisions-action--readonly';

    const text = document.createElement('p');
    text.className = 'text-body-sm text-on-surface-variant';
    if (req.status === STATUS.APPROVED) {
        text.textContent = 'La solicitud ya fue aprobada. No se pueden registrar nuevas decisiones.';
    } else if (req.status === STATUS.DRAFT) {
        text.textContent = 'Esta solicitud está en borrador. El solicitante aún no la ha enviado a revisión.';
    } else {
        text.textContent = 'La solicitud ya no está activa para decisiones.';
    }
    footer.appendChild(text);

    return footer;
}

function createReopenFooter(req) {
    const wrapper = document.createElement('div');
    wrapper.className = 'decisions-action';

    const banner = document.createElement('div');
    banner.className = 'summary-card summary-card--alert';
    banner.style.marginBottom = '1.6rem';

    const bannerIcon = createIcon('block');
    banner.appendChild(bannerIcon);

    const bannerText = document.createElement('div');
    const bannerTitle = document.createElement('p');
    bannerTitle.className = 'text-label-caps';
    bannerTitle.style.fontWeight = '700';
    bannerTitle.textContent = 'Solicitud rechazada';
    bannerText.appendChild(bannerTitle);
    const bannerDesc = document.createElement('p');
    bannerDesc.className = 'text-body-sm';
    bannerDesc.textContent = 'Esta solicitud fue rechazada. Puedes reabrirla y enviarla de regreso a la etapa que consideres pertinente.';
    bannerText.appendChild(bannerDesc);
    banner.appendChild(bannerText);

    wrapper.appendChild(banner);

    const stageField = createFormField({
        id: `reopen-stage-${req.id}`,
        label: 'Etapa de destino al reabrir',
        type: 'select',
        placeholder: 'Selecciona la etapa de destino...',
        choices: STAGE_ORDER.map((s) => ({ value: s, label: STAGE_LABELS[s] }))
    });
    wrapper.appendChild(stageField.group);

    const commentField = createFormField({
        id: `reopen-comment-${req.id}`,
        label: 'Justificación de la reapertura',
        type: 'textarea',
        rows: 3,
        placeholder: 'Indica el motivo por el que se reactiva la solicitud...'
    });
    wrapper.appendChild(commentField.group);

    const reopenBtn = createButton('Reabrir Solicitud', 'primary', 'restart_alt', () => {
        const targetStage = stageField.input.value;
        const comment = commentField.input.value.trim();

        if (!targetStage) {
            showFieldError(stageField.input, 'Debes seleccionar la etapa de destino.');
            showNotification('Selecciona la etapa antes de continuar.', 'error');
            return;
        }
        if (!comment) {
            showFieldError(commentField.input, 'Agrega una justificación para la reapertura.');
            showNotification('Agrega una justificación antes de continuar.', 'error');
            return;
        }

        if (!req.comments) req.comments = [];
        req.comments.push({
            author: AppState.currentUser.email,
            date: new Date().toISOString().split('T')[0],
            text: `Solicitud reabierta y enviada a "${STAGE_LABELS[targetStage]}". Motivo: ${comment}`
        });

        req.status = STATUS.PENDING;
        req.stage  = targetStage;

        saveState();
        showNotification(`Solicitud reabierta en etapa "${STAGE_LABELS[targetStage]}".`, 'success');
        renderDetalleSolicitud(req.id);
    });
    reopenBtn.classList.add('button--block');
    wrapper.appendChild(reopenBtn);

    return wrapper;
}

function createDetailField(label, value) {
    const field = document.createElement('div');

    const labelEl = document.createElement('span');
    labelEl.className = 'detail-field__label';
    labelEl.textContent = label;
    field.appendChild(labelEl);

    const valueEl = document.createElement('span');
    valueEl.className = 'detail-field__value';
    valueEl.textContent = value || '—';
    field.appendChild(valueEl);

    return field;
}

function createDatosGeneralesCard(req) {
    const card = document.createElement('div');
    card.className = 'detail-card';

    const title = document.createElement('h2');
    title.className = 'detail-card__title';
    title.textContent = 'Datos Generales';
    card.appendChild(title);

    const fields = document.createElement('div');
    fields.className = 'detail-fields detail-fields--2cols';

    fields.appendChild(createDetailField('Solicitante', req.applicant));
    fields.appendChild(createDetailField('Fecha de Creación', formatDate(req.date)));
    fields.appendChild(createDetailField('Área', getLabelFromValue(AREAS, req.area)));
    fields.appendChild(createDetailField('Tipo de Proyecto', getLabelFromValue(TIPOS_PROYECTO, req.tipoProyecto)));
    fields.appendChild(createDetailField('Prioridad', getLabelFromValue(PRIORIDADES, req.prioridad)));
    fields.appendChild(createDetailField('Fecha Estimada de Inicio', formatDate(req.fechaEstimadaInicio)));
    fields.appendChild(createDetailField('Presupuesto Estimado', formatCurrency(req.presupuestoEstimado)));

    card.appendChild(fields);
    return card;
}

function createJustificacionCard(req) {
    const card = document.createElement('div');
    card.className = 'detail-card';

    const title = document.createElement('h2');
    title.className = 'detail-card__title';
    title.textContent = 'Justificación';
    card.appendChild(title);

    const necesidadLabel = document.createElement('span');
    necesidadLabel.className = 'detail-field__label';
    necesidadLabel.textContent = 'Necesidad de Negocio';
    card.appendChild(necesidadLabel);

    const necesidadText = document.createElement('p');
    necesidadText.className = 'detail-field__text detail-field__text--spaced';
    necesidadText.textContent = req.necesidad || '—';
    card.appendChild(necesidadText);

    const impactoLabel = document.createElement('span');
    impactoLabel.className = 'detail-field__label';
    impactoLabel.textContent = 'Impacto Esperado';
    card.appendChild(impactoLabel);

    const impactoText = document.createElement('p');
    impactoText.className = 'detail-field__text';
    impactoText.textContent = req.impacto || '—';
    card.appendChild(impactoText);

    return card;
}

function createComentariosCard(req) {
    const card = document.createElement('div');
    card.className = 'detail-card';

    const title = document.createElement('h2');
    title.className = 'detail-card__title';
    title.textContent = 'Decisiones y Comentarios';
    card.appendChild(title);

    const commentsList = document.createElement('div');
    commentsList.className = 'comments';
    card.appendChild(commentsList);

    const renderComments = () => {
        while (commentsList.firstChild) {
            commentsList.removeChild(commentsList.firstChild);
        }
        if (!req.comments || req.comments.length === 0) {
            const empty = document.createElement('p');
            empty.className = 'comments__empty';
            empty.textContent = 'Aún no hay comentarios registrados.';
            commentsList.appendChild(empty);
            return;
        }
        req.comments
            .slice()
            .sort((a, b) => a.date.localeCompare(b.date))
            .forEach((comment) => {
                const commentEl = document.createElement('div');
                commentEl.className = 'comment';

                const header = document.createElement('div');
                header.className = 'comment__header';

                const author = document.createElement('span');
                author.className = 'comment__author';
                author.textContent = comment.author;
                header.appendChild(author);

                const date = document.createElement('span');
                date.className = 'comment__date';
                date.textContent = formatDate(comment.date);
                header.appendChild(date);

                commentEl.appendChild(header);

                const text = document.createElement('p');
                text.className = 'comment__text';
                text.textContent = comment.text;
                commentEl.appendChild(text);

                commentsList.appendChild(commentEl);
            });
    };

    renderComments();

    const form = document.createElement('form');
    form.className = 'comment-form';
    form.noValidate = true;

    const textareaField = createFormField({
        id: `comment-${req.id}`,
        label: 'Agregar Comentario',
        type: 'textarea',
        required: true,
        rows: 3,
        placeholder: 'Escriba aquí un comentario para la solicitud...'
    });
    form.appendChild(textareaField.group);

    const submitBtn = createButton('Publicar Comentario', 'primary', 'send', null, 'submit');
    submitBtn.classList.add('button--block');
    form.appendChild(submitBtn);

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const text = textareaField.input.value.trim();
        if (!text) {
            showFieldError(textareaField.input, 'Escriba un comentario antes de publicar.');
            return;
        }
        if (text.length < 3) {
            showFieldError(textareaField.input, 'El comentario debe tener al menos 3 caracteres.');
            return;
        }

        if (!req.comments) req.comments = [];
        req.comments.push({
            author: AppState.currentUser.email,
            date: new Date().toISOString().split('T')[0],
            text
        });
        saveState();
        textareaField.input.value = '';
        renderComments();
        showNotification('Comentario publicado correctamente.', 'success');
    });

    card.appendChild(form);
    return card;
}

/* ------------------------ Dashboard Administrador ----------------------- */
/* Portfolio Dashboard: KPIs + filtros + tabla + paginación                 */

function renderDashboardAdmin() {
    AppState.currentView = 'dashboard_admin';
    const canvas = createDashboardLayout('dashboard_admin');

    const exportBtn = createButton('Exportar Reporte', 'secondary', 'download',
        () => exportRequestsToCsv(getFilteredRequests()));

    canvas.appendChild(createPageHeader(
        'Portfolio Dashboard',
        'Visión ejecutiva de todas las solicitudes de proyecto de la organización.',
        exportBtn
    ));

    canvas.appendChild(createPortfolioKpis());
    canvas.appendChild(createPortfolioTable());
}

/* ============================================================ */
/* Flujo de Gobierno (Admin) — visión portafolio de las 5 etapas */
/* ============================================================ */

/* ---------------------- Vista de etapa (sidebar) ------------------------ */

function renderEtapaSolicitudes(stepKey) {
    if (AppState.currentUser?.role !== ROLE_ADMIN) {
        showNotification('Solo los administradores pueden acceder a esta sección.', 'error');
        navigateToHome();
        return;
    }

    const routeMap = {
        revision_pmo: 'etapa_pmo',
        evaluacion:   'etapa_tecnica',
        aprobacion:   'etapa_director',
        aprobado:     'etapa_aprobado'
    };

    AppState.currentView = routeMap[stepKey] || 'flujo_gobierno';
    const canvas = createDashboardLayout(routeMap[stepKey] || 'flujo_gobierno');

    const step = LIFECYCLE_STEPS.find((s) => s.key === stepKey);
    const meta = getGovStageMeta(stepKey);
    const bucket = getGovStageBucket(stepKey);

    const sorted = bucket.slice().sort((a, b) => {
        const rank = { alta: 0, media: 1, baja: 2 };
        const pa = rank[a.prioridad] ?? 3;
        const pb = rank[b.prioridad] ?? 3;
        if (pa !== pb) return pa - pb;
        return String(b.date || '').localeCompare(String(a.date || ''));
    });

    canvas.appendChild(createPageHeader(
        step ? step.label : stepKey,
        meta.description
    ));

    /* Tarjeta expandida reutilizando los estilos gov-stage-card */
    const card = document.createElement('article');
    card.className = `gov-stage-card gov-stage-card--${meta.accent}`;
    card.style.maxWidth = '100%';

    const header = document.createElement('header');
    header.className = 'gov-stage-card__header';

    const iconBox = document.createElement('span');
    iconBox.className = 'gov-stage-card__icon';
    iconBox.appendChild(createIcon(step ? step.icon : 'folder'));
    header.appendChild(iconBox);

    const headings = document.createElement('div');
    headings.className = 'gov-stage-card__headings';
    const orderEl = document.createElement('span');
    orderEl.className = 'gov-stage-card__order';
    orderEl.textContent = meta.sla;
    headings.appendChild(orderEl);
    const titleEl = document.createElement('h3');
    titleEl.className = 'gov-stage-card__title';
    titleEl.textContent = step ? step.label : stepKey;
    headings.appendChild(titleEl);
    header.appendChild(headings);

    const countEl = document.createElement('span');
    countEl.className = 'gov-stage-card__count';
    countEl.textContent = String(sorted.length);
    header.appendChild(countEl);

    card.appendChild(header);

    const list = document.createElement('ul');
    list.className = 'gov-stage-card__list gov-stage-card__list--full';

    if (sorted.length === 0) {
        const empty = document.createElement('li');
        empty.className = 'gov-stage-card__empty';
        empty.appendChild(createIcon('inbox'));
        const emptyText = document.createElement('span');
        emptyText.textContent = 'Sin solicitudes en esta etapa.';
        empty.appendChild(emptyText);
        list.appendChild(empty);
    } else {
        sorted.forEach((req) => {
            list.appendChild(createGovStageListItem(req, stepKey));
        });
    }

    card.appendChild(list);
    canvas.appendChild(card);
}

/* ---------------------- Flujo de Gobierno ------------------------------- */

function renderFlujoGobierno() {
    if (AppState.currentUser?.role !== ROLE_ADMIN) {
        showNotification('Solo los administradores de la PMO pueden acceder al flujo de gobierno.', 'error');
        navigateToHome();
        return;
    }

    AppState.currentView = 'flujo_gobierno';
    const canvas = createDashboardLayout('flujo_gobierno');

    canvas.appendChild(createPageHeader(
        'Flujo de Gobierno',
        'Seguimiento visual de las 5 etapas que recorre cada solicitud de proyecto antes de ser aprobada.'
    ));

    canvas.appendChild(createGovPipelineSummary());
    canvas.appendChild(createGovHeroStepper());
    canvas.appendChild(createGovStagesGrid());
    canvas.appendChild(createGovTerminalStates());
}

function getGovStageBucket(stepKey) {
    const all = AppState.requests;
    switch (stepKey) {
        case 'borrador':
            return all.filter((r) => r.status === STATUS.DRAFT);
        case 'revision_pmo':
            return all.filter((r) => r.status === STATUS.PENDING && r.stage === STAGE.PMO);
        case 'evaluacion':
            return all.filter((r) => r.status === STATUS.PENDING && r.stage === STAGE.TECNICA);
        case 'aprobacion':
            return all.filter((r) => r.status === STATUS.PENDING && r.stage === STAGE.DIRECTOR);
        case 'aprobado':
            return all.filter((r) => r.status === STATUS.APPROVED);
        default:
            return [];
    }
}

function getGovStageMeta(stepKey) {
    switch (stepKey) {
        case 'borrador':
            return {
                description: 'Solicitudes que el solicitante está redactando y aún no envía a la PMO.',
                sla: 'Sin SLA — trabajo en curso',
                accent: 'draft'
            };
        case 'revision_pmo':
            return {
                description: 'La PMO valida alineación estratégica, completitud y criterios iniciales.',
                sla: 'SLA objetivo: 3 días hábiles',
                accent: 'info'
            };
        case 'evaluacion':
            return {
                description: 'El equipo de Finanzas valida presupuesto, ROI y viabilidad económica.',
                sla: 'SLA objetivo: 5 días hábiles',
                accent: 'warning'
            };
        case 'aprobacion':
            return {
                description: 'El Director o comité resuelve la autorización final del proyecto.',
                sla: 'SLA objetivo: 2 días hábiles',
                accent: 'primary'
            };
        case 'aprobado':
            return {
                description: 'Proyectos autorizados listos para ejecución y seguimiento en el portafolio.',
                sla: 'Estado final del flujo',
                accent: 'success'
            };
        default:
            return { description: '', sla: '', accent: 'muted' };
    }
}

function createGovPipelineSummary() {
    const all = AppState.requests;
    const inFlight = all.filter(
        (r) => r.status === STATUS.PENDING || r.status === STATUS.DRAFT
    ).length;
    const approved = all.filter((r) => r.status === STATUS.APPROVED).length;
    const changes = all.filter((r) => r.status === STATUS.CHANGES).length;
    const rejected = all.filter((r) => r.status === STATUS.REJECTED).length;

    const grid = document.createElement('div');
    grid.className = 'kpi-grid';

    grid.appendChild(createSummaryCard(
        'Solicitudes en Flujo', inFlight, 'hourglass_top',
        'trending_up', 'Activas en el proceso'
    ));
    grid.appendChild(createSummaryCard(
        'Aprobadas', approved, 'verified',
        'check_circle', 'Cerradas con autorización'
    ));
    grid.appendChild(createSummaryCard(
        'Requieren Ajustes', changes, 'edit_note',
        'priority_high', 'Regresadas al solicitante'
    ));
    grid.appendChild(createSummaryCard(
        'Rechazadas', rejected, 'block',
        'remove_circle', 'Detenidas por la PMO'
    ));

    return grid;
}

function createGovHeroStepper() {
    const card = document.createElement('section');
    card.className = 'gov-hero';

    const header = document.createElement('div');
    header.className = 'gov-hero__header';

    const title = document.createElement('h2');
    title.className = 'gov-hero__title';
    title.textContent = 'Ciclo de vida del proyecto';
    header.appendChild(title);

    const subtitle = document.createElement('p');
    subtitle.className = 'gov-hero__subtitle';
    subtitle.textContent = 'Cada solicitud recorre estas cinco etapas antes de ser liberada al portafolio.';
    header.appendChild(subtitle);

    card.appendChild(header);

    const scroller = document.createElement('div');
    scroller.className = 'gov-hero__scroller';

    const steps = document.createElement('ol');
    steps.className = 'gov-hero__steps';

    const track = document.createElement('div');
    track.className = 'gov-hero__track';
    steps.appendChild(track);

    LIFECYCLE_STEPS.forEach((step, index) => {
        const bucket = getGovStageBucket(step.key);
        const meta = getGovStageMeta(step.key);

        const item = document.createElement('li');
        item.className = 'gov-hero-step';
        item.classList.add(`gov-hero-step--${meta.accent}`);

        const dot = document.createElement('span');
        dot.className = 'gov-hero-step__dot';
        dot.appendChild(createIcon(step.icon));
        item.appendChild(dot);

        const label = document.createElement('span');
        label.className = 'gov-hero-step__label';
        label.textContent = `${index + 1}. ${step.label}`;
        item.appendChild(label);

        const count = document.createElement('span');
        count.className = 'gov-hero-step__count';
        count.textContent = String(bucket.length);
        item.appendChild(count);

        const caption = document.createElement('span');
        caption.className = 'gov-hero-step__caption';
        caption.textContent = bucket.length === 1 ? 'solicitud en esta etapa' : 'solicitudes en esta etapa';
        item.appendChild(caption);

        if (index < LIFECYCLE_STEPS.length - 1) {
            const connector = document.createElement('span');
            connector.className = 'gov-hero-step__connector';
            connector.setAttribute('aria-hidden', 'true');
            item.appendChild(connector);
        }

        steps.appendChild(item);
    });

    scroller.appendChild(steps);
    card.appendChild(scroller);

    return card;
}

function createGovStagesGrid() {
    const section = document.createElement('section');
    section.className = 'gov-stages';

    const sectionHeader = document.createElement('div');
    sectionHeader.className = 'gov-stages__header';

    const sectionTitle = document.createElement('h2');
    sectionTitle.className = 'gov-stages__title';
    sectionTitle.textContent = 'Detalle por etapa';
    sectionHeader.appendChild(sectionTitle);

    const sectionSubtitle = document.createElement('p');
    sectionSubtitle.className = 'gov-stages__subtitle';
    sectionSubtitle.textContent = 'Consulta las solicitudes que se encuentran actualmente en cada fase del flujo.';
    sectionHeader.appendChild(sectionSubtitle);

    section.appendChild(sectionHeader);

    const grid = document.createElement('div');
    grid.className = 'gov-stages__grid';

    LIFECYCLE_STEPS.forEach((step, index) => {
        grid.appendChild(createGovStageCard(step, index));
    });

    section.appendChild(grid);
    return section;
}

function createGovStageCard(step, index) {
    const bucket = getGovStageBucket(step.key);
    const meta = getGovStageMeta(step.key);

    const card = document.createElement('article');
    card.className = 'gov-stage-card';
    card.classList.add(`gov-stage-card--${meta.accent}`);

    const header = document.createElement('header');
    header.className = 'gov-stage-card__header';

    const iconBox = document.createElement('span');
    iconBox.className = 'gov-stage-card__icon';
    iconBox.appendChild(createIcon(step.icon));
    header.appendChild(iconBox);

    const headings = document.createElement('div');
    headings.className = 'gov-stage-card__headings';

    const order = document.createElement('span');
    order.className = 'gov-stage-card__order';
    order.textContent = `Etapa ${index + 1} de ${LIFECYCLE_STEPS.length}`;
    headings.appendChild(order);

    const title = document.createElement('h3');
    title.className = 'gov-stage-card__title';
    title.textContent = step.label;
    headings.appendChild(title);

    header.appendChild(headings);

    const count = document.createElement('span');
    count.className = 'gov-stage-card__count';
    count.textContent = String(bucket.length);
    header.appendChild(count);

    card.appendChild(header);

    const description = document.createElement('p');
    description.className = 'gov-stage-card__description';
    description.textContent = meta.description;
    card.appendChild(description);

    const sla = document.createElement('div');
    sla.className = 'gov-stage-card__sla';
    sla.appendChild(createIcon('schedule'));
    const slaText = document.createElement('span');
    slaText.textContent = meta.sla;
    sla.appendChild(slaText);
    card.appendChild(sla);

    const list = document.createElement('ul');
    list.className = 'gov-stage-card__list';

    if (bucket.length === 0) {
        const empty = document.createElement('li');
        empty.className = 'gov-stage-card__empty';
        empty.appendChild(createIcon('inbox'));
        const emptyText = document.createElement('span');
        emptyText.textContent = 'Sin solicitudes en esta etapa.';
        empty.appendChild(emptyText);
        list.appendChild(empty);
    } else {
        const sorted = bucket.slice().sort((a, b) => {
            const priorityRank = { alta: 0, media: 1, baja: 2 };
            const pa = priorityRank[a.prioridad] ?? 3;
            const pb = priorityRank[b.prioridad] ?? 3;
            if (pa !== pb) return pa - pb;
            return String(b.date || '').localeCompare(String(a.date || ''));
        });

        sorted.forEach((req) => {
            list.appendChild(createGovStageListItem(req, step.key));
        });
    }

    card.appendChild(list);
    return card;
}

function createGovStageListItem(req, stepKey) {
    const item = document.createElement('li');
    item.className = 'gov-stage-item';

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'gov-stage-item__button';

    const left = document.createElement('div');
    left.className = 'gov-stage-item__left';

    const idChip = document.createElement('span');
    idChip.className = 'gov-stage-item__id';
    idChip.textContent = formatRequestId(req.id);
    left.appendChild(idChip);

    const title = document.createElement('span');
    title.className = 'gov-stage-item__title';
    title.textContent = req.title;
    left.appendChild(title);

    btn.appendChild(left);

    const right = document.createElement('div');
    right.className = 'gov-stage-item__right';

    right.appendChild(getPriorityBadge(req.prioridad));

    const budget = document.createElement('span');
    budget.className = 'gov-stage-item__budget';
    budget.textContent = formatBudgetShort(req.presupuestoEstimado);
    right.appendChild(budget);

    btn.appendChild(right);

    btn.addEventListener('click', () => {
        navigateTo('detalle_solicitud', req.id);
    });

    item.appendChild(btn);
    return item;
}

function createGovTerminalStates() {
    const all = AppState.requests;
    const changes = all.filter((r) => r.status === STATUS.CHANGES);
    const rejected = all.filter((r) => r.status === STATUS.REJECTED);

    const section = document.createElement('section');
    section.className = 'gov-terminal';

    const header = document.createElement('div');
    header.className = 'gov-terminal__header';

    const title = document.createElement('h2');
    title.className = 'gov-terminal__title';
    title.textContent = 'Estados fuera de flujo';
    header.appendChild(title);

    const subtitle = document.createElement('p');
    subtitle.className = 'gov-terminal__subtitle';
    subtitle.textContent = 'Solicitudes regresadas al solicitante o descartadas por la PMO.';
    header.appendChild(subtitle);

    section.appendChild(header);

    const grid = document.createElement('div');
    grid.className = 'gov-terminal__grid';

    grid.appendChild(createGovTerminalCard(
        'Requieren Ajustes',
        'Fueron regresadas al solicitante con comentarios para que actualice la solicitud.',
        'edit_note',
        'warning',
        changes
    ));
    grid.appendChild(createGovTerminalCard(
        'Rechazadas',
        'No cumplieron criterios de la PMO o Finanzas; el flujo quedó cerrado.',
        'block',
        'danger',
        rejected
    ));

    section.appendChild(grid);
    return section;
}

function createGovTerminalCard(title, description, iconName, accent, bucket) {
    const card = document.createElement('article');
    card.className = 'gov-terminal-card';
    card.classList.add(`gov-terminal-card--${accent}`);

    const header = document.createElement('header');
    header.className = 'gov-terminal-card__header';

    const iconBox = document.createElement('span');
    iconBox.className = 'gov-terminal-card__icon';
    iconBox.appendChild(createIcon(iconName));
    header.appendChild(iconBox);

    const headings = document.createElement('div');
    headings.className = 'gov-terminal-card__headings';

    const titleEl = document.createElement('h3');
    titleEl.className = 'gov-terminal-card__title';
    titleEl.textContent = title;
    headings.appendChild(titleEl);

    const descEl = document.createElement('p');
    descEl.className = 'gov-terminal-card__description';
    descEl.textContent = description;
    headings.appendChild(descEl);

    header.appendChild(headings);

    const count = document.createElement('span');
    count.className = 'gov-terminal-card__count';
    count.textContent = String(bucket.length);
    header.appendChild(count);

    card.appendChild(header);

    const list = document.createElement('ul');
    list.className = 'gov-stage-card__list';

    if (bucket.length === 0) {
        const empty = document.createElement('li');
        empty.className = 'gov-stage-card__empty';
        empty.appendChild(createIcon('inbox'));
        const emptyText = document.createElement('span');
        emptyText.textContent = 'Sin solicitudes en este estado.';
        empty.appendChild(emptyText);
        list.appendChild(empty);
    } else {
        bucket.slice(0, 4).forEach((req) => {
            list.appendChild(createGovStageListItem(req, 'terminal'));
        });
    }

    card.appendChild(list);
    return card;
}

function createPortfolioKpis() {
    const allRequests = AppState.requests;
    const totalCount = allRequests.length;

    const pmoCount = allRequests.filter(
        (r) => r.status === STATUS.PENDING && r.stage === STAGE.PMO
    ).length;
    const tecnicaCount = allRequests.filter(
        (r) => r.status === STATUS.PENDING && r.stage === STAGE.TECNICA
    ).length;
    const directorCount = allRequests.filter(
        (r) => r.status === STATUS.PENDING && r.stage === STAGE.DIRECTOR
    ).length;

    const highPriorityDirector = allRequests.filter(
        (r) => r.status === STATUS.PENDING && r.stage === STAGE.DIRECTOR && r.prioridad === 'alta'
    ).length;

    const approvedCount = allRequests.filter((r) => r.status === STATUS.APPROVED).length;

    const grid = document.createElement('div');
    grid.className = 'kpi-grid';

    grid.appendChild(createKpiCard({
        title: 'Total Solicitudes',
        value: totalCount,
        icon: 'folder_open',
        iconVariant: 'primary',
        trendIcon: 'trending_up',
        trendText: `${approvedCount} aprobada(s) a la fecha`,
        trendVariant: 'success'
    }));

    grid.appendChild(createKpiCard({
        title: 'Pendientes Revisión PMO',
        value: pmoCount,
        icon: 'pending_actions',
        iconVariant: 'danger',
        trendIcon: 'schedule',
        trendText: pmoCount === 1 ? 'Solicitud por clasificar' : 'Solicitudes por clasificar'
    }));

    grid.appendChild(createKpiCard({
        title: 'En Evaluación Financiera',
        value: tecnicaCount,
        icon: 'balance',
        iconVariant: 'info',
        trendIcon: 'rule',
        trendText: 'Análisis financiero y de riesgo'
    }));

    grid.appendChild(createKpiCard({
        title: 'Aprobación de Director',
        value: directorCount,
        icon: 'verified_user',
        iconVariant: 'warning',
        trendIcon: highPriorityDirector > 0 ? 'warning' : 'check_circle',
        trendText: highPriorityDirector > 0
            ? `${highPriorityDirector} de alta prioridad pendiente(s)`
            : 'Sin pendientes críticos',
        trendVariant: highPriorityDirector > 0 ? 'danger' : 'success'
    }));

    return grid;
}

function createKpiCard(options) {
    const card = document.createElement('div');
    card.className = 'kpi-card';

    const header = document.createElement('div');
    header.className = 'kpi-card__header';

    const titleEl = document.createElement('span');
    titleEl.className = 'kpi-card__title';
    titleEl.textContent = options.title;
    header.appendChild(titleEl);

    const iconWrap = document.createElement('div');
    iconWrap.className = `kpi-card__icon kpi-card__icon--${options.iconVariant || 'primary'}`;
    iconWrap.appendChild(createIcon(options.icon));
    header.appendChild(iconWrap);

    card.appendChild(header);

    const body = document.createElement('div');

    const value = document.createElement('div');
    value.className = 'kpi-card__value';
    value.textContent = String(options.value);
    body.appendChild(value);

    if (options.trendText) {
        const trend = document.createElement('div');
        trend.className = 'kpi-card__trend';
        if (options.trendVariant === 'success') {
            trend.classList.add('kpi-card__trend--success');
        } else if (options.trendVariant === 'danger') {
            trend.classList.add('kpi-card__trend--danger');
        }
        if (options.trendIcon) {
            trend.appendChild(createIcon(options.trendIcon));
        }
        const trendText = document.createElement('span');
        trendText.textContent = options.trendText;
        trend.appendChild(trendText);
        body.appendChild(trend);
    }

    card.appendChild(body);
    return card;
}

function createPortfolioTable() {
    const filtered = getFilteredRequests();
    const pageSize = AppState.pagination.pageSize;
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

    if (AppState.pagination.page > totalPages) {
        AppState.pagination.page = totalPages;
    }
    const currentPage = AppState.pagination.page;

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, filtered.length);
    const pageRequests = filtered.slice(startIndex, endIndex);

    const card = document.createElement('div');
    card.className = 'table-card';

    const header = document.createElement('div');
    header.className = 'table-card__header table-card__header--with-filters';

    const title = document.createElement('h3');
    title.className = 'table-card__title';
    title.textContent = 'Registro Activo de Portafolio';
    header.appendChild(title);

    header.appendChild(createPortfolioFilters());
    card.appendChild(header);

    const tableContainer = document.createElement('div');
    tableContainer.className = 'table-container';

    const table = document.createElement('table');
    table.className = 'data-table';

    table.appendChild(createTableHead([
        'ID Solicitud',
        'Nombre del Proyecto',
        'Solicitante',
        'Área',
        'Prioridad',
        'Estado',
        'Enviada',
        { text: 'Acciones', align: 'right' }
    ]));

    const tbody = document.createElement('tbody');

    if (pageRequests.length === 0) {
        const hasFilters = AppState.filters.area || AppState.filters.prioridad || AppState.filters.estado;
        const message = hasFilters
            ? 'No se encontraron solicitudes con los filtros aplicados.'
            : 'No hay solicitudes registradas.';
        tbody.appendChild(createEmptyState('inbox', message, 8));
    } else {
        pageRequests.forEach((req) => {
            tbody.appendChild(createPortfolioRow(req));
        });
    }

    table.appendChild(tbody);
    tableContainer.appendChild(table);
    card.appendChild(tableContainer);

    card.appendChild(createPaginationFooter(filtered.length, startIndex, endIndex, totalPages, currentPage));

    return card;
}

function createPortfolioFilters() {
    const filters = document.createElement('div');
    filters.className = 'table-filters';

    const areaSelect = createFilterSelect(
        'Área (Todas)',
        AREAS,
        AppState.filters.area,
        (value) => {
            AppState.filters.area = value;
            AppState.pagination.page = 1;
            renderDashboardAdmin();
        }
    );
    filters.appendChild(areaSelect);

    const prioridadSelect = createFilterSelect(
        'Prioridad (Todas)',
        PRIORIDADES,
        AppState.filters.prioridad,
        (value) => {
            AppState.filters.prioridad = value;
            AppState.pagination.page = 1;
            renderDashboardAdmin();
        }
    );
    filters.appendChild(prioridadSelect);

    const estadoChoices = [
        { value: STATUS.DRAFT, label: STATUS.DRAFT },
        { value: 'pmo', label: 'Revisión PMO' },
        { value: 'tecnica', label: 'Evaluación Financiera' },
        { value: 'director', label: 'Aprobación' },
        { value: STATUS.APPROVED, label: STATUS.APPROVED },
        { value: STATUS.REJECTED, label: STATUS.REJECTED },
        { value: STATUS.CHANGES, label: STATUS.CHANGES }
    ];
    const estadoSelect = createFilterSelect(
        'Estado (Todos)',
        estadoChoices,
        AppState.filters.estado,
        (value) => {
            AppState.filters.estado = value;
            AppState.pagination.page = 1;
            renderDashboardAdmin();
        }
    );
    filters.appendChild(estadoSelect);

    const hasAny = AppState.filters.area || AppState.filters.prioridad || AppState.filters.estado;
    if (hasAny) {
        const clearBtn = document.createElement('button');
        clearBtn.type = 'button';
        clearBtn.className = 'table-filters__clear';
        clearBtn.title = 'Limpiar filtros';
        clearBtn.setAttribute('aria-label', 'Limpiar filtros');
        clearBtn.appendChild(createIcon('filter_alt_off'));
        clearBtn.addEventListener('click', () => {
            AppState.filters = { area: '', prioridad: '', estado: '' };
            AppState.pagination.page = 1;
            renderDashboardAdmin();
        });
        filters.appendChild(clearBtn);
    }

    return filters;
}

function createFilterSelect(placeholder, choices, currentValue, onChange) {
    const select = document.createElement('select');
    select.className = 'table-filters__select';

    const placeholderOption = document.createElement('option');
    placeholderOption.value = '';
    placeholderOption.textContent = placeholder;
    select.appendChild(placeholderOption);

    choices.forEach((choice) => {
        const option = document.createElement('option');
        option.value = choice.value;
        option.textContent = choice.label;
        if (choice.value === currentValue) {
            option.selected = true;
        }
        select.appendChild(option);
    });

    if (!currentValue) {
        placeholderOption.selected = true;
    }

    select.addEventListener('change', (event) => {
        onChange(event.target.value);
    });

    return select;
}

function getFilteredRequests() {
    const { area, prioridad, estado } = AppState.filters;

    return AppState.requests
        .filter((req) => {
            if (area && req.area !== area) return false;
            if (prioridad && req.prioridad !== prioridad) return false;
            if (estado) {
                if (estado === 'pmo' || estado === 'tecnica' || estado === 'director') {
                    if (req.status !== STATUS.PENDING) return false;
                    if (req.stage !== estado) return false;
                } else if (req.status !== estado) {
                    return false;
                }
            }
            return true;
        })
        .slice()
        .sort((a, b) => b.date.localeCompare(a.date));
}

function createPortfolioRow(req) {
    const tr = document.createElement('tr');
    tr.classList.add('row--clickable');

    const tdId = document.createElement('td');
    tdId.className = 'request-id-cell';
    tdId.textContent = formatRequestId(req.id);
    tr.appendChild(tdId);

    const tdName = document.createElement('td');
    tdName.className = 'text-primary-color text-bold';
    tdName.textContent = req.title;
    tr.appendChild(tdName);

    const tdSponsor = document.createElement('td');
    tdSponsor.className = 'data-table__sponsor-col';
    tdSponsor.appendChild(createSponsorCell(req.applicant));
    tr.appendChild(tdSponsor);

    const tdArea = document.createElement('td');
    tdArea.textContent = getLabelFromValue(AREAS, req.area);
    tr.appendChild(tdArea);

    const tdPriority = document.createElement('td');
    tdPriority.appendChild(createPriorityIndicator(req.prioridad));
    tr.appendChild(tdPriority);

    const tdStatus = document.createElement('td');
    tdStatus.appendChild(createStatusBadgeForPortfolio(req));
    tr.appendChild(tdStatus);

    const tdDate = document.createElement('td');
    tdDate.className = 'text-subtle';
    tdDate.textContent = formatDate(req.date);
    tr.appendChild(tdDate);

    const tdActions = document.createElement('td');
    tdActions.classList.add('text-right');
    tdActions.appendChild(createIconButton('open_in_new', 'Ver detalle', (event) => {
        event.stopPropagation();
        navigateTo('detalle_solicitud', req.id);
    }));
    tr.appendChild(tdActions);

    tr.addEventListener('click', () => {
        navigateTo('detalle_solicitud', req.id);
    });

    return tr;
}

function createSponsorCell(email) {
    const cell = document.createElement('span');
    cell.className = 'sponsor-cell';

    const avatar = document.createElement('span');
    const avatarVariant = getAvatarVariant(email);
    avatar.className = `avatar avatar--${avatarVariant}`;
    avatar.textContent = getInitials(email);
    cell.appendChild(avatar);

    const name = document.createElement('span');
    name.className = 'sponsor-cell__name';
    name.textContent = formatApplicantName(email);
    name.title = email;
    cell.appendChild(name);

    return cell;
}

function getInitials(email) {
    if (!email) return '?';
    const name = email.split('@')[0];
    const parts = name.split(/[._\-+\s]+/).filter(Boolean);
    if (parts.length >= 2) {
        return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
}

function formatApplicantName(email) {
    if (!email) return '—';
    const name = email.split('@')[0];
    const parts = name.split(/[._\-+\s]+/).filter(Boolean);
    if (parts.length === 0) return email;
    return parts
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

function getAvatarVariant(email) {
    const variants = ['primary', 'secondary', 'tertiary', 'surface'];
    if (!email) return variants[0];
    let hash = 0;
    for (let i = 0; i < email.length; i += 1) {
        hash = (hash * 31 + email.charCodeAt(i)) & 0xffffffff;
    }
    return variants[Math.abs(hash) % variants.length];
}

function createPriorityIndicator(prioridad) {
    const wrap = document.createElement('span');
    wrap.className = 'priority-indicator';

    if (prioridad === 'alta') {
        wrap.classList.add('priority-indicator--high');
        wrap.appendChild(createIcon('keyboard_double_arrow_up'));
        const text = document.createElement('span');
        text.textContent = 'Alta';
        wrap.appendChild(text);
    } else if (prioridad === 'media') {
        wrap.classList.add('priority-indicator--medium');
        wrap.appendChild(createIcon('keyboard_arrow_up'));
        const text = document.createElement('span');
        text.textContent = 'Media';
        wrap.appendChild(text);
    } else if (prioridad === 'baja') {
        wrap.classList.add('priority-indicator--low');
        wrap.appendChild(createIcon('horizontal_rule'));
        const text = document.createElement('span');
        text.textContent = 'Baja';
        wrap.appendChild(text);
    } else {
        wrap.classList.add('priority-indicator--low');
        const text = document.createElement('span');
        text.textContent = '—';
        wrap.appendChild(text);
    }

    return wrap;
}

function createStatusBadgeForPortfolio(req) {
    if (req.status !== STATUS.PENDING) {
        return createBadge(req.status);
    }

    const badge = document.createElement('span');
    const stage = req.stage || STAGE.PMO;
    badge.className = `badge badge--stage-${stage}`;
    badge.textContent = STAGE_LABELS[stage] || req.status;
    return badge;
}

function createPaginationFooter(totalEntries, startIndex, endIndex, totalPages, currentPage) {
    const footer = document.createElement('div');
    footer.className = 'pagination';

    const info = document.createElement('div');
    if (totalEntries === 0) {
        info.textContent = 'Sin resultados para mostrar';
    } else {
        info.textContent = `Mostrando ${startIndex + 1} a ${endIndex} de ${totalEntries} solicitud(es)`;
    }
    footer.appendChild(info);

    if (totalPages > 1) {
        const controls = document.createElement('div');
        controls.className = 'pagination__controls';

        const prevBtn = createPaginationButton('chevron_left', null, currentPage === 1, () => {
            AppState.pagination.page = Math.max(1, currentPage - 1);
            renderDashboardAdmin();
        }, true);
        prevBtn.setAttribute('aria-label', 'Página anterior');
        controls.appendChild(prevBtn);

        const pageNumbers = buildPageNumbers(currentPage, totalPages);
        pageNumbers.forEach((item) => {
            if (item === '…') {
                const ellipsis = document.createElement('span');
                ellipsis.className = 'pagination__ellipsis';
                ellipsis.textContent = '…';
                controls.appendChild(ellipsis);
            } else {
                const isActive = item === currentPage;
                const pageBtn = createPaginationButton(null, String(item), false, () => {
                    AppState.pagination.page = item;
                    renderDashboardAdmin();
                }, false);
                if (isActive) {
                    pageBtn.classList.add('pagination__button--active');
                }
                controls.appendChild(pageBtn);
            }
        });

        const nextBtn = createPaginationButton('chevron_right', null, currentPage === totalPages, () => {
            AppState.pagination.page = Math.min(totalPages, currentPage + 1);
            renderDashboardAdmin();
        }, true);
        nextBtn.setAttribute('aria-label', 'Página siguiente');
        controls.appendChild(nextBtn);

        footer.appendChild(controls);
    }

    return footer;
}

function createPaginationButton(iconName, label, disabled, onClick, isArrow) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'pagination__button';
    if (isArrow) {
        button.classList.add('pagination__button--arrow');
    }
    if (disabled) {
        button.disabled = true;
    }
    if (iconName) {
        button.appendChild(createIcon(iconName));
    }
    if (label !== null && label !== undefined) {
        const text = document.createElement('span');
        text.textContent = label;
        button.appendChild(text);
    }
    if (typeof onClick === 'function') {
        button.addEventListener('click', onClick);
    }
    return button;
}

function buildPageNumbers(current, total) {
    if (total <= 7) {
        const list = [];
        for (let i = 1; i <= total; i += 1) list.push(i);
        return list;
    }

    const pages = new Set([1, total, current]);
    if (current - 1 >= 1) pages.add(current - 1);
    if (current + 1 <= total) pages.add(current + 1);

    const sorted = Array.from(pages).sort((a, b) => a - b);
    const result = [];
    for (let i = 0; i < sorted.length; i += 1) {
        if (i > 0 && sorted[i] - sorted[i - 1] > 1) {
            result.push('…');
        }
        result.push(sorted[i]);
    }
    return result;
}

function exportRequestsToCsv(requests) {
    if (!Array.isArray(requests) || requests.length === 0) {
        showNotification('No hay solicitudes para exportar con los filtros actuales.', 'info');
        return;
    }

    const headers = [
        'ID',
        'Título',
        'Solicitante',
        'Área',
        'Tipo de Proyecto',
        'Prioridad',
        'Estado',
        'Etapa',
        'Presupuesto (USD)',
        'Fecha de Creación',
        'Fecha Estimada de Inicio'
    ];

    const escape = (value) => {
        const str = value === null || value === undefined ? '' : String(value);
        if (/[",\n;]/.test(str)) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };

    const lines = [headers.map(escape).join(',')];

    requests.forEach((req) => {
        const isPending = req.status === STATUS.PENDING;
        const stageLabel = isPending ? STAGE_LABELS[req.stage] || '' : '';
        const row = [
            formatRequestId(req.id),
            req.title,
            req.applicant,
            getLabelFromValue(AREAS, req.area),
            getLabelFromValue(TIPOS_PROYECTO, req.tipoProyecto),
            getLabelFromValue(PRIORIDADES, req.prioridad),
            req.status,
            stageLabel,
            req.presupuestoEstimado || '',
            req.date || '',
            req.fechaEstimadaInicio || ''
        ];
        lines.push(row.map(escape).join(','));
    });

    const csv = '\ufeff' + lines.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    const today = new Date().toISOString().split('T')[0];
    link.download = `portafolio-pmo-${today}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showNotification(`Se exportaron ${requests.length} solicitud(es) en formato CSV.`, 'success');
}

/* ---------------------- Helpers de listado de etapas -------------------- */

function formatRelativeDate(dateString) {
    if (!dateString) return '—';
    const parts = dateString.split('-');
    if (parts.length !== 3) return dateString;
    const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffMs = today.getTime() - date.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Enviada hoy';
    if (diffDays === 1) return 'Enviada hace 1 día';
    if (diffDays > 1 && diffDays < 30) return `Enviada hace ${diffDays} días`;
    if (diffDays >= 30 && diffDays < 365) {
        const months = Math.round(diffDays / 30);
        return months === 1 ? 'Enviada hace 1 mes' : `Enviada hace ${months} meses`;
    }
    if (diffDays >= 365) {
        const years = Math.round(diffDays / 365);
        return years === 1 ? 'Enviada hace 1 año' : `Enviada hace ${years} años`;
    }
    return `Programada para ${formatDate(dateString)}`;
}

function getPriorityBadge(prioridad) {
    const badge = document.createElement('span');
    badge.className = 'badge';
    let label = 'Estándar';
    let modifier = 'badge--priority-medium';
    if (prioridad === 'alta') {
        label = 'Alta Prioridad';
        modifier = 'badge--priority-high';
    } else if (prioridad === 'media') {
        label = 'Prioridad Media';
        modifier = 'badge--priority-medium';
    } else if (prioridad === 'baja') {
        label = 'Prioridad Baja';
        modifier = 'badge--priority-low';
    }
    badge.classList.add(modifier);
    badge.textContent = label;
    return badge;
}

function formatBudgetShort(value) {
    const num = Number(value);
    if (!Number.isFinite(num) || num <= 0) return '—';
    if (num >= 1000000) {
        return `$${(num / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
    }
    if (num >= 1000) {
        return `$${(num / 1000).toFixed(0)}K`;
    }
    return formatCurrency(num);
}

function __placeholder__panelRemoved__start() {
    const sortByDate = (arr) => [...arr].sort((a, b) => b.date.localeCompare(a.date));

    const pmoReqs      = sortByDate(AppState.requests.filter((r) => r.status === STATUS.PENDING && (r.stage || STAGE.PMO) === STAGE.PMO));
    const tecnicaReqs  = sortByDate(AppState.requests.filter((r) => r.status === STATUS.PENDING && r.stage === STAGE.TECNICA));
    const directorReqs = sortByDate(AppState.requests.filter((r) => r.status === STATUS.PENDING && r.stage === STAGE.DIRECTOR));
    const approvedReqs = sortByDate(AppState.requests.filter((r) => r.status === STATUS.APPROVED));

    const allReviewable = [...pmoReqs, ...tecnicaReqs, ...directorReqs, ...approvedReqs];
    const totalPending  = pmoReqs.length + tecnicaReqs.length + directorReqs.length;

    let currentSelectedId = selectedId !== undefined && selectedId !== null
        ? parseInt(selectedId, 10)
        : null;

    if (currentSelectedId === null || !allReviewable.find((r) => r.id === currentSelectedId)) {
        currentSelectedId = allReviewable.length > 0 ? allReviewable[0].id : null;
    }

    const panel = document.createElement('div');
    panel.className = 'review-panel';

    /* ---- Columna izquierda: lista agrupada por etapa ---- */
    const listSection = document.createElement('section');
    listSection.className = 'review-list';

    const listHeader = document.createElement('div');
    listHeader.className = 'review-list__header';
    const listTitles = document.createElement('div');
    const listTitle = document.createElement('h1');
    listTitle.className = 'review-list__title';
    listTitle.textContent = 'Panel de Aprobaciones';
    listTitles.appendChild(listTitle);
    const listSubtitle = document.createElement('p');
    listSubtitle.className = 'review-list__subtitle';
    listSubtitle.textContent = totalPending === 0
        ? 'Sin solicitudes pendientes de decisión'
        : `${totalPending} solicitud(es) pendiente(s) de decisión`;
    listTitles.appendChild(listSubtitle);
    listHeader.appendChild(listTitles);
    listSection.appendChild(listHeader);

    const stageGroups = [
        { label: STAGE_LABELS[STAGE.PMO],      icon: 'engineering',   reqs: pmoReqs      },
        { label: STAGE_LABELS[STAGE.TECNICA],  icon: 'balance',       reqs: tecnicaReqs  },
        { label: STAGE_LABELS[STAGE.DIRECTOR], icon: 'verified_user', reqs: directorReqs },
        { label: 'Aprobadas',                  icon: 'verified',      reqs: approvedReqs }
    ];

    stageGroups.forEach(({ label, icon, reqs }) => {
        listSection.appendChild(
            createReviewStageGroup(label, icon, reqs, currentSelectedId)
        );
    });

    panel.appendChild(listSection);

    /* ---- Columna derecha: preview de la solicitud seleccionada ---- */
    const previewSection = document.createElement('section');
    previewSection.className = 'review-preview';

    const selectedRequest = allReviewable.find((r) => r.id === currentSelectedId);

    if (!selectedRequest) {
        const empty = document.createElement('div');
        empty.className = 'review-preview__empty';
        empty.appendChild(createIcon('task_alt'));
        const emptyTitle = document.createElement('p');
        emptyTitle.className = 'review-preview__empty-title';
        emptyTitle.textContent = '¡Todo al día!';
        empty.appendChild(emptyTitle);
        const emptyText = document.createElement('p');
        emptyText.className = 'text-body-sm';
        emptyText.textContent = 'No hay solicitudes que revisar por el momento.';
        empty.appendChild(emptyText);
        previewSection.appendChild(empty);
    } else {
        previewSection.appendChild(createReviewPreviewHeader(selectedRequest));
        previewSection.appendChild(createReviewPreviewBody(selectedRequest));
        if (selectedRequest.status === STATUS.APPROVED) {
            previewSection.appendChild(createReviewReadOnlyFooter());
        } else {
            previewSection.appendChild(createReviewActionsFooter(selectedRequest));
        }
    }

    panel.appendChild(previewSection);
    canvas.appendChild(panel);
}

function createReviewStageGroup(label, icon, reqs, currentSelectedId) {
    const group = document.createElement('div');
    group.className = 'review-stage-group';

    const header = document.createElement('div');
    header.className = 'review-stage-header';
    header.appendChild(createIcon(icon));

    const labelEl = document.createElement('span');
    labelEl.className = 'review-stage-header__label';
    labelEl.textContent = label;
    header.appendChild(labelEl);

    const countEl = document.createElement('span');
    countEl.className = 'review-stage-header__count';
    countEl.textContent = String(reqs.length);
    header.appendChild(countEl);

    group.appendChild(header);

    if (reqs.length === 0) {
        const empty = document.createElement('p');
        empty.className = 'review-stage-empty';
        empty.textContent = 'Sin solicitudes en esta etapa';
        group.appendChild(empty);
    } else {
        reqs.forEach((req) => {
            group.appendChild(createReviewListItem(req, req.id === currentSelectedId));
        });
    }

    return group;
}

function createReviewListItem(req, isActive) {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'review-item';
    if (isActive) item.classList.add('review-item--active');

    const top = document.createElement('div');
    top.className = 'review-item__top';

    const idChip = document.createElement('span');
    idChip.className = 'review-item__id';
    idChip.textContent = formatRequestId(req.id);
    top.appendChild(idChip);

    top.appendChild(getPriorityBadge(req.prioridad));
    item.appendChild(top);

    const title = document.createElement('h3');
    title.className = 'review-item__title';
    title.textContent = req.title;
    item.appendChild(title);

    const description = document.createElement('p');
    description.className = 'review-item__description';
    description.textContent = req.necesidad || 'Sin descripción registrada.';
    item.appendChild(description);

    const footer = document.createElement('div');
    footer.className = 'review-item__footer';

    const dateEl = document.createElement('span');
    dateEl.className = 'review-item__date';
    dateEl.appendChild(createIcon('schedule'));
    const dateText = document.createElement('span');
    dateText.textContent = formatRelativeDate(req.date);
    dateEl.appendChild(dateText);
    footer.appendChild(dateEl);

    const budget = document.createElement('span');
    budget.className = 'review-item__budget';
    budget.textContent = formatBudgetShort(req.presupuestoEstimado);
    footer.appendChild(budget);

    item.appendChild(footer);

    item.addEventListener('click', () => renderPanelAprobacion(req.id));
    return item;
}

function createReviewPreviewHeader(req) {
    const header = document.createElement('header');
    header.className = 'review-preview__header';

    const topline = document.createElement('div');
    topline.className = 'review-preview__topline';

    const titles = document.createElement('div');

    const meta = document.createElement('div');
    meta.className = 'review-preview__meta';

    const idChip = document.createElement('span');
    idChip.className = 'review-preview__meta-chip';
    idChip.textContent = formatRequestId(req.id);
    meta.appendChild(idChip);

    const sponsor = document.createElement('span');
    sponsor.className = 'review-preview__sponsor';
    sponsor.appendChild(createIcon('account_circle'));
    const sponsorText = document.createElement('span');
    sponsorText.textContent = `Solicitante: ${req.applicant}`;
    sponsor.appendChild(sponsorText);
    meta.appendChild(sponsor);

    titles.appendChild(meta);

    const title = document.createElement('h2');
    title.className = 'review-preview__title';
    title.textContent = req.title;
    titles.appendChild(title);

    topline.appendChild(titles);

    const actions = document.createElement('div');
    const detailBtn = createIconButton('open_in_new', 'Ver detalle completo', () => {
        navigateTo('detalle_solicitud', req.id);
    });
    actions.appendChild(detailBtn);
    topline.appendChild(actions);

    header.appendChild(topline);

    const stats = document.createElement('div');
    stats.className = 'review-preview__stats';

    stats.appendChild(createReviewStat(
        'Presupuesto Est.',
        formatCurrency(req.presupuestoEstimado)
    ));
    stats.appendChild(createReviewStat(
        'Inicio Estimado',
        formatDate(req.fechaEstimadaInicio)
    ));
    stats.appendChild(createReviewStat(
        'Nivel de Riesgo',
        getRiskLabel(req.prioridad),
        getRiskIcon(req.prioridad),
        getRiskValueClass(req.prioridad)
    ));
    stats.appendChild(createReviewStat(
        'Tipo de Proyecto',
        getLabelFromValue(TIPOS_PROYECTO, req.tipoProyecto)
    ));

    header.appendChild(stats);
    return header;
}

function createReviewStat(label, value, iconName, valueModifier) {
    const stat = document.createElement('div');
    stat.className = 'review-stat';

    const labelEl = document.createElement('span');
    labelEl.className = 'review-stat__label';
    labelEl.textContent = label;
    stat.appendChild(labelEl);

    const valueEl = document.createElement('div');
    valueEl.className = 'review-stat__value';
    if (valueModifier) {
        valueEl.classList.add(valueModifier);
    }
    if (iconName) {
        valueEl.appendChild(createIcon(iconName));
    }
    const valueText = document.createElement('span');
    valueText.textContent = value || '—';
    valueEl.appendChild(valueText);

    stat.appendChild(valueEl);
    return stat;
}

function getRiskLabel(prioridad) {
    if (prioridad === 'alta') return 'Alto';
    if (prioridad === 'media') return 'Medio';
    if (prioridad === 'baja') return 'Bajo';
    return 'Sin definir';
}

function getRiskIcon(prioridad) {
    if (prioridad === 'alta') return 'warning';
    if (prioridad === 'media') return 'info';
    return 'shield';
}

function getRiskValueClass(prioridad) {
    if (prioridad === 'alta') return 'review-stat__value--danger';
    if (prioridad === 'media') return 'review-stat__value--secondary';
    return '';
}

function createReviewPreviewBody(req) {
    const body = document.createElement('div');
    body.className = 'review-preview__body';

    body.appendChild(createReviewSection(
        'description',
        'Resumen Ejecutivo',
        req.necesidad || 'No se registró un resumen para esta solicitud.'
    ));

    const bento = document.createElement('div');
    bento.className = 'review-bento';
    bento.appendChild(createFinancialSection(req));
    bento.appendChild(createStrategicSection(req));
    body.appendChild(bento);

    body.appendChild(createReviewSection(
        'insights',
        'Impacto Esperado',
        req.impacto || 'No se registró el impacto esperado.'
    ));

    if (req.comments && req.comments.length > 0) {
        body.appendChild(createReviewCommentsSection(req));
    }

    return body;
}

function createReviewSection(iconName, title, text) {
    const section = document.createElement('section');
    section.className = 'review-section';

    const titleEl = document.createElement('h3');
    titleEl.className = 'review-section__title';
    titleEl.appendChild(createIcon(iconName));
    const titleText = document.createElement('span');
    titleText.textContent = title;
    titleEl.appendChild(titleText);
    section.appendChild(titleEl);

    const paragraphs = String(text).split(/\n{2,}/);
    paragraphs.forEach((paragraph) => {
        const p = document.createElement('p');
        p.className = 'review-section__text';
        p.textContent = paragraph;
        section.appendChild(p);
    });

    return section;
}

function createFinancialSection(req) {
    const section = document.createElement('section');
    section.className = 'review-section';

    const titleEl = document.createElement('h3');
    titleEl.className = 'review-section__title';
    titleEl.appendChild(createIcon('payments'));
    const titleText = document.createElement('span');
    titleText.textContent = 'Impacto Financiero';
    titleEl.appendChild(titleText);
    section.appendChild(titleEl);

    const total = Number(req.presupuestoEstimado) || 0;
    const capex = Math.round(total * 0.65);
    const opex = total - capex;
    const capexPct = total > 0 ? (capex / total) * 100 : 0;
    const opexPct = total > 0 ? (opex / total) * 100 : 0;

    section.appendChild(createBudgetRow('CAPEX (Año 1)', formatCurrency(capex), capexPct, 'review-bento__bar-fill--primary'));
    section.appendChild(createBudgetRow('OPEX de Transición', formatCurrency(opex), opexPct, 'review-bento__bar-fill--secondary'));

    const kpi = document.createElement('div');
    kpi.className = 'review-bento__kpi';
    const kpiLabel = document.createElement('span');
    kpiLabel.className = 'review-stat__label';
    kpiLabel.textContent = 'Presupuesto Total Estimado';
    kpi.appendChild(kpiLabel);
    const kpiValue = document.createElement('div');
    kpiValue.className = 'review-stat__value';
    kpiValue.textContent = formatCurrency(total);
    kpi.appendChild(kpiValue);
    section.appendChild(kpi);

    return section;
}

function createBudgetRow(label, value, percent, fillModifier) {
    const row = document.createElement('div');
    row.className = 'review-bento__row';

    const head = document.createElement('div');
    head.className = 'review-bento__row-head';

    const labelEl = document.createElement('span');
    labelEl.textContent = label;
    head.appendChild(labelEl);

    const valueEl = document.createElement('span');
    valueEl.className = 'review-bento__row-value';
    valueEl.textContent = value;
    head.appendChild(valueEl);

    row.appendChild(head);

    const bar = document.createElement('div');
    bar.className = 'review-bento__bar';
    const fill = document.createElement('div');
    fill.className = `review-bento__bar-fill ${fillModifier}`;
    fill.style.width = `${Math.max(0, Math.min(100, percent))}%`;
    bar.appendChild(fill);
    row.appendChild(bar);

    return row;
}

function createStrategicSection(req) {
    const section = document.createElement('section');
    section.className = 'review-section';

    const titleEl = document.createElement('h3');
    titleEl.className = 'review-section__title';
    titleEl.appendChild(createIcon('flag'));
    const titleText = document.createElement('span');
    titleText.textContent = 'Alineación Estratégica';
    titleEl.appendChild(titleText);
    section.appendChild(titleEl);

    const list = document.createElement('ul');
    list.className = 'review-bento__list';

    const items = [
        {
            title: `Área solicitante: ${getLabelFromValue(AREAS, req.area)}`,
            sub: 'Respalda las prioridades del área usuaria.'
        },
        {
            title: `Tipo de proyecto: ${getLabelFromValue(TIPOS_PROYECTO, req.tipoProyecto)}`,
            sub: 'Clasificación de iniciativa dentro del portafolio.'
        },
        {
            title: `Prioridad sugerida: ${getLabelFromValue(PRIORIDADES, req.prioridad)}`,
            sub: 'Define la urgencia de atención por parte del comité.'
        }
    ];

    items.forEach((item) => {
        const li = document.createElement('li');
        li.className = 'review-bento__item';
        li.appendChild(createIcon('check_circle'));
        const content = document.createElement('div');
        const title = document.createElement('span');
        title.className = 'review-bento__item-title';
        title.textContent = item.title;
        content.appendChild(title);
        const sub = document.createElement('span');
        sub.className = 'review-bento__item-sub';
        sub.textContent = item.sub;
        content.appendChild(sub);
        li.appendChild(content);
        list.appendChild(li);
    });

    section.appendChild(list);
    return section;
}

function createReviewCommentsSection(req) {
    const section = document.createElement('section');
    section.className = 'review-section';

    const titleEl = document.createElement('h3');
    titleEl.className = 'review-section__title';
    titleEl.appendChild(createIcon('forum'));
    const titleText = document.createElement('span');
    titleText.textContent = `Historial de Comentarios (${req.comments.length})`;
    titleEl.appendChild(titleText);
    section.appendChild(titleEl);

    const comments = document.createElement('div');
    comments.className = 'comments';
    req.comments
        .slice()
        .sort((a, b) => a.date.localeCompare(b.date))
        .forEach((comment) => {
            const commentEl = document.createElement('div');
            commentEl.className = 'comment';

            const header = document.createElement('div');
            header.className = 'comment__header';
            const author = document.createElement('span');
            author.className = 'comment__author';
            author.textContent = comment.author;
            header.appendChild(author);
            const date = document.createElement('span');
            date.className = 'comment__date';
            date.textContent = formatDate(comment.date);
            header.appendChild(date);
            commentEl.appendChild(header);

            const text = document.createElement('p');
            text.className = 'comment__text';
            text.textContent = comment.text;
            commentEl.appendChild(text);

            comments.appendChild(commentEl);
        });

    section.appendChild(comments);
    return section;
}

function createReviewActionsFooter(req) {
    const footer = document.createElement('footer');
    footer.className = 'review-actions-footer';

    const commentField = createFormField({
        id: `admin-comment-${req.id}`,
        label: 'Comentarios del Administrador',
        type: 'textarea',
        rows: 2,
        placeholder: 'Justifique la decisión (obligatorio para rechazos o solicitudes de ajuste).'
    });
    footer.appendChild(commentField.group);

    const currentStage  = req.stage || STAGE.PMO;
    const isLastStage   = currentStage === STAGE.DIRECTOR;
    const nextStage     = isLastStage ? null : STAGE_ORDER[STAGE_ORDER.indexOf(currentStage) + 1];

    const buttons = document.createElement('div');
    buttons.className = 'review-actions-footer__buttons';

    const addComment = (text) => {
        if (!req.comments) req.comments = [];
        req.comments.push({
            author: AppState.currentUser.email,
            date: new Date().toISOString().split('T')[0],
            text
        });
    };

    const handleApprove = () => {
        const commentText = commentField.input.value.trim();

        if (isLastStage) {
            addComment(commentText || `Solicitud aprobada por ${AppState.currentUser.email}.`);
            req.status = STATUS.APPROVED;
            saveState();
            showNotification(`Solicitud ${formatRequestId(req.id)} aprobada correctamente.`, 'success');
        } else {
            addComment(commentText || `Fase ${STAGE_LABELS[currentStage]} aprobada. Avanza a ${STAGE_LABELS[nextStage]}.`);
            req.stage = nextStage;
            saveState();
            showNotification(`Solicitud avanzada a ${STAGE_LABELS[nextStage]}.`, 'success');
        }

        renderPanelAprobacion();
    };

    const handleChanges = () => {
        const commentText = commentField.input.value.trim();
        if (commentText.length < 3) {
            showFieldError(commentField.input, 'Debe incluir un comentario que indique los ajustes requeridos.');
            showNotification('Indique el motivo antes de continuar.', 'error');
            return;
        }
        addComment(commentText);
        req.status = STATUS.CHANGES;
        saveState();
        showNotification(`Se solicitaron ajustes para ${formatRequestId(req.id)}.`, 'info');
        renderPanelAprobacion();
    };

    const handleReject = () => {
        const commentText = commentField.input.value.trim();
        if (commentText.length < 3) {
            showFieldError(commentField.input, 'Debe incluir un comentario que justifique el rechazo.');
            showNotification('Indique el motivo antes de continuar.', 'error');
            return;
        }
        addComment(commentText);
        req.status = STATUS.REJECTED;
        saveState();
        showNotification(`Solicitud ${formatRequestId(req.id)} rechazada.`, 'error');
        renderPanelAprobacion();
    };

    const approveBtnLabel = isLastStage
        ? 'Aprobar Solicitud'
        : `Aprobar ${STAGE_LABELS[currentStage]}`;

    const rejectBtn  = createButton('Rechazar', 'danger', 'cancel', handleReject);
    const changesBtn = createButton('Solicitar Ajustes', 'secondary', 'edit_note', handleChanges);
    const approveBtn = createButton(approveBtnLabel, 'primary', 'check', handleApprove);

    buttons.appendChild(rejectBtn);
    buttons.appendChild(changesBtn);
    buttons.appendChild(approveBtn);

    footer.appendChild(buttons);
    return footer;
}

function createReviewReadOnlyFooter() {
    const footer = document.createElement('footer');
    footer.className = 'review-actions-footer';

    const notice = document.createElement('p');
    notice.className = 'text-body-sm text-outline';
    notice.textContent = 'Esta solicitud fue aprobada y está lista para ejecución en el portafolio.';
    footer.appendChild(notice);

    return footer;
}

/* ----------------------------- Métricas --------------------------------- */

const CHART_PALETTE = ['#6366f1','#0ea5e9','#10b981','#f59e0b','#ef4444','#8b5cf6','#14b8a6','#ec4899'];
const STATUS_CHART_COLORS = { approved:'#10b981', pending:'#6366f1', changes:'#f59e0b', rejected:'#ef4444', draft:'#94a3b8' };

/* ---- SVG helpers ---- */
function _svgEl(tag, attrs) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    if (attrs) Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, String(v)));
    return el;
}
function _svgTxt(tag, attrs, text) { const el = _svgEl(tag, attrs); el.textContent = text; return el; }
function _polarXY(cx, cy, r, deg) {
    const rad = (deg - 90) * Math.PI / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}
function _donutPath(cx, cy, R, r, a0, a1) {
    const f = n => n.toFixed(2);
    const o1 = _polarXY(cx, cy, R, a0), o2 = _polarXY(cx, cy, R, a1);
    const i1 = _polarXY(cx, cy, r, a1), i2 = _polarXY(cx, cy, r, a0);
    const lg = (a1 - a0) > 180 ? 1 : 0;
    return `M${f(o1.x)},${f(o1.y)} A${R},${R} 0 ${lg} 1 ${f(o2.x)},${f(o2.y)} L${f(i1.x)},${f(i1.y)} A${r},${r} 0 ${lg} 0 ${f(i2.x)},${f(i2.y)} Z`;
}

/* ---- Tooltip ---- */
let _chartTip = null;
function _getTip() {
    if (!_chartTip) {
        _chartTip = document.createElement('div');
        _chartTip.className = 'metricas-tooltip';
        document.body.appendChild(_chartTip);
    }
    return _chartTip;
}
function _showTip(e, lines) {
    const t = _getTip();
    while (t.firstChild) t.removeChild(t.firstChild);
    lines.forEach((line, i) => {
        const el = document.createElement(i === 0 ? 'strong' : 'span');
        el.textContent = line;
        t.appendChild(el);
    });
    t.style.display = 'flex';
    _moveTip(e);
}
function _moveTip(e) {
    const t = _getTip();
    t.style.left = (e.clientX + 14) + 'px';
    t.style.top = Math.max(8, e.clientY - 44) + 'px';
}
function _hideTip() { _getTip().style.display = 'none'; }

function _chartCard(title, subtitle) {
    const card = document.createElement('div');
    card.className = 'chart-card';
    const h3 = document.createElement('h3');
    h3.className = 'chart-card__title';
    h3.textContent = title;
    card.appendChild(h3);
    if (subtitle) {
        const p = document.createElement('p');
        p.className = 'chart-card__subtitle';
        p.textContent = subtitle;
        card.appendChild(p);
    }
    return card;
}

/* ---- renderMetricas ---- */
function renderMetricas() {
    AppState.currentView = 'metricas';
    const canvas = createDashboardLayout('metricas');
    canvas.appendChild(createPageHeader(
        'Métricas y Reportes',
        'Indicadores clave de desempeño del portafolio de proyectos.'
    ));

    const all      = AppState.requests;
    const total    = all.length;
    const approved = all.filter((r) => r.status === STATUS.APPROVED);
    const pending  = all.filter((r) => r.status === STATUS.PENDING);
    const rejected = all.filter((r) => r.status === STATUS.REJECTED);
    const changes  = all.filter((r) => r.status === STATUS.CHANGES);
    const draft    = all.filter((r) => r.status === STATUS.DRAFT);

    const totalBudget    = all.reduce((s, r) => s + Number(r.presupuestoEstimado || 0), 0);
    const approvedBudget = approved.reduce((s, r) => s + Number(r.presupuestoEstimado || 0), 0);
    const pendingBudget  = pending.reduce((s, r) => s + Number(r.presupuestoEstimado || 0), 0);
    const approvalRate   = total > 0 ? Math.round((approved.length / total) * 100) : 0;

    /* ── KPI cards ─────────────────────────────────────────────── */
    const kpiGrid = document.createElement('div');
    kpiGrid.className = 'metricas-kpi-grid';
    [
        { label: 'Total Solicitudes',    value: String(total),                     icon: 'folder_copy',     sub: `${draft.length} en borrador`,   color: '#6366f1' },
        { label: 'Presupuesto Total',    value: formatBudgetShort(totalBudget),    icon: 'payments',        sub: 'Suma global del portafolio',    color: '#0ea5e9' },
        { label: 'Presupuesto Aprobado', value: formatBudgetShort(approvedBudget), icon: 'account_balance', sub: `${approved.length} proyecto(s)`, color: '#10b981' },
        { label: 'Tasa de Aprobación',   value: `${approvalRate}%`,               icon: 'percent',         sub: 'Sobre solicitudes totales',     color: '#f59e0b' },
        { label: 'En Revisión',          value: String(pending.length),            icon: 'hourglass_top',   sub: formatBudgetShort(pendingBudget), color: '#8b5cf6' },
        { label: 'Req. Cambios',         value: String(changes.length),            icon: 'edit_note',       sub: `${rejected.length} rechazada(s)`, color: '#ef4444' }
    ].forEach((kpi) => kpiGrid.appendChild(createMetricaKPICard(kpi)));
    canvas.appendChild(kpiGrid);

    /* ── Fila 2: Donut estado + Barras presupuesto por área ─────── */
    const row2 = document.createElement('div');
    row2.className = 'charts-grid';
    row2.appendChild(createMetricasDonut(
        'Distribución por Estado',
        'Proporción de solicitudes según su estado actual',
        [
            { label: 'Aprobadas',    value: approved.length, color: STATUS_CHART_COLORS.approved },
            { label: 'En Revisión',  value: pending.length,  color: STATUS_CHART_COLORS.pending  },
            { label: 'Req. Cambios', value: changes.length,  color: STATUS_CHART_COLORS.changes  },
            { label: 'Rechazadas',   value: rejected.length, color: STATUS_CHART_COLORS.rejected },
            { label: 'Borradores',   value: draft.length,    color: STATUS_CHART_COLORS.draft    }
        ].filter((d) => d.value > 0),
        total
    ));
    row2.appendChild(createMetricasHBars(
        'Presupuesto por Área',
        'Inversión total solicitada por unidad de negocio',
        AREAS.map((area, i) => ({
            label: area.label,
            value: all.filter((r) => r.area === area.value)
                      .reduce((s, r) => s + Number(r.presupuestoEstimado || 0), 0),
            color: CHART_PALETTE[i % CHART_PALETTE.length]
        })).filter((d) => d.value > 0).sort((a, b) => b.value - a.value),
        formatBudgetShort,
        formatCurrency
    ));
    canvas.appendChild(row2);

    /* ── Fila 3: Barras verticales tipo proyecto + Donut prioridad ── */
    const row3 = document.createElement('div');
    row3.className = 'charts-grid';
    row3.appendChild(createMetricasVBars(
        'Solicitudes por Tipo de Proyecto',
        'Número de iniciativas clasificadas por categoría',
        TIPOS_PROYECTO.map((t, i) => ({
            label:     t.label.split(' ')[0],
            fullLabel: t.label,
            value:     all.filter((r) => r.tipoProyecto === t.value).length,
            color:     CHART_PALETTE[i % CHART_PALETTE.length]
        })).filter((d) => d.value > 0)
    ));
    row3.appendChild(createMetricasDonut(
        'Distribución por Prioridad',
        'Clasificación de iniciativas según nivel de urgencia',
        [
            { label: 'Alta',  value: all.filter((r) => r.prioridad === 'alta').length,  color: '#ef4444' },
            { label: 'Media', value: all.filter((r) => r.prioridad === 'media').length, color: '#f59e0b' },
            { label: 'Baja',  value: all.filter((r) => r.prioridad === 'baja').length,  color: '#10b981' }
        ].filter((d) => d.value > 0),
        total
    ));
    canvas.appendChild(row3);

    /* ── Fila 4: Ranking de mayor presupuesto ────────────────────── */
    canvas.appendChild(createMetricasTopTable(all));
}

/* ---- KPI card ---- */
function createMetricaKPICard({ label, value, icon, sub, color }) {
    const card = document.createElement('div');
    card.className = 'chart-card metricas-kpi-card';
    card.style.color = color;
    card.style.borderTopColor = color;

    const iconWrap = document.createElement('div');
    iconWrap.className = 'metricas-kpi-card__icon';
    iconWrap.appendChild(createIcon(icon));
    card.appendChild(iconWrap);

    const valueEl = document.createElement('div');
    valueEl.className = 'metricas-kpi-card__value';
    valueEl.style.color = 'var(--color-on-surface)';
    valueEl.textContent = value;
    card.appendChild(valueEl);

    const labelEl = document.createElement('div');
    labelEl.className = 'metricas-kpi-card__label';
    card.appendChild(labelEl);
    labelEl.textContent = label;

    const subEl = document.createElement('div');
    subEl.className = 'metricas-kpi-card__sub';
    subEl.textContent = sub;
    card.appendChild(subEl);

    return card;
}

/* ---- Donut SVG chart ---- */
function createMetricasDonut(title, subtitle, data, total) {
    const card = _chartCard(title, subtitle);
    if (!data.length || !total) {
        const empty = document.createElement('p');
        empty.className = 'comments__empty';
        empty.textContent = 'Sin datos suficientes.';
        card.appendChild(empty);
        return card;
    }

    const cx = 100, cy = 100, R = 84, r = 56;
    const svg = _svgEl('svg', { viewBox: '0 0 200 200', width: '100%', height: '200' });

    let startAngle = 0;
    data.forEach((item) => {
        const sweep = Math.max(2, (item.value / total) * 354);
        const endAngle = startAngle + sweep;
        const path = _svgEl('path', {
            d: _donutPath(cx, cy, R, r, startAngle, endAngle),
            fill: item.color,
            style: 'cursor:pointer; transition: opacity 0.2s;'
        });
        path.addEventListener('mouseenter', (e) => {
            path.style.opacity = '0.78';
            const pct = Math.round((item.value / total) * 100);
            _showTip(e, [item.label, `${item.value} solicitudes · ${pct}%`]);
        });
        path.addEventListener('mousemove', _moveTip);
        path.addEventListener('mouseleave', () => { path.style.opacity = '1'; _hideTip(); });
        svg.appendChild(path);
        startAngle = endAngle + 2;
    });

    svg.appendChild(_svgTxt('text', {
        x: cx, y: cx - 6,
        'text-anchor': 'middle', 'dominant-baseline': 'auto',
        'font-size': '28', 'font-weight': '800', fill: '#1e1b4b'
    }, String(total)));
    svg.appendChild(_svgTxt('text', {
        x: cx, y: cy + 16,
        'text-anchor': 'middle',
        'font-size': '10', fill: '#6b7280'
    }, 'solicitudes'));
    card.appendChild(svg);

    const legend = document.createElement('div');
    legend.className = 'metricas-legend';
    data.forEach((item) => {
        const li = document.createElement('div');
        li.className = 'metricas-legend__item';
        const dot = document.createElement('span');
        dot.className = 'metricas-legend__dot';
        dot.style.backgroundColor = item.color;
        li.appendChild(dot);
        const txt = document.createElement('span');
        const pct = Math.round((item.value / total) * 100);
        txt.textContent = `${item.label}: ${item.value} (${pct}%)`;
        li.appendChild(txt);
        legend.appendChild(li);
    });
    card.appendChild(legend);
    return card;
}

/* ---- Horizontal animated bars ---- */
function createMetricasHBars(title, subtitle, data, formatShort, formatFull) {
    const card = _chartCard(title, subtitle);
    if (!data.length) {
        const empty = document.createElement('p');
        empty.className = 'comments__empty';
        empty.textContent = 'Sin datos suficientes.';
        card.appendChild(empty);
        return card;
    }

    const maxVal = data[0].value;
    const wrap = document.createElement('div');
    wrap.className = 'metricas-hbars';

    data.forEach((item, i) => {
        const row = document.createElement('div');
        row.className = 'metricas-hbar__row';

        const labelEl = document.createElement('span');
        labelEl.className = 'metricas-hbar__label';
        const words = item.label.split(' ');
        labelEl.textContent = words.length > 2 ? words.slice(0, 2).join(' ') + '.' : item.label;
        labelEl.title = item.label;
        row.appendChild(labelEl);

        const track = document.createElement('div');
        track.className = 'metricas-hbar__track';
        const fill = document.createElement('div');
        fill.className = 'metricas-hbar__fill';
        fill.style.backgroundColor = item.color;
        track.appendChild(fill);
        row.appendChild(track);

        const valEl = document.createElement('span');
        valEl.className = 'metricas-hbar__value';
        valEl.textContent = formatShort ? formatShort(item.value) : String(item.value);
        row.appendChild(valEl);

        [fill, track].forEach((el) => {
            el.addEventListener('mouseenter', (e) => _showTip(e, [item.label, formatFull ? formatFull(item.value) : String(item.value)]));
            el.addEventListener('mousemove', _moveTip);
            el.addEventListener('mouseleave', _hideTip);
        });

        wrap.appendChild(row);
        setTimeout(() => {
            fill.style.width = `${maxVal > 0 ? (item.value / maxVal) * 100 : 0}%`;
        }, 60 + i * 70);
    });

    card.appendChild(wrap);
    return card;
}

/* ---- Vertical SVG bar chart ---- */
function createMetricasVBars(title, subtitle, data) {
    const card = _chartCard(title, subtitle);
    if (!data.length) {
        const empty = document.createElement('p');
        empty.className = 'comments__empty';
        empty.textContent = 'Sin datos suficientes.';
        card.appendChild(empty);
        return card;
    }

    const maxVal = Math.max(...data.map((d) => d.value), 1);
    const chartH = 200, padB = 28, padT = 20, padL = 28;
    const drawH  = chartH - padB - padT;
    const barW   = 38, gap = 16;
    const totalW = padL + data.length * (barW + gap) + gap;

    const svg = _svgEl('svg', {
        viewBox: `0 0 ${totalW} ${chartH}`,
        width: '100%', height: String(chartH),
        style: 'overflow:visible;'
    });

    /* gridlines */
    [0.25, 0.5, 0.75, 1].forEach((frac) => {
        const y = padT + drawH * (1 - frac);
        svg.appendChild(_svgEl('line', {
            x1: padL, y1: y, x2: totalW, y2: y,
            stroke: '#e2e8f0', 'stroke-width': '1', 'stroke-dasharray': '4,3'
        }));
        svg.appendChild(_svgTxt('text', {
            x: padL - 4, y: y + 4,
            'text-anchor': 'end', 'font-size': '9', fill: '#94a3b8'
        }, String(Math.round(maxVal * frac))));
    });

    data.forEach((item, i) => {
        const x   = padL + gap + i * (barW + gap);
        const barH = Math.max(4, (item.value / maxVal) * drawH);
        const baseY = padT + drawH;
        const topY  = baseY - barH;

        /* shadow rect */
        svg.appendChild(_svgEl('rect', {
            x: x + 2, y: baseY,
            width: barW, height: 0,
            rx: '5', fill: item.color, opacity: '0.18'
        }));

        const bar = _svgEl('rect', {
            x, y: baseY,
            width: barW, height: 0,
            rx: '5', fill: item.color,
            style: 'cursor:pointer; transition: opacity 0.2s;'
        });

        bar.addEventListener('mouseenter', (e) => {
            bar.style.opacity = '0.8';
            _showTip(e, [item.fullLabel || item.label, `${item.value} solicitud(es)`]);
        });
        bar.addEventListener('mousemove', _moveTip);
        bar.addEventListener('mouseleave', () => { bar.style.opacity = '1'; _hideTip(); });
        svg.appendChild(bar);

        /* value label */
        const valTxt = _svgTxt('text', {
            x: x + barW / 2, y: topY - 4,
            'text-anchor': 'middle',
            'font-size': '12', 'font-weight': '700', fill: item.color
        }, String(item.value));
        svg.appendChild(valTxt);

        /* x-axis label */
        svg.appendChild(_svgTxt('text', {
            x: x + barW / 2, y: baseY + 16,
            'text-anchor': 'middle',
            'font-size': '10', fill: '#6b7280'
        }, item.label));

        /* animate growth */
        setTimeout(() => {
            bar.setAttribute('y', String(topY));
            bar.setAttribute('height', String(barH));
            bar.style.transition = 'y 0.6s ease, height 0.6s ease';
            svg.querySelectorAll('rect')[i * 2].setAttribute('y', String(topY + 2));
            svg.querySelectorAll('rect')[i * 2].setAttribute('height', String(barH));
            valTxt.setAttribute('y', String(topY - 4));
        }, 80 + i * 90);
    });

    card.appendChild(svg);
    return card;
}

/* ---- Top 5 table ---- */
function createMetricasTopTable(requests) {
    const card = _chartCard(
        'Top 5 por Presupuesto',
        'Iniciativas de mayor inversión del portafolio — click en una fila para ver el detalle'
    );

    const sorted = requests
        .filter((r) => Number(r.presupuestoEstimado) > 0)
        .slice()
        .sort((a, b) => Number(b.presupuestoEstimado) - Number(a.presupuestoEstimado))
        .slice(0, 5);

    if (!sorted.length) {
        const empty = document.createElement('p');
        empty.className = 'comments__empty';
        empty.textContent = 'Sin datos suficientes.';
        card.appendChild(empty);
        return card;
    }

    const table = document.createElement('table');
    table.className = 'metricas-top-table';

    const thead = document.createElement('thead');
    const hrow = document.createElement('tr');
    ['#', 'Solicitud', 'Área', 'Estado', 'Etapa', 'Presupuesto'].forEach((col) => {
        const th = document.createElement('th');
        th.textContent = col;
        hrow.appendChild(th);
    });
    thead.appendChild(hrow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    sorted.forEach((req, i) => {
        const tr = document.createElement('tr');
        tr.addEventListener('click', () => navigateTo('detalle_solicitud', req.id));

        /* rank */
        const tdRank = document.createElement('td');
        tdRank.className = 'metricas-rank';
        tdRank.textContent = `#${i + 1}`;
        tr.appendChild(tdRank);

        /* title */
        const tdTitle = document.createElement('td');
        const strong = document.createElement('div');
        strong.className = 'metricas-req-title';
        strong.textContent = req.title;
        tdTitle.appendChild(strong);
        const idDiv = document.createElement('div');
        idDiv.className = 'metricas-req-id';
        idDiv.textContent = formatRequestId(req.id);
        tdTitle.appendChild(idDiv);
        tr.appendChild(tdTitle);

        /* area */
        const tdArea = document.createElement('td');
        tdArea.textContent = getLabelFromValue(AREAS, req.area);
        tr.appendChild(tdArea);

        /* status badge */
        const tdStatus = document.createElement('td');
        tdStatus.appendChild(createBadge(req.status));
        tr.appendChild(tdStatus);

        /* stage */
        const tdStage = document.createElement('td');
        tdStage.textContent = req.status === STATUS.PENDING
            ? (STAGE_LABELS[req.stage] || '—') : '—';
        tr.appendChild(tdStage);

        /* budget */
        const tdBudget = document.createElement('td');
        tdBudget.className = 'metricas-budget-cell';
        tdBudget.textContent = formatCurrency(Number(req.presupuestoEstimado));
        tr.appendChild(tdBudget);

        tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    card.appendChild(table);
    return card;
}

/* ========================= Project Manager ============================== */

function getImplStageConfig(key) {
    return IMPL_STAGES_CONFIG.find(s => s.key === key) || IMPL_STAGES_CONFIG[0];
}

function getImplRequiredProgress(implementation, stageKey) {
    const config = getImplStageConfig(stageKey);
    const requiredDocs = config.docs.filter(d => d.required);
    if (requiredDocs.length === 0) return { count: 0, total: 0, ready: true };
    const uploaded = implementation?.documents?.[stageKey] || [];
    const count = requiredDocs.filter(rd => uploaded.some(ud => ud.tag === rd.tag)).length;
    return { count, total: requiredDocs.length, ready: count >= requiredDocs.length };
}

function ensureImplementation(req) {
    if (!req.implementation) {
        const today = new Date().toISOString().split('T')[0];
        req.implementation = {
            stage: IMPL_STAGE.INICIACION,
            startedAt: today,
            assignedPM: AppState.currentUser?.email || 'pm@banco.com',
            stageHistory: [{ stage: IMPL_STAGE.INICIACION, movedAt: today, movedBy: AppState.currentUser?.email || 'pm@banco.com' }],
            documents: Object.fromEntries(IMPL_STAGE_ORDER.map(k => [k, []])),
            comments: []
        };
    }
    return req.implementation;
}

/* ---- Kanban Dashboard ---- */

function renderDashboardPM(activeFilter) {
    AppState.currentView = 'dashboard_pm';
    const canvas = createDashboardLayout('dashboard_pm');

    let needsSave = false;
    AppState.requests.forEach(r => {
        if ((r.status === STATUS.APPROVED || r.status === STATUS.CLOSED) && !r.implementation) {
            ensureImplementation(r);
            needsSave = true;
        }
    });
    if (needsSave) saveState();

    const allProjects = AppState.requests.filter(
        r => r.status === STATUS.APPROVED || r.status === STATUS.CLOSED
    );

    const currentFilter = activeFilter || 'all';

    const filteredProjects = currentFilter === 'all'
        ? allProjects
        : allProjects.filter(r => r.tipoProyecto === currentFilter);

    /* ── Page header ── */
    canvas.appendChild(createPageHeader(
        'Kanban de Implementación',
        `${filteredProjects.length} de ${allProjects.length} proyecto(s) en el portafolio — haz clic en una tarjeta para gestionar documentos y avanzar etapas`
    ));

    if (allProjects.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'review-preview__empty';
        empty.appendChild(createIcon('inbox'));
        const emptyTitle = document.createElement('p');
        emptyTitle.className = 'review-preview__empty-title';
        emptyTitle.textContent = 'Sin proyectos en el portafolio';
        empty.appendChild(emptyTitle);
        const emptyText = document.createElement('p');
        emptyText.className = 'text-body-sm';
        emptyText.textContent = 'Los proyectos aprobados por la PMO aparecerán aquí.';
        empty.appendChild(emptyText);
        canvas.appendChild(empty);
        return;
    }

    /* ── Barra de filtros por tipo de proyecto ── */
    const filterBar = document.createElement('div');
    filterBar.className = 'kanban-filter-bar';

    const filterLabel = document.createElement('span');
    filterLabel.className = 'kanban-filter-bar__label';
    filterLabel.appendChild(createIcon('filter_list'));
    const labelTxt = document.createElement('span');
    labelTxt.textContent = 'Tipo de proyecto:';
    filterLabel.appendChild(labelTxt);
    filterBar.appendChild(filterLabel);

    const chipsWrapper = document.createElement('div');
    chipsWrapper.className = 'kanban-filter-chips';

    /* chip "Todos" */
    const allCount = allProjects.length;
    const allChip = createKanbanFilterChip('Todos', 'all', allCount, currentFilter === 'all', (val) => {
        renderDashboardPM(val === 'all' ? null : val);
    });
    chipsWrapper.appendChild(allChip);

    /* chips por tipo */
    TIPOS_PROYECTO.forEach(tipo => {
        const count = allProjects.filter(r => r.tipoProyecto === tipo.value).length;
        if (count === 0) return;
        const chip = createKanbanFilterChip(tipo.label, tipo.value, count, currentFilter === tipo.value, (val) => {
            renderDashboardPM(val);
        });
        chipsWrapper.appendChild(chip);
    });

    filterBar.appendChild(chipsWrapper);
    canvas.appendChild(filterBar);

    /* ── Tablero Kanban ── */
    const wrapper = document.createElement('div');
    wrapper.className = 'kanban-wrapper';

    const board = document.createElement('div');
    board.className = 'kanban-board';

    IMPL_STAGES_CONFIG.forEach(config => {
        const colProjects = filteredProjects.filter(r => {
            const stage = r.implementation?.stage || IMPL_STAGE.INICIACION;
            return stage === config.key;
        });
        board.appendChild(createKanbanColumn(config, colProjects));
    });

    /* mensaje si el filtro no tiene resultados */
    if (filteredProjects.length === 0) {
        const noResults = document.createElement('div');
        noResults.className = 'kanban-no-results';
        noResults.appendChild(createIcon('search_off'));
        const noTxt = document.createElement('p');
        noTxt.textContent = `No hay proyectos de tipo "${TIPOS_PROYECTO.find(t => t.value === currentFilter)?.label || currentFilter}" en el portafolio.`;
        noResults.appendChild(noTxt);
        wrapper.appendChild(noResults);
    } else {
        wrapper.appendChild(board);
    }

    canvas.appendChild(wrapper);
}

function createKanbanFilterChip(label, value, count, isActive, onClick) {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = `kanban-chip${isActive ? ' kanban-chip--active' : ''}`;
    chip.setAttribute('aria-pressed', String(isActive));

    const chipLabel = document.createElement('span');
    chipLabel.className = 'kanban-chip__label';
    chipLabel.textContent = label;
    chip.appendChild(chipLabel);

    const chipCount = document.createElement('span');
    chipCount.className = 'kanban-chip__count';
    chipCount.textContent = String(count);
    chip.appendChild(chipCount);

    chip.addEventListener('click', () => onClick(value));
    return chip;
}

function createKanbanColumn(config, projects) {
    const col = document.createElement('div');
    col.className = 'kanban-col';

    const header = document.createElement('div');
    header.className = 'kanban-col__header';

    const stripe = document.createElement('div');
    stripe.className = 'kanban-col__header-stripe';
    stripe.style.backgroundColor = config.color;
    header.appendChild(stripe);

    header.appendChild(createIcon(config.icon, 'kanban-col__icon'));

    const title = document.createElement('span');
    title.className = 'kanban-col__title';
    title.textContent = config.label;
    header.appendChild(title);

    const countBadge = document.createElement('span');
    countBadge.className = 'kanban-col__count';
    countBadge.textContent = String(projects.length);
    header.appendChild(countBadge);

    col.appendChild(header);

    const body = document.createElement('div');
    body.className = 'kanban-col__body';

    if (projects.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'kanban-col__empty';
        empty.appendChild(createIcon('inbox'));
        const emptyTxt = document.createElement('span');
        emptyTxt.textContent = 'Sin proyectos';
        empty.appendChild(emptyTxt);
        body.appendChild(empty);
    } else {
        projects.forEach(r => body.appendChild(createKanbanCard(r, config)));
    }

    col.appendChild(body);
    return col;
}

function createKanbanCard(req, stageConfig) {
    const card = document.createElement('div');
    card.className = 'kanban-card';
    if (req.status === STATUS.CLOSED) card.classList.add('kanban-card--closed');

    const cardHeader = document.createElement('div');
    cardHeader.className = 'kanban-card__header';

    const idEl = document.createElement('span');
    idEl.className = 'kanban-card__id';
    idEl.textContent = formatRequestId(req.id);
    cardHeader.appendChild(idEl);

    cardHeader.appendChild(getPriorityBadge(req.prioridad));
    card.appendChild(cardHeader);

    const titleEl = document.createElement('h3');
    titleEl.className = 'kanban-card__title';
    titleEl.textContent = req.title;
    card.appendChild(titleEl);

    const meta = document.createElement('div');
    meta.className = 'kanban-card__meta';

    const areaTag = document.createElement('span');
    areaTag.className = 'kanban-card__tag';
    areaTag.textContent = getLabelFromValue(AREAS, req.area);
    meta.appendChild(areaTag);

    const typeTag = document.createElement('span');
    typeTag.className = 'kanban-card__tag';
    typeTag.textContent = getLabelFromValue(TIPOS_PROYECTO, req.tipoProyecto);
    meta.appendChild(typeTag);

    card.appendChild(meta);

    const progress = getImplRequiredProgress(req.implementation, stageConfig.key);
    const docProgress = document.createElement('div');
    docProgress.className = 'kanban-card__doc-progress';

    const bar = document.createElement('div');
    bar.className = 'kanban-card__doc-bar';
    const fill = document.createElement('div');
    fill.className = 'kanban-card__doc-fill';
    const pct = progress.total > 0 ? (progress.count / progress.total) * 100 : 100;
    fill.style.width = `${pct}%`;
    fill.style.backgroundColor = progress.ready ? '#10b981' : stageConfig.color;
    bar.appendChild(fill);
    docProgress.appendChild(bar);

    const docLabel = document.createElement('span');
    docLabel.className = 'kanban-card__doc-label';
    if (req.status === STATUS.CLOSED) {
        docLabel.textContent = 'Proyecto cerrado';
    } else if (progress.total === 0) {
        docLabel.textContent = 'Sin documentos requeridos';
    } else {
        docLabel.textContent = `${progress.count}/${progress.total} docs requeridos`;
    }
    docProgress.appendChild(docLabel);
    card.appendChild(docProgress);

    const footer = document.createElement('div');
    footer.className = 'kanban-card__footer';

    const budget = document.createElement('span');
    budget.className = 'kanban-card__budget';
    budget.textContent = formatBudgetShort(req.presupuestoEstimado);
    footer.appendChild(budget);

    if (req.status === STATUS.CLOSED) {
        const closedBadge = document.createElement('span');
        closedBadge.className = 'badge badge--closed';
        closedBadge.textContent = 'Cerrado';
        footer.appendChild(closedBadge);
    } else {
        const viewBtn = createButton('Ver detalle', 'text', 'open_in_new', (e) => {
            e.stopPropagation();
            navigateTo('detalle_pm', req.id);
        });
        viewBtn.style.fontSize = '1.2rem';
        viewBtn.style.padding = '0.2rem 0.8rem';
        footer.appendChild(viewBtn);
    }

    card.appendChild(footer);
    card.addEventListener('click', () => navigateTo('detalle_pm', req.id));

    return card;
}

/* ---- Detail View ---- */

function renderDetallePM(reqId) {
    const req = AppState.requests.find(r => r.id === parseInt(reqId, 10));
    if (!req || (req.status !== STATUS.APPROVED && req.status !== STATUS.CLOSED)) {
        showNotification('Proyecto no encontrado en el portafolio.', 'error');
        navigateTo('dashboard_pm');
        return;
    }

    ensureImplementation(req);
    const impl = req.implementation;

    AppState.currentView = 'detalle_pm';
    const canvas = createDashboardLayout('dashboard_pm');

    const contextHeader = document.createElement('div');
    contextHeader.className = 'context-header';

    const backLink = document.createElement('button');
    backLink.type = 'button';
    backLink.className = 'context-header__back';
    backLink.appendChild(createIcon('arrow_back'));
    const backLabel = document.createElement('span');
    backLabel.textContent = 'Volver al Kanban';
    backLink.appendChild(backLabel);
    backLink.addEventListener('click', () => navigateTo('dashboard_pm'));
    contextHeader.appendChild(backLink);

    const titleRow = document.createElement('div');
    titleRow.className = 'context-header__title-row';

    const titleBlock = document.createElement('div');
    const reqTitle = document.createElement('h2');
    reqTitle.className = 'context-header__title';
    reqTitle.textContent = req.title;
    titleBlock.appendChild(reqTitle);

    const reqMeta = document.createElement('p');
    reqMeta.className = 'context-header__subtitle';
    reqMeta.textContent = `${formatRequestId(req.id)} · ${getLabelFromValue(AREAS, req.area)} · ${formatCurrency(req.presupuestoEstimado)}`;
    titleBlock.appendChild(reqMeta);
    titleRow.appendChild(titleBlock);

    const statusBadge = createBadge(req.status);
    statusBadge.classList.add('badge--lg');
    titleRow.appendChild(statusBadge);

    const docsBtn = createButton('Documentación por Etapa', 'secondary', 'folder_open',
        () => navigateTo('docs_pm', req.id));
    titleRow.appendChild(docsBtn);

    contextHeader.appendChild(titleRow);
    canvas.appendChild(contextHeader);

    const detail = document.createElement('div');
    detail.className = 'impl-detail';

    detail.appendChild(createImplStepper(impl));

    const grid = document.createElement('div');
    grid.className = 'impl-content-grid';

    grid.appendChild(createImplProjectSummary(req));

    const implPanel = document.createElement('div');
    implPanel.style.cssText = 'display:flex;flex-direction:column;gap:1.6rem;';
    implPanel.appendChild(createImplDocSection(req));
    implPanel.appendChild(createImplCommentsSection(req));
    grid.appendChild(implPanel);

    detail.appendChild(grid);
    canvas.appendChild(detail);

    if (req.status !== STATUS.CLOSED) {
        canvas.appendChild(createImplActionFooter(req));
    }
}

function createImplStepper(impl) {
    const container = document.createElement('div');
    container.className = 'impl-stepper';

    const currentIdx = IMPL_STAGE_ORDER.indexOf(impl.stage);

    IMPL_STAGES_CONFIG.forEach((cfg, idx) => {
        const step = document.createElement('div');
        step.className = 'impl-step';
        if (idx < currentIdx) step.classList.add('impl-step--done');
        if (idx === currentIdx) step.classList.add('impl-step--active');

        const dot = document.createElement('div');
        dot.className = 'impl-step__dot';
        dot.appendChild(createIcon(idx < currentIdx ? 'check' : cfg.icon));
        step.appendChild(dot);

        const label = document.createElement('span');
        label.className = 'impl-step__label';
        label.textContent = cfg.label;
        step.appendChild(label);

        if (idx < IMPL_STAGES_CONFIG.length - 1) {
            const track = document.createElement('div');
            track.className = 'impl-step__track';
            step.appendChild(track);
        }

        container.appendChild(step);
    });

    return container;
}

function createImplProjectSummary(req) {
    const card = document.createElement('div');
    card.className = 'impl-card';

    const cardTitle = document.createElement('h3');
    cardTitle.className = 'impl-card__title';
    cardTitle.appendChild(createIcon('info'));
    const ts = document.createElement('span');
    ts.textContent = 'Resumen del Proyecto';
    cardTitle.appendChild(ts);
    card.appendChild(cardTitle);

    const rows = [
        { label: 'Área',                  value: getLabelFromValue(AREAS, req.area) },
        { label: 'Tipo de Proyecto',       value: getLabelFromValue(TIPOS_PROYECTO, req.tipoProyecto) },
        { label: 'Prioridad',              value: getLabelFromValue(PRIORIDADES, req.prioridad) },
        { label: 'Presupuesto Aprobado',   value: formatCurrency(req.presupuestoEstimado) },
        { label: 'Inicio Estimado',        value: formatDate(req.fechaEstimadaInicio) },
        { label: 'PM Asignado',            value: req.implementation?.assignedPM || '—' },
        { label: 'Inicio Implementación',  value: formatDate(req.implementation?.startedAt) }
    ];

    rows.forEach(({ label, value }) => {
        const row = document.createElement('div');
        row.className = 'impl-info-row';
        const lbl = document.createElement('span');
        lbl.className = 'impl-info-row__label';
        lbl.textContent = label;
        row.appendChild(lbl);
        const val = document.createElement('span');
        val.className = 'impl-info-row__value';
        val.textContent = value || '—';
        row.appendChild(val);
        card.appendChild(row);
    });

    const descRow = document.createElement('div');
    descRow.className = 'impl-info-row';
    const descLbl = document.createElement('span');
    descLbl.className = 'impl-info-row__label';
    descLbl.textContent = 'Descripción';
    descRow.appendChild(descLbl);
    const descVal = document.createElement('p');
    descVal.className = 'impl-info-row__value';
    descVal.style.fontSize = 'var(--font-size-body-sm)';
    descVal.style.lineHeight = '1.5';
    descVal.textContent = req.necesidad || '—';
    descRow.appendChild(descVal);
    card.appendChild(descRow);

    return card;
}

function createImplDocSection(req) {
    const impl = req.implementation;
    const stageKey = impl.stage;
    const config = getImplStageConfig(stageKey);
    const uploadedDocs = impl.documents[stageKey] || [];

    const card = document.createElement('div');
    card.className = 'impl-card';

    const cardTitle = document.createElement('h3');
    cardTitle.className = 'impl-card__title';
    cardTitle.appendChild(createIcon(config.icon));
    const ts = document.createElement('span');
    ts.textContent = `Documentos — ${config.label}`;
    cardTitle.appendChild(ts);
    card.appendChild(cardTitle);

    const docList = document.createElement('div');
    docList.className = 'impl-doc-list';

    config.docs.forEach(docDef => {
        const uploaded = uploadedDocs.find(ud => ud.tag === docDef.tag);
        const item = document.createElement('div');
        item.className = 'impl-doc-item';
        if (!uploaded) item.classList.add('impl-doc-item--missing');

        const iconBox = document.createElement('div');
        iconBox.className = 'impl-doc-item__icon';
        iconBox.appendChild(createIcon(uploaded ? 'description' : (docDef.required ? 'error_outline' : 'add_circle_outline')));
        item.appendChild(iconBox);

        const info = document.createElement('div');
        info.className = 'impl-doc-item__info';

        const name = document.createElement('div');
        name.className = 'impl-doc-item__name';
        name.textContent = uploaded ? uploaded.name : docDef.label;
        info.appendChild(name);

        const meta = document.createElement('div');
        meta.className = 'impl-doc-item__meta';
        if (uploaded) {
            meta.textContent = `${uploaded.format?.toUpperCase() || 'DOC'} · ${formatDate(uploaded.uploadedAt)} · ${uploaded.uploadedBy}`;
        } else {
            meta.textContent = docDef.required ? 'Pendiente (requerido)' : 'Pendiente (opcional)';
        }
        info.appendChild(meta);
        item.appendChild(info);

        const badge = document.createElement('span');
        badge.className = `impl-doc-item__badge ${docDef.required ? 'impl-doc-item__badge--required' : 'impl-doc-item__badge--optional'}`;
        badge.textContent = docDef.required ? 'Requerido' : 'Opcional';
        item.appendChild(badge);

        docList.appendChild(item);
    });

    card.appendChild(docList);

    if (req.status !== STATUS.CLOSED) {
        const addWrapper = document.createElement('div');
        let formVisible = false;
        let formEl = null;

        const addBtn = createButton('Agregar Documento', 'secondary', 'attach_file', () => {
            formVisible = !formVisible;
            if (formVisible) {
                formEl = createAddDocForm(req, stageKey, config, () => renderDetallePM(req.id));
                addWrapper.appendChild(formEl);
                addBtn.querySelector('span:last-child').textContent = 'Cancelar';
            } else {
                if (formEl) { addWrapper.removeChild(formEl); formEl = null; }
                addBtn.querySelector('span:last-child').textContent = 'Agregar Documento';
            }
        });

        addWrapper.appendChild(addBtn);
        card.appendChild(addWrapper);
    }

    return card;
}

function createAddDocForm(req, stageKey, stageConfig, onSuccess) {
    const form = document.createElement('div');
    form.className = 'impl-add-doc-form';

    const docTypeField = createFormField({
        id: `doc-type-${req.id}-${Date.now()}`,
        label: 'Tipo de Documento',
        type: 'select',
        required: true,
        choices: stageConfig.docs.map(d => ({
            value: d.tag,
            label: `${d.label}${d.required ? ' *' : ''}`
        }))
    });
    form.appendChild(docTypeField.group);

    const docNameField = createFormField({
        id: `doc-name-${req.id}-${Date.now()}`,
        label: 'Nombre del Archivo',
        type: 'text',
        required: true,
        placeholder: 'Ej: Acta_Constitucion_v1.0.pdf'
    });
    form.appendChild(docNameField.group);

    const docFormatField = createFormField({
        id: `doc-format-${req.id}-${Date.now()}`,
        label: 'Formato',
        type: 'select',
        required: true,
        choices: [
            { value: 'pdf',   label: 'PDF' },
            { value: 'word',  label: 'Word (.docx)' },
            { value: 'excel', label: 'Excel (.xlsx)' },
            { value: 'ppt',   label: 'PowerPoint (.pptx)' },
            { value: 'otro',  label: 'Otro' }
        ]
    });
    form.appendChild(docFormatField.group);

    const saveBtn = createButton('Guardar Documento', 'primary', 'save', () => {
        const tag = docTypeField.input.value;
        const docName = docNameField.input.value.trim();
        const format = docFormatField.input.value;

        let hasError = false;
        if (!tag) { showFieldError(docTypeField.input, 'Seleccione el tipo de documento.'); hasError = true; }
        if (!docName) { showFieldError(docNameField.input, 'Ingrese el nombre del archivo.'); hasError = true; }
        if (!format) { showFieldError(docFormatField.input, 'Seleccione el formato.'); hasError = true; }
        if (hasError) return;

        if (!req.implementation.documents[stageKey]) req.implementation.documents[stageKey] = [];

        req.implementation.documents[stageKey].push({
            id: `doc_${Date.now()}`,
            tag,
            name: docName,
            format,
            uploadedBy: AppState.currentUser.email,
            uploadedAt: new Date().toISOString().split('T')[0]
        });

        saveState();
        showNotification(`Documento "${docName}" agregado correctamente.`, 'success');
        onSuccess();
    });

    form.appendChild(saveBtn);
    return form;
}

function createImplCommentsSection(req) {
    const impl = req.implementation;
    const card = document.createElement('div');
    card.className = 'impl-card';

    const cardTitle = document.createElement('h3');
    cardTitle.className = 'impl-card__title';
    cardTitle.appendChild(createIcon('forum'));
    const ts = document.createElement('span');
    ts.textContent = `Bitácora del PM (${impl.comments.length})`;
    cardTitle.appendChild(ts);
    card.appendChild(cardTitle);

    if (impl.comments.length > 0) {
        const commentsEl = document.createElement('div');
        commentsEl.className = 'comments';
        impl.comments
            .slice()
            .sort((a, b) => a.date.localeCompare(b.date))
            .forEach(c => {
                const el = document.createElement('div');
                el.className = 'comment';
                const hdr = document.createElement('div');
                hdr.className = 'comment__header';
                const auth = document.createElement('span');
                auth.className = 'comment__author';
                auth.textContent = c.author;
                hdr.appendChild(auth);
                const dt = document.createElement('span');
                dt.className = 'comment__date';
                dt.textContent = formatDate(c.date);
                hdr.appendChild(dt);
                el.appendChild(hdr);
                const txt = document.createElement('p');
                txt.className = 'comment__text';
                txt.textContent = c.text;
                el.appendChild(txt);
                commentsEl.appendChild(el);
            });
        card.appendChild(commentsEl);
    }

    if (req.status !== STATUS.CLOSED) {
        const commentField = createFormField({
            id: `pm-comment-${req.id}`,
            label: 'Agregar nota a la bitácora',
            type: 'textarea',
            rows: 2,
            placeholder: 'Registre avances, decisiones o bloqueos del proyecto...'
        });
        card.appendChild(commentField.group);

        const saveBtn = createButton('Guardar Nota', 'secondary', 'save', () => {
            const text = commentField.input.value.trim();
            if (text.length < 3) { showFieldError(commentField.input, 'Ingrese al menos 3 caracteres.'); return; }
            impl.comments.push({
                author: AppState.currentUser.email,
                date: new Date().toISOString().split('T')[0],
                text
            });
            saveState();
            showNotification('Nota registrada en la bitácora.', 'success');
            renderDetallePM(req.id);
        });
        card.appendChild(saveBtn);
    }

    return card;
}

function createImplActionFooter(req) {
    const impl = req.implementation;
    const stageKey = impl.stage;
    const stageIdx = IMPL_STAGE_ORDER.indexOf(stageKey);
    const isLast = stageIdx === IMPL_STAGE_ORDER.length - 1;
    const nextKey = isLast ? null : IMPL_STAGE_ORDER[stageIdx + 1];
    const nextConfig = nextKey ? getImplStageConfig(nextKey) : null;
    const currentConfig = getImplStageConfig(stageKey);
    const progress = getImplRequiredProgress(impl, stageKey);

    const footer = document.createElement('div');
    footer.className = 'impl-actions';

    const statusMsg = document.createElement('div');
    statusMsg.className = `impl-advance-status${progress.ready ? ' impl-advance-status--ok' : ''}`;
    statusMsg.appendChild(createIcon(progress.ready ? 'check_circle' : 'pending'));
    const statusTxt = document.createElement('span');
    statusTxt.textContent = progress.ready
        ? `Documentación de "${currentConfig.label}" completa.`
        : `Faltan ${progress.total - progress.count} doc(s) requerido(s) en "${currentConfig.label}".`;
    statusMsg.appendChild(statusTxt);
    footer.appendChild(statusMsg);

    const actionBtn = createButton(
        isLast ? 'Cerrar Proyecto' : `Avanzar a ${nextConfig.label}`,
        'primary',
        isLast ? 'task_alt' : 'arrow_forward',
        () => {
            if (!progress.ready) {
                showNotification('Complete los documentos requeridos antes de continuar.', 'error');
                return;
            }
            const today = new Date().toISOString().split('T')[0];
            if (isLast) {
                impl.comments.push({
                    author: AppState.currentUser.email,
                    date: today,
                    text: 'Proyecto cerrado exitosamente. Todos los entregables de Cierre registrados.'
                });
                req.status = STATUS.CLOSED;
                saveState();
                showNotification(`Proyecto ${formatRequestId(req.id)} cerrado exitosamente.`, 'success');
            } else {
                impl.stage = nextKey;
                impl.stageHistory.push({ stage: nextKey, movedAt: today, movedBy: AppState.currentUser.email });
                impl.comments.push({
                    author: AppState.currentUser.email,
                    date: today,
                    text: `Proyecto avanzado de "${currentConfig.label}" a "${nextConfig.label}".`
                });
                saveState();
                showNotification(`Proyecto avanzado a "${nextConfig.label}".`, 'success');
            }
            renderDetallePM(req.id);
        }
    );

    footer.appendChild(actionBtn);
    return footer;
}

/* ---- PM Metrics ---- */

function renderMetricasPM() {
    AppState.currentView = 'metricas_pm';
    const canvas = createDashboardLayout('metricas_pm');

    canvas.appendChild(createPageHeader(
        'Métricas de Implementación',
        'Seguimiento del portafolio de proyectos en ejecución.'
    ));

    const projects = AppState.requests.filter(
        r => r.status === STATUS.APPROVED || r.status === STATUS.CLOSED
    );

    const closed     = projects.filter(r => r.status === STATUS.CLOSED);
    const inProgress = projects.filter(r => r.status === STATUS.APPROVED);
    const blocked    = inProgress.filter(r => {
        if (!r.implementation) return false;
        return !getImplRequiredProgress(r.implementation, r.implementation.stage).ready;
    });
    const totalBudget = projects.reduce((s, r) => s + (Number(r.presupuestoEstimado) || 0), 0);

    const kpis = [
        { label: 'Total Portafolio',    value: String(projects.length),      icon: 'folder_open',   color: '#6366f1', sub: 'proyectos aprobados'          },
        { label: 'En Implementación',   value: String(inProgress.length),    icon: 'construction',  color: '#0ea5e9', sub: 'proyectos activos'             },
        { label: 'Proyectos Cerrados',  value: String(closed.length),        icon: 'task_alt',      color: '#10b981', sub: 'completados exitosamente'      },
        { label: 'Bloqueados',          value: String(blocked.length),       icon: 'block',         color: '#ef4444', sub: 'requieren documentación'       },
        { label: 'Presupuesto Total',   value: formatBudgetShort(totalBudget),icon: 'payments',     color: '#f59e0b', sub: 'en portafolio'                 },
        {
            label: 'Tasa de Cierre',
            value: projects.length ? `${Math.round((closed.length / projects.length) * 100)}%` : '0%',
            icon: 'percent', color: '#8b5cf6', sub: 'proyectos completados'
        }
    ];

    const kpiGrid = document.createElement('div');
    kpiGrid.className = 'metricas-kpi-grid';
    kpis.forEach(k => kpiGrid.appendChild(createMetricaKPICard(k)));
    canvas.appendChild(kpiGrid);

    const chartsRow = document.createElement('div');
    chartsRow.className = 'charts-grid';

    /* — Proyectos por etapa (barras horizontales) — */
    const stageChartCard = _chartCard('Proyectos por Etapa', 'Distribución del portafolio en el flujo de implementación');
    const stageBar = document.createElement('div');
    stageBar.className = 'pm-stage-bar';
    stageBar.style.marginTop = '1.6rem';

    const maxCount = Math.max(1, ...IMPL_STAGES_CONFIG.map(cfg =>
        projects.filter(r => (r.implementation?.stage || IMPL_STAGE.INICIACION) === cfg.key).length
    ));

    IMPL_STAGES_CONFIG.forEach(cfg => {
        const count = projects.filter(r =>
            (r.implementation?.stage || IMPL_STAGE.INICIACION) === cfg.key
        ).length;

        const row = document.createElement('div');
        row.className = 'pm-stage-bar__row';

        const lbl = document.createElement('span');
        lbl.className = 'pm-stage-bar__label';
        lbl.textContent = cfg.label;
        row.appendChild(lbl);

        const track = document.createElement('div');
        track.className = 'pm-stage-bar__track';
        const fill = document.createElement('div');
        fill.className = 'pm-stage-bar__fill';
        fill.style.backgroundColor = cfg.color;
        fill.style.width = '0%';
        track.appendChild(fill);
        row.appendChild(track);

        const cnt = document.createElement('span');
        cnt.className = 'pm-stage-bar__count';
        cnt.textContent = String(count);
        row.appendChild(cnt);

        stageBar.appendChild(row);
        setTimeout(() => { fill.style.width = `${(count / maxCount) * 100}%`; }, 120);
    });

    stageChartCard.appendChild(stageBar);
    chartsRow.appendChild(stageChartCard);

    /* — Distribución por área (donut) — */
    const areaData = AREAS.map(a => ({
        label: a.label,
        value: projects.filter(r => r.area === a.value).length
    })).filter(d => d.value > 0);

    if (areaData.length > 0) {
        chartsRow.appendChild(createMetricasDonut(
            'Distribución por Área',
            'Proyectos del portafolio por área solicitante',
            areaData
        ));
    }

    canvas.appendChild(chartsRow);

    /* — Tabla de proyectos — */
    if (projects.length > 0) {
        const tableCard = _chartCard('Portafolio Completo', 'Todos los proyectos con su estado de implementación actual');
        tableCard.appendChild(createPMProjectsTable(projects));
        canvas.appendChild(tableCard);
    }
}

function createPMProjectsTable(projects) {
    const table = document.createElement('table');
    table.className = 'metricas-top-table';
    table.style.marginTop = '1.2rem';

    const thead = document.createElement('thead');
    const hr = document.createElement('tr');
    ['ID', 'Proyecto', 'Área', 'Etapa Implementación', 'Docs Req.', 'Presupuesto', 'Estado'].forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        hr.appendChild(th);
    });
    thead.appendChild(hr);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    projects
        .slice()
        .sort((a, b) => Number(b.presupuestoEstimado) - Number(a.presupuestoEstimado))
        .forEach(req => {
            const tr = document.createElement('tr');
            tr.style.cursor = 'pointer';
            tr.addEventListener('click', () => navigateTo('detalle_pm', req.id));

            const tdId = document.createElement('td');
            tdId.textContent = formatRequestId(req.id);
            tr.appendChild(tdId);

            const tdTitle = document.createElement('td');
            tdTitle.className = 'metricas-req-title';
            tdTitle.textContent = req.title;
            tr.appendChild(tdTitle);

            const tdArea = document.createElement('td');
            tdArea.textContent = getLabelFromValue(AREAS, req.area);
            tr.appendChild(tdArea);

            const stageKey = req.implementation?.stage || IMPL_STAGE.INICIACION;
            const stageCfg = getImplStageConfig(stageKey);
            const tdStage = document.createElement('td');
            tdStage.textContent = req.status === STATUS.CLOSED ? 'Proyecto Cerrado' : stageCfg.label;
            tdStage.style.color   = req.status === STATUS.CLOSED ? '#10b981' : stageCfg.color;
            tdStage.style.fontWeight = '600';
            tr.appendChild(tdStage);

            const tdDocs = document.createElement('td');
            if (req.status === STATUS.CLOSED) {
                tdDocs.textContent = '✓ Completo';
                tdDocs.style.color = '#10b981';
            } else {
                const prog = getImplRequiredProgress(req.implementation, stageKey);
                tdDocs.textContent = `${prog.count}/${prog.total}`;
                tdDocs.style.color = prog.ready ? '#10b981' : '#ef4444';
            }
            tr.appendChild(tdDocs);

            const tdBudget = document.createElement('td');
            tdBudget.className = 'metricas-budget-cell';
            tdBudget.textContent = formatBudgetShort(req.presupuestoEstimado);
            tr.appendChild(tdBudget);

            const tdStatus = document.createElement('td');
            tdStatus.appendChild(createBadge(req.status));
            tr.appendChild(tdStatus);

            tbody.appendChild(tr);
        });

    table.appendChild(tbody);
    return table;
}

/* ---- Documentación por Etapa ---- */

function renderDocsPM(reqId) {
    const req = AppState.requests.find(r => r.id === parseInt(reqId, 10));
    if (!req || (req.status !== STATUS.APPROVED && req.status !== STATUS.CLOSED)) {
        showNotification('Proyecto no encontrado.', 'error');
        navigateTo('dashboard_pm');
        return;
    }

    ensureImplementation(req);
    const impl = req.implementation;
    const currentStageIdx = IMPL_STAGE_ORDER.indexOf(impl.stage);

    AppState.currentView = 'docs_pm';
    const canvas = createDashboardLayout('dashboard_pm');

    /* ── Context header ── */
    const contextHeader = document.createElement('div');
    contextHeader.className = 'context-header';

    const backLink = document.createElement('button');
    backLink.type = 'button';
    backLink.className = 'context-header__back';
    backLink.appendChild(createIcon('arrow_back'));
    const backLabel = document.createElement('span');
    backLabel.textContent = 'Volver al Proyecto';
    backLink.appendChild(backLabel);
    backLink.addEventListener('click', () => navigateTo('detalle_pm', req.id));
    contextHeader.appendChild(backLink);

    const titleRow = document.createElement('div');
    titleRow.className = 'context-header__title-row';

    const titleBlock = document.createElement('div');
    const reqTitle = document.createElement('h2');
    reqTitle.className = 'context-header__title';
    reqTitle.textContent = 'Documentación por Etapa';
    titleBlock.appendChild(reqTitle);

    const reqMeta = document.createElement('p');
    reqMeta.className = 'context-header__subtitle';
    reqMeta.textContent = `${formatRequestId(req.id)} · ${req.title}`;
    titleBlock.appendChild(reqMeta);
    titleRow.appendChild(titleBlock);

    const stageBadge = document.createElement('span');
    stageBadge.className = 'badge badge--lg';
    const currentCfg = getImplStageConfig(impl.stage);
    stageBadge.textContent = req.status === STATUS.CLOSED ? 'Proyecto Cerrado' : `Etapa actual: ${currentCfg.label}`;
    stageBadge.style.backgroundColor = req.status === STATUS.CLOSED ? '#10b981' : currentCfg.color;
    stageBadge.style.color = '#fff';
    titleRow.appendChild(stageBadge);

    contextHeader.appendChild(titleRow);
    canvas.appendChild(contextHeader);

    /* ── Contenido ── */
    const wrapper = document.createElement('div');
    wrapper.className = 'impl-detail';

    /* Resumen de documentación */
    const totalUploaded = IMPL_STAGE_ORDER.reduce((sum, key) => {
        return sum + (impl.documents[key]?.length || 0);
    }, 0);
    const totalRequired = IMPL_STAGES_CONFIG.reduce((sum, cfg) => {
        return sum + cfg.docs.filter(d => d.required).length;
    }, 0);
    const completedRequired = IMPL_STAGES_CONFIG.reduce((sum, cfg) => {
        const uploaded = impl.documents[cfg.key] || [];
        return sum + cfg.docs.filter(d => d.required && uploaded.some(u => u.tag === d.tag)).length;
    }, 0);

    const summaryCard = document.createElement('div');
    summaryCard.className = 'docs-summary-bar';

    const summaryItems = [
        { icon: 'description',  label: 'Documentos adjuntos',    value: String(totalUploaded)                              },
        { icon: 'task_alt',     label: 'Requeridos completados',  value: `${completedRequired} / ${totalRequired}`         },
        { icon: 'engineering',  label: 'Etapa actual',            value: req.status === STATUS.CLOSED ? 'Cerrado' : currentCfg.label },
        { icon: 'flag',         label: 'Estado del proyecto',     value: req.status                                        }
    ];

    summaryItems.forEach(({ icon, label, value }) => {
        const item = document.createElement('div');
        item.className = 'docs-summary-item';
        item.appendChild(createIcon(icon));
        const texts = document.createElement('div');
        const lbl = document.createElement('span');
        lbl.className = 'docs-summary-item__label';
        lbl.textContent = label;
        texts.appendChild(lbl);
        const val = document.createElement('span');
        val.className = 'docs-summary-item__value';
        val.textContent = value;
        texts.appendChild(val);
        item.appendChild(texts);
        summaryCard.appendChild(item);
    });

    wrapper.appendChild(summaryCard);

    /* Etapas y sus documentos */
    const stagesGrid = document.createElement('div');
    stagesGrid.className = 'docs-stages-grid';

    IMPL_STAGES_CONFIG.forEach((cfg, idx) => {
        const uploadedDocs = impl.documents[cfg.key] || [];
        const requiredDocs = cfg.docs.filter(d => d.required);
        const completedReq  = requiredDocs.filter(rd => uploadedDocs.some(u => u.tag === rd.tag)).length;

        const stageState = idx < currentStageIdx ? 'done'
            : idx === currentStageIdx ? 'active'
            : 'pending';

        const stageCard = document.createElement('div');
        stageCard.className = `docs-stage-card docs-stage-card--${stageState}`;

        /* — Header de etapa — */
        const stageHeader = document.createElement('div');
        stageHeader.className = 'docs-stage-card__header';
        stageHeader.style.borderLeftColor = cfg.color;

        const stageLeft = document.createElement('div');
        stageLeft.className = 'docs-stage-card__header-left';

        const stageIcon = document.createElement('div');
        stageIcon.className = 'docs-stage-card__icon';
        stageIcon.style.backgroundColor = `${cfg.color}22`;
        stageIcon.style.color = cfg.color;
        stageIcon.appendChild(createIcon(stageState === 'done' ? 'check_circle' : cfg.icon));
        stageLeft.appendChild(stageIcon);

        const stageTitles = document.createElement('div');
        const stageName = document.createElement('h3');
        stageName.className = 'docs-stage-card__name';
        stageName.textContent = cfg.label;
        stageTitles.appendChild(stageName);

        const stageSub = document.createElement('p');
        stageSub.className = 'docs-stage-card__sub';
        if (stageState === 'pending') {
            stageSub.textContent = 'Etapa no iniciada';
        } else {
            stageSub.textContent = `${uploadedDocs.length} adjunto(s) · ${completedReq}/${requiredDocs.length} requeridos`;
        }
        stageTitles.appendChild(stageSub);
        stageLeft.appendChild(stageTitles);
        stageHeader.appendChild(stageLeft);

        const stateChip = document.createElement('span');
        stateChip.className = 'docs-stage-state-chip';
        stateChip.style.backgroundColor = stageState === 'done'   ? '#10b98120'
            : stageState === 'active'  ? `${cfg.color}20`
            : 'var(--color-surface-container)';
        stateChip.style.color = stageState === 'done'   ? '#10b981'
            : stageState === 'active'  ? cfg.color
            : 'var(--color-on-surface-variant)';
        stateChip.textContent = stageState === 'done' ? 'Completada' : stageState === 'active' ? 'En curso' : 'Pendiente';
        stageHeader.appendChild(stateChip);

        stageCard.appendChild(stageHeader);

        /* — Cuerpo: documentos — */
        const stageBody = document.createElement('div');
        stageBody.className = 'docs-stage-card__body';

        if (uploadedDocs.length === 0 && stageState === 'pending') {
            const emptyMsg = document.createElement('p');
            emptyMsg.className = 'docs-stage-empty';
            emptyMsg.textContent = 'Esta etapa aún no ha sido iniciada. Los documentos aparecerán aquí cuando el proyecto avance.';
            stageBody.appendChild(emptyMsg);
        } else {
            /* Documentos adjuntados */
            if (uploadedDocs.length > 0) {
                cfg.docs.forEach(docDef => {
                    const uploaded = uploadedDocs.find(u => u.tag === docDef.tag);
                    if (!uploaded) return;
                    stageBody.appendChild(createDocsViewItem(uploaded, docDef, true));
                });

                /* Documentos del def que no tienen adjunto pero están definidos */
                cfg.docs.forEach(docDef => {
                    const uploaded = uploadedDocs.find(u => u.tag === docDef.tag);
                    if (uploaded) return;
                    stageBody.appendChild(createDocsViewItem(null, docDef, false));
                });
            } else {
                /* Etapa activa o pasada sin ningún documento */
                cfg.docs.forEach(docDef => {
                    stageBody.appendChild(createDocsViewItem(null, docDef, false));
                });
            }
        }

        stageCard.appendChild(stageBody);

        /* — Footer: enlace ir al detalle si es etapa activa — */
        if (stageState === 'active' && req.status !== STATUS.CLOSED) {
            const footerLink = document.createElement('div');
            footerLink.className = 'docs-stage-card__footer';
            const addDocBtn = createButton('Agregar documentos en esta etapa', 'text', 'attach_file',
                () => navigateTo('detalle_pm', req.id));
            footerLink.appendChild(addDocBtn);
            stageCard.appendChild(footerLink);
        }

        stagesGrid.appendChild(stageCard);
    });

    wrapper.appendChild(stagesGrid);
    canvas.appendChild(wrapper);
}

function createDocsViewItem(uploaded, docDef, hasDoc) {
    const item = document.createElement('div');
    item.className = `docs-view-item${hasDoc ? '' : ' docs-view-item--missing'}`;

    const iconBox = document.createElement('div');
    iconBox.className = 'docs-view-item__icon';

    const formatIcons = { pdf: 'picture_as_pdf', word: 'article', excel: 'table_chart', ppt: 'slideshow', otro: 'insert_drive_file' };
    const iconName = hasDoc ? (formatIcons[uploaded.format] || 'description') : (docDef.required ? 'error_outline' : 'radio_button_unchecked');
    iconBox.appendChild(createIcon(iconName));
    item.appendChild(iconBox);

    const info = document.createElement('div');
    info.className = 'docs-view-item__info';

    const name = document.createElement('span');
    name.className = 'docs-view-item__name';
    name.textContent = hasDoc ? uploaded.name : docDef.label;
    info.appendChild(name);

    const meta = document.createElement('div');
    meta.className = 'docs-view-item__meta';

    if (hasDoc) {
        const formatChip = document.createElement('span');
        formatChip.className = 'docs-view-item__format';
        formatChip.textContent = (uploaded.format || 'doc').toUpperCase();
        meta.appendChild(formatChip);

        const separator = document.createTextNode(' · ');
        meta.appendChild(separator);

        const dateTxt = document.createTextNode(`${formatDate(uploaded.uploadedAt)} · ${uploaded.uploadedBy}`);
        meta.appendChild(dateTxt);
    } else {
        meta.textContent = docDef.required ? 'Pendiente — requerido para avanzar' : 'Pendiente — opcional';
    }

    info.appendChild(meta);
    item.appendChild(info);

    const badge = document.createElement('span');
    badge.className = `docs-view-item__badge ${docDef.required ? 'docs-view-item__badge--req' : 'docs-view-item__badge--opt'}`;
    badge.textContent = docDef.required ? 'Requerido' : 'Opcional';
    item.appendChild(badge);

    return item;
}

/* --------------------------- Inicialización ----------------------------- */

document.addEventListener('DOMContentLoaded', () => {
    loadState();
    ensureNotificationsContainer();

    if (AppState.currentUser) {
        navigateToHome();
    } else {
        navigateTo('login');
    }
});
