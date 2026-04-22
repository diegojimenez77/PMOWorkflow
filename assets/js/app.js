/* =========================================================================
   PMO Governance Portal - SPA Vanilla JS
   - Sin frameworks, sin innerHTML, sin alerts.
   - Feedback visual mediante notificaciones DOM y mensajes inline.
   ========================================================================= */

/* ------------------------------- Constantes ------------------------------ */

const STORAGE_KEY = 'pmoAppState';

const STATUS = {
    DRAFT: 'Borrador',
    PENDING: 'En Revisión',
    APPROVED: 'Aprobado',
    REJECTED: 'Rechazado',
    CHANGES: 'Requiere Cambios'
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
    admin: { email: 'admin@banco.com', password: 'admin1234' }
};

/* ------------------------------- Estado --------------------------------- */

const AppState = {
    currentUser: null,
    currentView: null,
    requests: [
        {
            id: 1,
            title: 'Actualización de Servidores Core',
            status: STATUS.PENDING,
            stage: STAGE.TECNICA,
            date: '2024-03-15',
            applicant: 'solicitante@banco.com',
            area: 'ti',
            prioridad: 'alta',
            tipoProyecto: 'infraestructura',
            necesidad: 'Los servidores actuales presentan latencias elevadas que impactan la operación diaria del core bancario.',
            impacto: 'Reducción de tiempos de respuesta en 40% y mejora en la disponibilidad del servicio para todas las áreas.',
            presupuestoEstimado: '850000',
            fechaEstimadaInicio: '2024-05-01',
            comments: [
                {
                    author: 'admin@banco.com',
                    date: '2024-03-16',
                    text: 'Solicitud recibida. Será evaluada por el comité de inversión la próxima semana.'
                }
            ]
        },
        {
            id: 2,
            title: 'Automatización de Conciliaciones',
            status: STATUS.PENDING,
            stage: STAGE.PMO,
            date: '2024-03-20',
            applicant: 'solicitante@banco.com',
            area: 'finanzas',
            prioridad: 'media',
            tipoProyecto: 'desarrollo',
            necesidad: 'Las conciliaciones se realizan manualmente, generando retrasos y errores operativos en el cierre contable.',
            impacto: 'Ahorro de 120 horas-hombre mensuales y reducción de inconsistencias contables en un 85%.',
            presupuestoEstimado: '320000',
            fechaEstimadaInicio: '2024-06-15',
            comments: []
        },
        {
            id: 3,
            title: 'Optimización de Red de Sucursales',
            status: STATUS.PENDING,
            stage: STAGE.DIRECTOR,
            date: '2024-03-22',
            applicant: 'solicitante@banco.com',
            area: 'operaciones',
            prioridad: 'media',
            tipoProyecto: 'infraestructura',
            necesidad: 'Consolidación de red WAN entre sucursales para mejorar tiempos de transacción y reducir costos.',
            impacto: 'Reducción de latencia intersucursales en 55% y ahorro del 28% en OPEX de conectividad.',
            presupuestoEstimado: '1200000',
            fechaEstimadaInicio: '2024-07-01',
            comments: [
                {
                    author: 'admin@banco.com',
                    date: '2024-03-23',
                    text: 'Aprobado por comité técnico. Pasa a aprobación del director.'
                }
            ]
        },
        {
            id: 4,
            title: 'Migración de Data Warehouse',
            status: STATUS.PENDING,
            stage: STAGE.TECNICA,
            date: '2024-03-28',
            applicant: 'solicitante@banco.com',
            area: 'ti',
            prioridad: 'alta',
            tipoProyecto: 'analitica',
            necesidad: 'El data warehouse actual no escala con el volumen transaccional proyectado para el próximo año.',
            impacto: 'Mejora de desempeño analítico en 60% y soporte a modelos predictivos en tiempo casi real.',
            presupuestoEstimado: '2400000',
            fechaEstimadaInicio: '2024-08-01',
            comments: []
        },
        {
            id: 5,
            title: 'Nuevo Portal de Empleados',
            status: STATUS.PENDING,
            stage: STAGE.PMO,
            date: '2024-04-01',
            applicant: 'solicitante@banco.com',
            area: 'recursos_humanos',
            prioridad: 'baja',
            tipoProyecto: 'desarrollo',
            necesidad: 'El portal interno actual tiene una interfaz obsoleta y baja adopción por parte del personal.',
            impacto: 'Incremento estimado de adopción digital del personal del 45% al 85% en seis meses.',
            presupuestoEstimado: '180000',
            fechaEstimadaInicio: '2024-09-01',
            comments: []
        },
        {
            id: 7,
            title: 'Modernización del Canal Banca Móvil',
            status: STATUS.DRAFT,
            stage: STAGE.PMO,
            date: '2024-04-05',
            applicant: 'solicitante@banco.com',
            area: 'ti',
            prioridad: 'media',
            tipoProyecto: 'desarrollo',
            necesidad: 'La app móvil actual tiene una arquitectura heredada que dificulta la incorporación de nuevas funcionalidades y métodos de pago.',
            impacto: 'Incrementar el NPS del canal móvil en 15 puntos y reducir el tiempo de time-to-market de nuevas features en un 50%.',
            presupuestoEstimado: '950000',
            fechaEstimadaInicio: '2024-10-01',
            comments: []
        },
        {
            id: 6,
            title: 'Plataforma de Detección de Fraude',
            status: STATUS.APPROVED,
            stage: STAGE.DIRECTOR,
            date: '2024-02-10',
            applicant: 'solicitante@banco.com',
            area: 'riesgos',
            prioridad: 'alta',
            tipoProyecto: 'seguridad',
            necesidad: 'Reforzar las capacidades antifraude con motores de ML para detectar patrones en tiempo real.',
            impacto: 'Reducción estimada del 35% en pérdidas por fraude en el primer año.',
            presupuestoEstimado: '1650000',
            fechaEstimadaInicio: '2024-04-01',
            comments: [
                {
                    author: 'admin@banco.com',
                    date: '2024-02-20',
                    text: 'Proyecto aprobado por el comité ejecutivo.'
                }
            ]
        }
    ],
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
            if (Array.isArray(parsed.requests)) {
                AppState.requests = parsed.requests.map((req) => ({
                    stage: STAGE.PMO,
                    ...req
                }));
            }
            if (parsed.currentUser) {
                AppState.currentUser = parsed.currentUser;
            }
        } catch (error) {
            console.warn('No se pudo cargar el estado persistido.', error);
        }
    }
}

function saveState() {
    const toSave = {
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
            renderNuevaSolicitud();
            break;
        case 'metricas':
            renderMetricas();
            break;
        case 'panel_aprobacion':
            renderPanelAprobacion(param);
            break;
        case 'flujo_gobierno':
            renderFlujoGobierno();
            break;
        case 'detalle_solicitud':
            renderDetalleSolicitud(param);
            break;
        default:
            renderLogin();
    }
}

function navigateToHome() {
    if (AppState.currentUser?.role === ROLE_ADMIN) {
        navigateTo('dashboard_admin');
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
            { id: 'dashboard_admin', icon: 'dashboard', text: 'Panel de Solicitudes' },
            { id: 'flujo_gobierno', icon: 'account_tree', text: 'Flujo de Gobierno' },
            { id: 'panel_aprobacion', icon: 'fact_check', text: 'Aprobaciones' },
            { id: 'metricas', icon: 'analytics', text: 'Métricas y Reportes' }
        ];
    } else {
        menuItems = [
            { id: 'dashboard_solicitante', icon: 'dashboard', text: 'Mis Solicitudes' },
            { id: 'nueva_solicitud', icon: 'assignment_add', text: 'Nueva Solicitud' }
        ];
    }

    menuItems.forEach((item) => {
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
    tdActions.appendChild(createIconButton('visibility', 'Ver detalle', () => {
        navigateTo('detalle_solicitud', req.id);
    }));
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

    const cardsGrid = document.createElement('div');
    cardsGrid.className = 'cards-grid';
    cardsGrid.appendChild(createSummaryCard(
        'Mis Solicitudes', myRequests.length, 'folder_open',
        'trending_up', 'Total histórico'
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

    if (changesCount > 0) {
        const infoCard = document.createElement('div');
        infoCard.className = 'summary-card summary-card--alert';

        const infoTitle = document.createElement('div');
        infoTitle.className = 'summary-card__title';
        infoTitle.textContent = 'Atención';
        infoCard.appendChild(infoTitle);

        const infoText = document.createElement('p');
        infoText.className = 'text-body-md';
        infoText.textContent = `Tiene ${changesCount} solicitud(es) que requieren cambios. Revíselas y agregue comentarios.`;
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

function renderNuevaSolicitud() {
    AppState.currentView = 'nueva_solicitud';
    const canvas = createDashboardLayout('nueva_solicitud');

    canvas.appendChild(createPageHeader(
        'Nueva Solicitud',
        'Complete el formulario de intake para iniciar la evaluación del proyecto.'
    ));

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
        placeholder: 'Ej. Actualización del CRM Central'
    });
    fieldTitulo.group.classList.add('form-section__full');
    grid1.appendChild(fieldTitulo.group);

    const fieldArea = createFormField({
        id: 'area',
        label: 'Área Solicitante',
        type: 'select',
        required: true,
        placeholder: 'Seleccione un área...',
        choices: AREAS
    });
    grid1.appendChild(fieldArea.group);

    const fieldTipo = createFormField({
        id: 'tipoProyecto',
        label: 'Tipo de Proyecto',
        type: 'select',
        required: true,
        placeholder: 'Seleccione un tipo...',
        choices: TIPOS_PROYECTO
    });
    grid1.appendChild(fieldTipo.group);

    const fieldPrioridad = createFormField({
        id: 'prioridad',
        label: 'Prioridad Sugerida',
        type: 'select',
        required: true,
        placeholder: 'Seleccione prioridad...',
        choices: PRIORIDADES
    });
    grid1.appendChild(fieldPrioridad.group);

    const fieldFecha = createFormField({
        id: 'fechaEstimadaInicio',
        label: 'Fecha Estimada de Inicio',
        type: 'date',
        required: true
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
        placeholder: 'Describa la necesidad u oportunidad que motiva este proyecto...'
    });
    grid2.appendChild(fieldNecesidad.group);

    const fieldImpacto = createFormField({
        id: 'impacto',
        label: 'Impacto Esperado',
        type: 'textarea',
        required: true,
        rows: 3,
        placeholder: '¿Cómo beneficiará este proyecto al área y a la institución?'
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
        placeholder: 'Ej. 500000'
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

    const btnSubmit = createButton('Enviar Solicitud', 'primary', 'send', null, 'submit');
    actions.appendChild(btnSubmit);

    form.appendChild(actions);

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
    backLabel.textContent = 'Volver a Aprobaciones';
    backLink.appendChild(backLabel);
    backLink.addEventListener('click', () => {
        navigateTo('panel_aprobacion');
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

    if (req.status === STATUS.PENDING) {
        panel.appendChild(createDecisionesActionArea(req));
    } else if (req.status === STATUS.CHANGES) {
        panel.appendChild(createDecisionesActionArea(req));
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
    } else if (req.status === STATUS.REJECTED) {
        text.textContent = 'La solicitud fue rechazada. Consulta el historial para ver la justificación.';
    } else {
        text.textContent = 'La solicitud ya no está activa para decisiones.';
    }
    footer.appendChild(text);

    return footer;
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

function renderFlujoGobierno() {
    if (AppState.currentUser?.role !== ROLE_ADMIN) {
        showNotification('Solo los administradores de la PMO pueden acceder al flujo de gobierno.', 'error');
        navigateToHome();
        return;
    }

    AppState.currentView = 'flujo_gobierno';
    const canvas = createDashboardLayout('flujo_gobierno');

    const goBtn = createButton('Ir a Aprobaciones', 'primary', 'fact_check',
        () => navigateTo('panel_aprobacion'));

    canvas.appendChild(createPageHeader(
        'Flujo de Gobierno',
        'Seguimiento visual de las 5 etapas que recorre cada solicitud de proyecto antes de ser aprobada.',
        goBtn
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
        const topItems = sorted.slice(0, 3);

        topItems.forEach((req) => {
            list.appendChild(createGovStageListItem(req, step.key));
        });

        if (bucket.length > topItems.length) {
            const moreItem = document.createElement('li');
            moreItem.className = 'gov-stage-card__more';
            const moreBtn = document.createElement('button');
            moreBtn.type = 'button';
            moreBtn.className = 'gov-stage-card__more-link';
            moreBtn.textContent = `Ver las ${bucket.length} solicitudes en esta etapa`;
            moreBtn.appendChild(createIcon('arrow_forward'));
            moreBtn.addEventListener('click', () => {
                if (step.key === 'aprobado' || step.key === 'borrador') {
                    navigateTo('dashboard_admin');
                } else {
                    navigateTo('panel_aprobacion');
                }
            });
            moreItem.appendChild(moreBtn);
            list.appendChild(moreItem);
        }
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
        if (stepKey === 'borrador') {
            navigateTo('dashboard_admin');
            return;
        }
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

/* ---------------------- Panel de Aprobaciones --------------------------- */

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

function renderPanelAprobacion(selectedId) {
    if (AppState.currentUser?.role !== ROLE_ADMIN) {
        showNotification('Solo los administradores de la PMO pueden acceder al panel de aprobaciones.', 'error');
        navigateToHome();
        return;
    }

    AppState.currentView = 'panel_aprobacion';
    const canvas = createDashboardLayout('panel_aprobacion');

    const pendingRequests = AppState.requests
        .filter((r) => r.status === STATUS.PENDING)
        .slice()
        .sort((a, b) => b.date.localeCompare(a.date));

    let currentSelectedId = selectedId !== undefined && selectedId !== null
        ? parseInt(selectedId, 10)
        : null;

    if (currentSelectedId === null || !pendingRequests.find((r) => r.id === currentSelectedId)) {
        currentSelectedId = pendingRequests.length > 0 ? pendingRequests[0].id : null;
    }

    const panel = document.createElement('div');
    panel.className = 'review-panel';

    const listSection = document.createElement('section');
    listSection.className = 'review-list';

    const listHeader = document.createElement('div');
    listHeader.className = 'review-list__header';

    const listTitles = document.createElement('div');
    const listTitle = document.createElement('h1');
    listTitle.className = 'review-list__title';
    listTitle.textContent = 'Pendientes de Revisión PMO';
    listTitles.appendChild(listTitle);

    const listSubtitle = document.createElement('p');
    listSubtitle.className = 'review-list__subtitle';
    listSubtitle.textContent = pendingRequests.length === 1
        ? '1 solicitud requiere atención'
        : `${pendingRequests.length} solicitudes requieren atención`;
    listTitles.appendChild(listSubtitle);

    listHeader.appendChild(listTitles);
    listSection.appendChild(listHeader);

    if (pendingRequests.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'review-list__empty';
        empty.appendChild(createIcon('inbox'));
        const emptyTitle = document.createElement('p');
        emptyTitle.className = 'text-body-md';
        emptyTitle.textContent = 'No hay solicitudes pendientes de revisión.';
        empty.appendChild(emptyTitle);
        listSection.appendChild(empty);
    } else {
        pendingRequests.forEach((req) => {
            const item = document.createElement('button');
            item.type = 'button';
            item.className = 'review-item';
            if (req.id === currentSelectedId) {
                item.classList.add('review-item--active');
            }

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

            const date = document.createElement('span');
            date.className = 'review-item__date';
            date.appendChild(createIcon('schedule'));
            const dateText = document.createElement('span');
            dateText.textContent = formatRelativeDate(req.date);
            date.appendChild(dateText);
            footer.appendChild(date);

            const budget = document.createElement('span');
            budget.className = 'review-item__budget';
            budget.textContent = formatBudgetShort(req.presupuestoEstimado);
            footer.appendChild(budget);

            item.appendChild(footer);

            item.addEventListener('click', () => {
                renderPanelAprobacion(req.id);
            });

            listSection.appendChild(item);
        });
    }

    panel.appendChild(listSection);

    const previewSection = document.createElement('section');
    previewSection.className = 'review-preview';

    const selectedRequest = pendingRequests.find((r) => r.id === currentSelectedId);

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
        emptyText.textContent = 'No hay solicitudes pendientes que revisar por el momento.';
        empty.appendChild(emptyText);
        previewSection.appendChild(empty);
    } else {
        previewSection.appendChild(createReviewPreviewHeader(selectedRequest));
        previewSection.appendChild(createReviewPreviewBody(selectedRequest));
        previewSection.appendChild(createReviewActionsFooter(selectedRequest));
    }

    panel.appendChild(previewSection);
    canvas.appendChild(panel);
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

    const buttons = document.createElement('div');
    buttons.className = 'review-actions-footer__buttons';

    const handleDecision = (decision) => {
        const commentText = commentField.input.value.trim();

        if ((decision === STATUS.REJECTED || decision === STATUS.CHANGES) && commentText.length < 3) {
            showFieldError(
                commentField.input,
                'Debe incluir un comentario que justifique la decisión.'
            );
            showNotification('Indique el motivo antes de continuar.', 'error');
            return;
        }

        req.status = decision;

        if (commentText) {
            if (!req.comments) req.comments = [];
            req.comments.push({
                author: AppState.currentUser.email,
                date: new Date().toISOString().split('T')[0],
                text: commentText
            });
        }

        saveState();

        let message = '';
        let type = 'success';
        if (decision === STATUS.APPROVED) {
            message = `Solicitud ${formatRequestId(req.id)} aprobada correctamente.`;
        } else if (decision === STATUS.CHANGES) {
            message = `Se solicitaron ajustes para ${formatRequestId(req.id)}.`;
            type = 'info';
        } else if (decision === STATUS.REJECTED) {
            message = `Solicitud ${formatRequestId(req.id)} rechazada.`;
            type = 'error';
        }
        showNotification(message, type);

        renderPanelAprobacion();
    };

    const rejectBtn = createButton('Rechazar', 'danger', 'cancel',
        () => handleDecision(STATUS.REJECTED));
    const changesBtn = createButton('Solicitar Ajustes', 'secondary', 'edit_note',
        () => handleDecision(STATUS.CHANGES));
    const approveBtn = createButton('Aprobar Fase PMO', 'primary', 'check',
        () => handleDecision(STATUS.APPROVED));

    buttons.appendChild(rejectBtn);
    buttons.appendChild(changesBtn);
    buttons.appendChild(approveBtn);

    footer.appendChild(buttons);
    return footer;
}

/* ----------------------------- Métricas --------------------------------- */

function renderMetricas() {
    AppState.currentView = 'metricas';
    const canvas = createDashboardLayout('metricas');

    canvas.appendChild(createPageHeader(
        'Métricas y Reportes',
        'Indicadores clave de desempeño del portafolio de proyectos.'
    ));

    const allRequests = AppState.requests;
    const totalCount = allRequests.length;
    const approvedCount = allRequests.filter((r) => r.status === STATUS.APPROVED).length;
    const pendingCount = allRequests.filter((r) => r.status === STATUS.PENDING).length;
    const rejectedCount = allRequests.filter((r) => r.status === STATUS.REJECTED).length;
    const changesCount = allRequests.filter((r) => r.status === STATUS.CHANGES).length;

    const approvedBudget = allRequests
        .filter((r) => r.status === STATUS.APPROVED)
        .reduce((sum, r) => sum + Number(r.presupuestoEstimado || 0), 0);

    const totalBudget = allRequests
        .reduce((sum, r) => sum + Number(r.presupuestoEstimado || 0), 0);

    const approvalRate = totalCount > 0
        ? Math.round((approvedCount / totalCount) * 100)
        : 0;

    const cardsGrid = document.createElement('div');
    cardsGrid.className = 'cards-grid';

    cardsGrid.appendChild(createSummaryCard(
        'Presupuesto Aprobado',
        formatCurrency(approvedBudget),
        'account_balance',
        'trending_up',
        `${approvalRate}% de aprobación`
    ));
    cardsGrid.appendChild(createSummaryCard(
        'Solicitudes Totales',
        totalCount,
        'folder_copy',
        'horizontal_rule',
        `${pendingCount} en revisión`
    ));
    cardsGrid.appendChild(createSummaryCard(
        'Presupuesto Solicitado',
        formatCurrency(totalBudget),
        'payments',
        'trending_up',
        'Suma global'
    ));

    canvas.appendChild(cardsGrid);

    const chartsGrid = document.createElement('div');
    chartsGrid.className = 'charts-grid';

    chartsGrid.appendChild(createSolicitudesPorAreaChart(allRequests));
    chartsGrid.appendChild(createStatusDistributionChart({
        approved: approvedCount,
        pending: pendingCount,
        rejected: rejectedCount,
        changes: changesCount,
        total: totalCount
    }));

    canvas.appendChild(chartsGrid);

    const secondRow = document.createElement('div');
    secondRow.className = 'charts-grid';

    secondRow.appendChild(createPrioridadChart(allRequests));
    secondRow.appendChild(createTipoProyectoChart(allRequests));

    canvas.appendChild(secondRow);
}

function createSolicitudesPorAreaChart(requests) {
    const card = document.createElement('div');
    card.className = 'chart-card';

    const title = document.createElement('h3');
    title.className = 'chart-card__title';
    title.textContent = 'Solicitudes por Área';
    card.appendChild(title);

    const counts = AREAS.map((area) => ({
        label: area.label,
        value: requests.filter((r) => r.area === area.value).length
    })).filter((item) => item.value > 0);

    if (counts.length === 0) {
        const empty = document.createElement('p');
        empty.className = 'comments__empty';
        empty.textContent = 'No hay datos suficientes para mostrar la gráfica.';
        card.appendChild(empty);
        return card;
    }

    const maxValue = Math.max(...counts.map((c) => c.value), 1);

    const chart = document.createElement('div');
    chart.className = 'chart-bars';

    counts.forEach((item) => {
        const col = document.createElement('div');
        col.className = 'chart-bars__column';

        const value = document.createElement('span');
        value.className = 'chart-bars__label';
        value.textContent = String(item.value);
        col.appendChild(value);

        const bar = document.createElement('div');
        bar.className = 'chart-bars__bar';
        bar.style.height = `${(item.value / maxValue) * 80}%`;
        bar.title = `${item.label}: ${item.value}`;
        col.appendChild(bar);

        const label = document.createElement('span');
        label.className = 'chart-bars__label';
        label.textContent = item.label.split(' ')[0];
        col.appendChild(label);

        chart.appendChild(col);
    });

    card.appendChild(chart);
    return card;
}

function createStatusDistributionChart(counts) {
    const card = document.createElement('div');
    card.className = 'chart-card';

    const title = document.createElement('h3');
    title.className = 'chart-card__title';
    title.textContent = 'Distribución por Estado';
    card.appendChild(title);

    const total = counts.total || 0;

    const items = [
        { label: 'Aprobadas', value: counts.approved, modifier: 'approved' },
        { label: 'En Revisión', value: counts.pending, modifier: 'pending' },
        { label: 'Requiere Cambios', value: counts.changes, modifier: 'changes' },
        { label: 'Rechazadas', value: counts.rejected, modifier: 'rejected' }
    ];

    const list = document.createElement('div');
    list.className = 'chart-list';

    items.forEach((item) => {
        const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;

        const itemEl = document.createElement('div');
        itemEl.className = 'chart-list__item';

        const row = document.createElement('div');
        row.className = 'chart-list__row';

        const labelWrap = document.createElement('span');
        labelWrap.className = 'chart-list__label';
        const dot = document.createElement('span');
        dot.className = `chart-list__dot chart-list__dot--${item.modifier}`;
        labelWrap.appendChild(dot);
        const labelText = document.createElement('span');
        labelText.textContent = item.label;
        labelWrap.appendChild(labelText);
        row.appendChild(labelWrap);

        const valueEl = document.createElement('span');
        valueEl.className = 'chart-list__value';
        valueEl.textContent = `${item.value} (${pct}%)`;
        row.appendChild(valueEl);

        itemEl.appendChild(row);

        const bar = document.createElement('div');
        bar.className = 'chart-list__bar';
        const fill = document.createElement('div');
        fill.className = `chart-list__fill chart-list__fill--${item.modifier}`;
        fill.style.width = `${pct}%`;
        bar.appendChild(fill);
        itemEl.appendChild(bar);

        list.appendChild(itemEl);
    });

    card.appendChild(list);
    return card;
}

function createPrioridadChart(requests) {
    const card = document.createElement('div');
    card.className = 'chart-card';

    const title = document.createElement('h3');
    title.className = 'chart-card__title';
    title.textContent = 'Solicitudes por Prioridad';
    card.appendChild(title);

    const total = requests.length;
    const counts = PRIORIDADES.map((p) => ({
        label: p.label,
        value: requests.filter((r) => r.prioridad === p.value).length,
        modifier: p.value === 'alta' ? 'rejected'
            : p.value === 'media' ? 'pending' : 'approved'
    }));

    if (total === 0) {
        const empty = document.createElement('p');
        empty.className = 'comments__empty';
        empty.textContent = 'Sin datos disponibles.';
        card.appendChild(empty);
        return card;
    }

    const list = document.createElement('div');
    list.className = 'chart-list';

    counts.forEach((item) => {
        const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;

        const itemEl = document.createElement('div');
        itemEl.className = 'chart-list__item';

        const row = document.createElement('div');
        row.className = 'chart-list__row';

        const labelWrap = document.createElement('span');
        labelWrap.className = 'chart-list__label';
        const dot = document.createElement('span');
        dot.className = `chart-list__dot chart-list__dot--${item.modifier}`;
        labelWrap.appendChild(dot);
        const labelText = document.createElement('span');
        labelText.textContent = item.label;
        labelWrap.appendChild(labelText);
        row.appendChild(labelWrap);

        const valueEl = document.createElement('span');
        valueEl.className = 'chart-list__value';
        valueEl.textContent = `${item.value} (${pct}%)`;
        row.appendChild(valueEl);

        itemEl.appendChild(row);

        const bar = document.createElement('div');
        bar.className = 'chart-list__bar';
        const fill = document.createElement('div');
        fill.className = `chart-list__fill chart-list__fill--${item.modifier}`;
        fill.style.width = `${pct}%`;
        bar.appendChild(fill);
        itemEl.appendChild(bar);

        list.appendChild(itemEl);
    });

    card.appendChild(list);
    return card;
}

function createTipoProyectoChart(requests) {
    const card = document.createElement('div');
    card.className = 'chart-card';

    const title = document.createElement('h3');
    title.className = 'chart-card__title';
    title.textContent = 'Solicitudes por Tipo de Proyecto';
    card.appendChild(title);

    const counts = TIPOS_PROYECTO.map((t) => ({
        label: t.label,
        value: requests.filter((r) => r.tipoProyecto === t.value).length
    })).filter((item) => item.value > 0);

    if (counts.length === 0) {
        const empty = document.createElement('p');
        empty.className = 'comments__empty';
        empty.textContent = 'No hay datos suficientes para mostrar la gráfica.';
        card.appendChild(empty);
        return card;
    }

    const maxValue = Math.max(...counts.map((c) => c.value), 1);

    const chart = document.createElement('div');
    chart.className = 'chart-bars';

    counts.forEach((item) => {
        const col = document.createElement('div');
        col.className = 'chart-bars__column';

        const value = document.createElement('span');
        value.className = 'chart-bars__label';
        value.textContent = String(item.value);
        col.appendChild(value);

        const bar = document.createElement('div');
        bar.className = 'chart-bars__bar';
        bar.style.height = `${(item.value / maxValue) * 80}%`;
        bar.title = `${item.label}: ${item.value}`;
        col.appendChild(bar);

        const label = document.createElement('span');
        label.className = 'chart-bars__label';
        label.textContent = item.label.split(' ')[0];
        col.appendChild(label);

        chart.appendChild(col);
    });

    card.appendChild(chart);
    return card;
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
