# PMO Governance Portal

Aplicación web para la gestión centralizada de solicitudes de proyecto dirigidas a la Oficina de Gestión de Proyectos (PMO) de una institución bancaria.

Construida como Single Page Application con **HTML5, CSS3 y JavaScript vanilla**, sin frameworks, librerías de UI ni dependencias externas, cumpliendo de forma estricta las reglas de `AGENTS.md`.

---

## 1. Contexto y necesidad

En bancos y organizaciones grandes, las áreas de negocio (Finanzas, Operaciones, Riesgos, RRHH, Marketing, TI, etc.) generan continuamente ideas y necesidades que requieren inversión tecnológica. Sin una herramienta formal, estas solicitudes se dispersan entre correos, hojas de cálculo y reuniones, lo que produce:

- Pérdida de trazabilidad de las solicitudes y sus decisiones.
- Falta de visibilidad ejecutiva sobre el portafolio activo.
- Inconsistencia en los criterios de priorización y aprobación.
- Tiempos de respuesta lentos y cuellos de botella en la PMO.
- Ausencia de métricas confiables para la toma de decisiones.

**PMO Governance Portal** resuelve este problema proporcionando:

- Un **punto único de intake** (formulario estándar) para que cualquier área capture una solicitud con información completa: necesidad, impacto, presupuesto, cronograma, prioridad y tipo de proyecto.
- Un **flujo de gobierno visible** con 5 etapas claramente definidas: Borrador → Revisión PMO → Evaluación Financiera → Aprobación → Aprobado.
- Un **Portfolio Dashboard ejecutivo** con KPIs en tiempo real para que el administrador de la PMO supervise el estado agregado.
- Un **Panel de Aprobaciones** con vista maestro-detalle para revisar y decidir sobre solicitudes pendientes.
- Un **historial completo de decisiones y comentarios** por solicitud.
- **Métricas y reportes** por área, estado, prioridad y tipo de proyecto, con exportación a CSV.

---

## 2. Perfiles de usuario

La aplicación distingue dos roles con credenciales demo precargadas:

| Rol | Email | Contraseña |
|---|---|---|
| Solicitante | `solicitante@banco.com` | `demo1234` |
| Administrador PMO | `admin@banco.com` | `admin1234` |

### 2.1. Solicitante

- Iniciar sesión.
- Crear nuevas solicitudes mediante un formulario completo con validación inline.
- Ver el listado de *Mis Solicitudes* con estado, etapa y fecha.
- Abrir el detalle de su solicitud y consultar comentarios del equipo PMO.
- Publicar comentarios adicionales durante el flujo.

### 2.2. Administrador de la PMO

- Iniciar sesión.
- Visualizar el **Portfolio Dashboard** (KPIs + tabla con filtros y paginación).
- Acceder al **Panel de Aprobaciones** maestro-detalle para revisar pendientes.
- Abrir el **Detalle de Solicitud (vista admin)** con stepper de 5 etapas, resumen ejecutivo, bento de Datos Generales + Impacto y Finanzas, y panel lateral sticky de *Decisiones y Comentarios*.
- Avanzar la solicitud por las etapas, solicitar ajustes, rechazar o aprobar definitivamente, registrando comentarios obligatorios en decisiones negativas.
- Consultar **Métricas y Reportes** con gráficos por Área, Estado, Prioridad y Tipo de Proyecto.
- Exportar el portafolio filtrado a CSV.

---

## 3. Cómo funciona

### 3.1. Arquitectura

- **Single Page Application** sin frameworks: un solo `index.html` monta un contenedor `#app-root` y `app.js` renderiza cada vista usando exclusivamente `document.createElement` + `appendChild` (nada de `innerHTML`).
- **Router simple** en `navigateTo(route, param)` con un `switch` que dispatcha a las funciones `renderXxx`.
- **Estado global** en el objeto `AppState` (usuario, vista, solicitudes, filtros, paginación).
- **Persistencia** con `localStorage` bajo la clave `pmo_app_state`, que almacena usuario autenticado y solicitudes entre recargas.
- **Estilos** con CSS3 nativo, metodología BEM estricta, tokens `:root` (colores, espaciados, radios, tipografía), unidades `rem` con `font-size` base de 10 px, y media queries para desktop, tablet y móvil.

### 3.2. Flujo de aprobación

```
Borrador → Revisión PMO → Evaluación Financiera → Aprobación → Aprobado
                                                         ↘ Rechazado
                                                         ↘ Requiere Cambios
```

- Toda solicitud nueva inicia en `status = "En Revisión"` y `stage = "pmo"` (Revisión PMO).
- El administrador puede *Avanzar Fase* para pasar de Revisión PMO → Evaluación Financiera → Aprobación, o regresar a la etapa anterior.
- En la etapa final de Aprobación, el botón se convierte en *Aprobar Solicitud* y marca la solicitud como `status = "Aprobado"`.
- *Solicitar Ajustes* y *Rechazar* requieren un comentario obligatorio y ponen la solicitud en `Requiere Cambios` o `Rechazado` respectivamente.
- Cada transición queda registrada automáticamente como entrada en el timeline de comentarios.

### 3.3. Estructura de archivos

```
PMO/
├── index.html                # Punto de entrada de la SPA
├── AGENTS.md                 # Reglas del proyecto y del agente
├── README.md                 # Este documento
├── assets/
│   ├── css/
│   │   └── styles.css        # Todos los estilos (BEM, rem, responsive)
│   ├── js/
│   │   └── app.js            # Lógica completa de la SPA
│   └── img/                  # Reservado para assets estáticos
└── designs/                  # Mockups de referencia (Tailwind HTML)
    ├── inicio_de_sesi_n/
    ├── dashboard_del_solicitante/
    ├── formulario_de_intake/
    ├── detalle_de_solicitud/
    ├── panel_de_aprobaci_n/
    ├── panel_de_revisi_n_administrador/
    ├── dashboard_de_administrador_pmo/
    └── reporting_y_anal_tica_pmo/
```

### 3.4. Cómo ejecutar

No requiere build ni servidor. Opciones:

1. Abrir `index.html` directamente en un navegador moderno.
2. O bien servir la carpeta con cualquier servidor estático, por ejemplo:

```bash
# Con Python
python -m http.server 8080

# Con Node
npx serve .
```

Luego visitar `http://localhost:8080`.

Para reiniciar los datos demo, basta con limpiar el `localStorage` del dominio (DevTools → Application → Local Storage → borrar `pmo_app_state`).

---

## 4. Qué está implementado hasta el momento

### 4.1. Autenticación y sesión

- Pantalla de *Inicio de Sesión* con campos email/contraseña, validación y feedback visual.
- Credenciales demo para cada rol.
- Cierre de sesión desde el header del dashboard.
- Persistencia del usuario autenticado en `localStorage`.
- Redirección automática según el rol tras iniciar sesión.

### 4.2. Dashboard del Solicitante

- Tarjetas resumen (total, pendientes, aprobadas, requiere cambios).
- Tabla *Mis Solicitudes* con estado, fecha y acciones.
- Botón directo a *Nueva Solicitud*.

### 4.3. Formulario de intake (Nueva Solicitud)

- Campos completos: Título, Área, Tipo de Proyecto, Prioridad, Necesidad de Negocio, Impacto Esperado, Presupuesto Estimado, Fecha Estimada de Inicio.
- Validación inline por campo con mensajes de error.
- Notificaciones visuales de éxito/error.

### 4.4. Detalle de Solicitud (vista solicitante)

- Datos generales, justificación y comentarios.
- Formulario de nuevo comentario con validación.

### 4.5. Detalle de Solicitud (vista administrador) — *pantalla exclusiva del admin*

- Encabezado de contexto con enlace a *Volver a Aprobaciones*, ID, título y badge de estado/etapa.
- **Workflow Stepper horizontal de 5 etapas** con línea de progreso animada y estados visuales (done, active, blocked, pending).
- Grid 8 + 4:
  - **Resumen Ejecutivo** con tags derivados de área/tipo/prioridad.
  - **Datos Generales** con avatar del solicitante, departamento, fecha propuesta, tipo, fecha de creación.
  - **Impacto y Finanzas** con presupuesto hero, ROI proyectado, prioridad y alineación OKR inferida.
  - **Panel sticky *Decisiones y Comentarios*** con timeline completo y área de acciones.
- Acciones contextuales: *Aprobar Fase X* (avanza etapa), *Aprobar Solicitud* (en la etapa final), *Solicitar Ajustes*, *Rechazar* (ambas requieren comentario), y enlace de *Regresar a etapa anterior*.

### 4.6. Flujo de Gobierno (administrador) — *pantalla exclusiva del admin*

- Visión portafolio del ciclo de vida de una solicitud con las **5 etapas** definidas en `detalle_de_solicitud`: Borrador → Revisión PMO → Evaluación Financiera → Aprobación → Aprobado.
- 4 tarjetas de *resumen de pipeline*: Solicitudes en Flujo, Aprobadas, Requieren Ajustes, Rechazadas.
- **Stepper hero horizontal** con las 5 etapas: ícono, nombre, conteo actual de solicitudes por etapa y acento de color por fase.
- Grid *Detalle por etapa* con una tarjeta por fase mostrando:
  - Descripción y SLA objetivo.
  - Conteo total en esa etapa.
  - Top de solicitudes (ordenadas por prioridad) con ID, título, prioridad y presupuesto corto.
  - Enlace directo a *Aprobaciones* o al *Portfolio Dashboard* cuando hay más solicitudes.
- Sección *Estados fuera de flujo*: tarjetas para *Requieren Ajustes* (accent warning) y *Rechazadas* (accent danger), con listado de solicitudes clickables hacia el detalle.
- Acceso desde el menú lateral del admin con ícono `account_tree`.

### 4.7. Portfolio Dashboard (administrador)

- 4 tarjetas KPI: *Total Solicitudes*, *Pendientes Revisión PMO*, *En Evaluación Financiera*, *Aprobación de Director*.
- *Registro Activo de Portafolio* con:
  - Filtros por Área, Prioridad y Estado/Etapa (con opción de limpiar).
  - Tabla con ID destacado, nombre, solicitante (avatar + iniciales), área, indicador de prioridad, badge de etapa, fecha y accesos directos.
  - Filas clicables que navegan al detalle.
  - Paginación con "Mostrando X a Y de Z" y números de página con elipsis.
- Botón **Exportar Reporte** que descarga las solicitudes filtradas en CSV (UTF-8 con BOM).

### 4.8. Panel de Aprobaciones (administrador)

- Vista maestro-detalle.
- Lista izquierda con cards de solicitudes pendientes, prioridad, ID, fecha relativa y presupuesto corto.
- Preview derecho con header del sponsor, 4 estadísticas (presupuesto, fecha, riesgo, tipo), resumen ejecutivo, sección financiera simulada con barras CAPEX/OPEX, alineación estratégica e historial de comentarios.
- Footer de acciones con textarea de comentario y botones *Aprobar*, *Solicitar Ajustes*, *Rechazar*.

### 4.9. Métricas y Reportes

- Gráficos CSS puros (sin librerías):
  - Solicitudes por Área (barras horizontales).
  - Distribución por Estado (barras apiladas).
  - Solicitudes por Prioridad y por Tipo de Proyecto.
- KPIs ejecutivos.

### 4.10. UX y cumplimiento

- Notificaciones DOM personalizadas (success, error, info) en lugar de `alert`/`confirm`.
- Validación de formularios con mensajes inline y estilo `form-input--invalid`.
- Diseño **responsive** con breakpoints en 640, 768, 1024 px.
- Uso exclusivo de `document.createElement` + `textContent` (cero `innerHTML`).
- Cero dependencias externas de JavaScript (sólo fuentes de Google y Material Symbols vía CSS).

---

## 5. Next Steps — Roadmap al MVP productivo

El estado actual es un **prototipo funcional completo del lado del cliente** que valida el diseño, la arquitectura de información y los flujos. Para llevarlo a un MVP usable por empleados reales de un banco se proponen los siguientes pasos, priorizados:

### 5.1. Fundamentos de backend y datos (crítico)

1. **API REST/GraphQL** con Node.js + Express o NestJS (o Python/FastAPI).
   - Endpoints: `POST /auth/login`, `GET/POST /requests`, `PATCH /requests/:id`, `POST /requests/:id/comments`, `PATCH /requests/:id/stage`, `POST /requests/:id/decisions`, `GET /metrics`.
2. **Base de datos relacional** (PostgreSQL recomendado) con esquema inicial:
   - `users (id, email, password_hash, role, department, name, avatar_url, ...)`.
   - `requests (id, code, title, area, tipo_proyecto, prioridad, status, stage, necesidad, impacto, presupuesto_estimado, fecha_estimada_inicio, applicant_id, created_at, updated_at)`.
   - `request_comments (id, request_id, author_id, text, created_at, kind)`.
   - `request_events (id, request_id, from_stage, to_stage, actor_id, created_at, reason)` para auditoría del flujo.
   - `attachments (id, request_id, file_url, mime, size, uploaded_by, uploaded_at)`.
3. **Migraciones versionadas** (Prisma, Knex, Flyway o TypeORM) y **seeders** reproducibles.
4. **Reemplazar `localStorage`** por llamadas HTTP con `fetch`, manejo de errores centralizado y estados de carga/reintentos.

### 5.2. Autenticación y seguridad (crítico)

1. **Autenticación real**: passwords con bcrypt/argon2, JWT de sesión corta + refresh token en cookie `HttpOnly Secure SameSite=Lax`.
2. **Integración con SSO corporativo** (SAML/OIDC — Azure AD, Okta, Ping), que es el estándar en banca.
3. **Autorización granular** (RBAC): Solicitante, Analista PMO, Evaluador Financiero, Director, Admin global. Las acciones sensibles (avanzar etapa, aprobar) deben validarse en backend, no solo en UI.
4. **Controles de seguridad web**: CSP, headers HSTS, CSRF tokens, rate limiting, sanitización de entradas, validación con esquemas (Zod/Joi/class-validator).
5. **Auditoría**: registrar cada cambio de estado, comentario, login y exportación con actor, fecha, IP y user-agent. En banca es obligatorio para cumplimiento.
6. **Cifrado en tránsito (TLS) y en reposo** para datos sensibles y adjuntos.

### 5.3. Workflow enriquecido

1. **SLA por etapa**: cada etapa con un tiempo máximo esperado; alertas cuando se vence.
2. **Asignación de revisores**: poder asignar una solicitud a un analista específico de la PMO y a un evaluador financiero concreto.
3. **Aprobación multinivel**: reglas por monto (por ejemplo, >$1M USD requiere aprobación de Comité).
4. **Devoluciones y re-envíos**: el flujo actual marca *Requiere Cambios* pero no permite re-someter. Implementar el ciclo completo.
5. **Plantillas de solicitud** por tipo de proyecto (distintos campos obligatorios según Infraestructura vs Desarrollo vs Seguridad).
6. **Estados de *Ejecución* y *Cierre*** posteriores a Aprobado (tracking de avance físico y financiero del proyecto).

### 5.4. Funcionalidad pendiente para el MVP

1. **Adjuntos de documentación** (RFC, business case, cotizaciones) con almacenamiento seguro (S3, Azure Blob) y antivirus/DLP.
2. **Notificaciones multicanal**:
   - Email transaccional (SendGrid, SES, Resend) para cambios de estado y menciones.
   - Notificaciones in-app con campanita y contador real.
   - Opcional: integración con Microsoft Teams / Slack corporativo.
3. **Búsqueda y filtros avanzados**: texto libre en título/necesidad/comentarios, rango de fechas, rango de presupuesto, múltiples áreas, combinaciones guardadas como "vistas".
4. **Reportes avanzados**: exportación PDF ejecutiva, planificación de reporte mensual, drill-down por área, tendencia por trimestre.
5. **Dashboard personalizable** con widgets movibles por usuario.
6. **Historial de versiones** del contenido de una solicitud (quién cambió qué campo y cuándo).
7. **Comentarios con menciones `@usuario`, adjuntos inline y markdown seguro**.

### 5.5. Calidad y mantenimiento

1. **Pruebas**:
   - Unitarias (Jest/Vitest) para utilidades y validadores.
   - Integración para los endpoints API.
   - End-to-end con Playwright o Cypress cubriendo los flujos de Solicitante y Admin.
2. **CI/CD**: pipeline con GitHub Actions / GitLab CI que ejecute lint, tests, build y deploy por ambientes (dev, staging, prod).
3. **Linters y formateo**: ESLint + Prettier + Stylelint con reglas del proyecto.
4. **Observabilidad**: logging estructurado (pino/winston), métricas (Prometheus), trazas (OpenTelemetry), alertas (Grafana/Datadog).
5. **Gestión de errores**: captura centralizada en backend y frontend (Sentry o similar) con contexto de usuario anonimizado.
6. **Backups y DR** de la base de datos, con pruebas periódicas de restauración.

### 5.6. Escalabilidad y productización

1. **Arquitectura cliente moderna opcional**: si el equipo lo requiere, migrar la SPA a un framework (React/Vue/Svelte) manteniendo el contrato con el API. El diseño actual ya está modularizado por vistas.
2. **Internacionalización (i18n)**: aunque el requisito es español, aislar textos a un diccionario para poder extender a inglés/portugués si el banco opera en varios países.
3. **Accesibilidad (a11y)**: auditar con axe y lighthouse, asegurar navegación por teclado, roles ARIA en componentes custom (stepper, tabs, modales), contraste AA.
4. **Rendimiento**: lazy-loading de vistas, paginación real en servidor, caching con `Cache-Control` y ETags.
5. **Auditorías de cumplimiento**: DPIA (privacidad), SOX/ISO 27001 según aplique al banco.

### 5.7. Checklist mínimo para liberar el MVP

- [ ] Backend desplegado con endpoints de auth, requests, comments y metrics.
- [ ] PostgreSQL con migraciones y seed inicial para el entorno piloto.
- [ ] SSO corporativo funcionando o login con password + 2FA.
- [ ] RBAC validado en servidor para todas las mutaciones.
- [ ] Notificaciones por email en cambios de estado.
- [ ] Adjuntos con antivirus y control de tamaño.
- [ ] Auditoría completa en `request_events`.
- [ ] Pruebas E2E verdes para los 3 flujos principales (crear, avanzar, aprobar/rechazar).
- [ ] Monitoreo y alertas básicas en producción.
- [ ] Documento de operación (runbook) para el equipo de soporte.

---

## 6. Referencias del diseño

Los mockups originales fueron utilizados como referencia visual y se encuentran en la carpeta `designs/`. Cada pantalla del sistema implementado adapta su correspondiente diseño a HTML/CSS/JS nativos, respetando la arquitectura de información y la jerarquía visual.

---

## 7. Licencia y uso

Proyecto interno de demostración. Todos los derechos reservados por la organización que lo implementa.
