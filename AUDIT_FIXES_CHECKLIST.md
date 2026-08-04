# FitCoach SaaS — Lista Completa de Fixes del Audit

Última actualización: 4 de agosto de 2026

---

## 🔴 CRÍTICO — Bloquea Producción (Hacer HOY)

### SEGURIDAD

- [ ] **SEC-001** — Rotar ADMIN_JWT_SECRET en VPS
  - Remover fallback hardcodeado `"fitcoach-admin-secret-2026"`
  - Generar valor random 32+ caracteres
  - Actualizar .env en VPS
  - Revocar tokens admin existentes
  - **Effort:** 15 min

- [ ] **SEC-002** — Remover `ignoreBuildErrors` de next.config.ts
  - Ubicación: `src/next.config.ts` línea 4
  - Remover `typescript: { ignoreBuildErrors: true }`
  - Arreglar errores TypeScript que salgan
  - **Effort:** 30 min - 1 hora

- [ ] **SEC-003** — Agregar validación de propiedad en Sessions API
  - Archivo: `src/app/api/sessions/route.ts` POST endpoint
  - Verificar que `client_id` pertenece al trainer autenticado
  - Query: `SELECT id FROM clients WHERE id = $1 AND trainer_id = $2`
  - Retornar 404 si no existe
  - **Effort:** 20 min

### FUNCIONALIDAD

- [ ] **FUNC-001** — Crear y ejecutar migration para `routine_item_notes`
  - Archivo SQL: `supabase/migrations/20260804_coach_notes.sql`
  - Tabla: `routine_item_notes (id, routine_item_id, client_id, notes, created_at, updated_at)`
  - Constraints: UNIQUE(routine_item_id, client_id), FK references
  - Ejecutar en VPS con: `psql -U postgres -d fitcoach < migration.sql`
  - **Effort:** 20 min

- [ ] **FUNC-002** — Arreglar Login (mejor error handling)
  - ✅ Agregado try/catch, timeout, validación
  - **Effort:** ✅ DONE

### i18n

- [ ] **I18N-001** — Agregar botón de idioma en home pública
  - Archivo: `src/app/page.tsx`
  - Agregar LanguageToggle en navbar
  - Usar `fitcoach-home-lang` localStorage key
  - **Effort:** 30 min

- [ ] **I18N-002** — Detectar idioma server-side para evitar flash
  - Detectar desde `accept-language` header en root layout
  - Pasar al cliente como prop durante SSR
  - Prevenir cambio post-hidratación
  - **Effort:** 1-2 horas

---

## 🟠 ALTOS (1-2 semanas)

### SEGURIDAD

- [ ] **SEC-004** — Habilitar SSL Certificate Verification en Database
  - Archivo: `src/lib/db.ts` línea 5
  - Cambiar: `ssl: { rejectUnauthorized: false }` → `ssl: { rejectUnauthorized: true }` en prod
  - **Effort:** 15 min

- [ ] **SEC-005** — Implementar Rate Limiting en endpoints críticos
  - Endpoints: `/api/auth/register`, `/api/auth/forgot-password`, `/api/admin/auth/login`, `/api/clients/import`
  - Usar: `@upstash/ratelimit` o `express-rate-limit`
  - Límites: 5 requests/hora por IP
  - **Effort:** 2-3 horas

- [ ] **SEC-006** — Fortalecer Password Policy
  - Archivos: `src/app/api/auth/register/route.ts`, `src/app/api/auth/reset-password/route.ts`
  - Requerir: 12+ caracteres, 1 mayúscula, 1 número, 1 carácter especial
  - Implementar regex: `/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/`
  - **Effort:** 30 min

- [ ] **SEC-007** — Remover Sensitive Logging
  - Archivos a revisar:
    - `src/app/api/auth/register/route.ts` (líneas 31, 57)
    - `src/app/api/invitar/route.ts` (línea 8)
    - Otros console.log/error que expongan datos
  - Remover: tokens, emails, errores completos
  - **Effort:** 1 hora

- [ ] **SEC-008** — Optimizar Password Reset (no cargar todos los usuarios)
  - Archivo: `src/app/api/auth/forgot-password/route.ts` línea 16
  - Remover `listUsers()`
  - Usar query by email en tabla users
  - **Effort:** 30 min

- [ ] **SEC-009** — Validar Contenido de Archivos (Magic Numbers)
  - Archivos: `src/app/api/trainers/upload-photo/route.ts`, `src/app/api/exercises/upload-video/route.ts`
  - Usar librería: `mmmagic` o `file-type`
  - Validar por contenido, no solo MIME type
  - **Effort:** 1 hora

- [ ] **SEC-010** — Agregar Security Headers
  - Archivo: `next.config.ts`
  - Headers: CSP, X-Frame-Options, X-Content-Type-Options, Strict-Transport-Security, X-XSS-Protection
  - **Effort:** 1 hora

### FUNCIONALIDAD

- [ ] **FUNC-003** — Arreglar Confirmación de Desasignar Rutina
  - Archivo: `src/components/ClienteDetailClient.tsx`
  - Logic flow: step 0 → 1 (confirm) → 2 (deleting)
  - Actualmente salta directo a delete
  - **Effort:** 30 min

- [ ] **FUNC-004** — Verificar Coach Notes Sincronización
  - Confirmar que rutine editor guarda en `routine_items.coach_notes` O `routine_item_notes`
  - Portal lee de `routine_item_notes` (per-client)
  - Decidir arquitectura final y hacer consistente
  - **Effort:** 1 hora

- [ ] **FUNC-005** — Lenguaje Default No Debería Ser Español
  - Archivo: `src/components/PortalView.tsx` y otros
  - Actualmente: if lang === "en" → EN, else → ES
  - Cambiar: Solo soportar EN/ES, detectar correctamente
  - **Effort:** 30 min

### i18n

- [ ] **I18N-003** — Hacer dinámica la propiedad `lang` del HTML
  - Archivo: `src/app/layout.tsx` línea 43
  - Cambiar: `<html lang="es">` → `<html lang={detectedLang}>`
  - **Effort:** 30 min

- [ ] **I18N-004** — Remover 20+ Strings Hardcodeados
  - Archivos principales:
    - `src/components/PortalView.tsx` (líneas 124, 273, 299, 303, 310, 315, 319, 323)
    - `src/app/page.tsx` (líneas 241, 245)
    - `src/app/dashboard/guia/page.tsx` (múltiples)
    - `src/components/AdminDashboard.tsx` (tab labels, secciones)
    - `src/components/SubscriptionView.tsx`
  - Convertir a: `t("namespace", "key")`
  - **Effort:** 2-3 horas

- [ ] **I18N-005** — Agregar Traducción de Error/Success Messages
  - Archivos: exercises/page.tsx, auth/reset-password, login, etc.
  - Agregar keys a `src/lib/i18n/translations.ts`
  - Implementar en componentes
  - **Effort:** 1-2 horas

- [ ] **I18N-006** — Standarizar Date/Time Formatting
  - Usar: `toLocaleString(navigator.language, {...})`
  - Remover hardcoded "es-AR"
  - Aplicar a: PortalView, AdminDashboard, ChatWindow
  - **Effort:** 1 hora

---

## 🟡 MEDIOS (2-4 semanas)

### SEGURIDAD

- [ ] **SEC-011** — Implementar CSRF Protection
  - Agregar CSRF tokens a forms
  - Validar en POST/PATCH/DELETE
  - **Effort:** 3 horas

- [ ] **SEC-012** — Reducir Admin Session Timeout
  - Cambiar de 8 horas → 30-60 minutos
  - Agregar activity monitoring
  - Archivo: `src/app/api/admin/auth/login/route.ts`
  - **Effort:** 1-2 horas

- [ ] **SEC-013** — Mejorar Password Reset Token Validation
  - Agregar: token regeneration, one-time use, 15-min expiration
  - **Effort:** 2 horas

- [ ] **SEC-014** — Auditar RLS Policies en Supabase
  - Revisar todas las políticas de seguridad por tabla
  - Asegurar que trainers no accedan data de otros trainers
  - Asegurar que clients solo vean su propia data
  - **Effort:** 2-3 horas

### FUNCIONALIDAD

- [ ] **FUNC-006** — Agregar Error Handling a Coach Notes API
  - Archivo: `src/app/api/clients/[clientId]/exercise-notes/route.ts`
  - Try/catch para queries, retornar 500 con mensaje claro
  - **Effort:** 30 min

---

## 📋 LISTA RESUMIDA POR ESTADO

### ✅ COMPLETADOS
- [x] FUNC-002 — Login error handling

### 🔄 EN PROGRESO
- [ ] SEC-001 — Rotar ADMIN_JWT_SECRET (PENDIENTE)
- [ ] SEC-002 — Remover ignoreBuildErrors (PENDIENTE)
- [ ] SEC-003 — Validar ownership en Sessions (PENDIENTE)
- [ ] FUNC-001 — Crear migration routine_item_notes (PENDIENTE)
- [ ] I18N-001 — Agregar botón idioma en home (PENDIENTE)
- [ ] I18N-002 — Detectar idioma server-side (PENDIENTE)

### ⏳ NO INICIADOS
- 19 items más...

---

## 📊 ESTADÍSTICAS

| Prioridad | Total | Completados | En Progreso | Restantes |
|-----------|-------|-------------|-------------|-----------|
| 🔴 CRÍTICO | 6 | 1 | 5 | 0 |
| 🟠 ALTO | 10 | 0 | 0 | 10 |
| 🟡 MEDIO | 7 | 0 | 0 | 7 |
| **TOTAL** | **23** | **1** | **5** | **17** |

**Progreso Total:** 1/23 (4%)

---

## ⏱️ TIEMPO ESTIMADO

- **Críticos:** 4-6 horas
- **Altos:** 20-30 horas
- **Medios:** 15-20 horas
- **Total:** ~50 horas

**Recomendación:** Dedica 2-3 horas diarias para completar los críticos en 2 días, luego altos en 1-2 semanas.
