# RENTALS-FRONT

Frontend del sistema de alquileres (React + Vite + TypeScript + Tailwind).

## Features
- Gestión de inquilinos y pagos
- Consulta de recibos (pre-signed URL)
- Integración con backend (`RENTALS-BACK`) y pagos (`RENTALS-SDK`)
- UI moderna y responsive con Tailwind CSS

## Tech stack
- React 18 + Vite + TypeScript
- Tailwind CSS + Headless UI
- React Router v6
- React Query (TanStack Query)
- Axios para HTTP requests
- S3 + CloudFront para hosting
- GitHub Actions (CI/CD)

## Local development

### Prerequisites
- Node.js 18+
- npm o yarn

### Setup
```bash
# Clone and setup
git clone <repo-url>
cd RENTALS-FRONT

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Edit .env.local with your values
```

### Environment variables (.env.local)
```bash
# API URLs
VITE_API_BASE_URL=http://localhost:8000
VITE_PAYMENTS_API_BASE_URL=http://localhost:8001

# App configuration
VITE_APP_TITLE=RENTALS System
VITE_APP_VERSION=1.0.0
```

### Run locally
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## Scripts disponibles

```bash
npm run dev          # Desarrollo local
npm run build        # Build de producción
npm run preview      # Preview del build
npm run lint         # Linting con ESLint
npm run type-check   # Verificación de tipos TypeScript
```

## Estructura del proyecto

```
src/
├── app/                 # Configuración de la app
│   ├── router.tsx      # Configuración de rutas
│   └── api.ts          # Configuración de API
├── pages/              # Páginas principales
│   ├── DebtorsList.tsx # Lista de deudores
│   ├── PaymentsList.tsx # Lista de pagos
│   ├── PaymentNew.tsx  # Nuevo pago
│   └── PaymentDetail.tsx # Detalle de pago
├── components/         # Componentes reutilizables
│   ├── Table.tsx      # Tabla genérica
│   ├── Form.tsx       # Formulario genérico
│   └── Toast.tsx      # Notificaciones
├── hooks/             # Custom hooks
├── services/          # Servicios de API
├── types/             # Tipos TypeScript
└── utils/             # Utilidades
```

## Deploy

### Branches → Environments
- `develop` → `dev`
- `release/*` → `cert`
- `main` → `prod`

### Manual deploy
```bash
# Build
npm run build

# Deploy a S3
aws s3 sync dist/ s3://rentals-frontend-dev --delete

# Invalidar CloudFront
aws cloudfront create-invalidation --distribution-id E123456789 --paths "/*"
```

### CI/CD (GitHub Actions)
Automatically deploys on push to protected branches using OIDC authentication.

## Características de la UI

- **Responsive**: Optimizado para móvil y desktop
- **Accesible**: Cumple estándares WCAG
- **Dark/Light mode**: Soporte para temas
- **Componentes**: Biblioteca de componentes reutilizables
- **Formularios**: Validación en tiempo real
- **Notificaciones**: Sistema de toast notifications
- **Loading states**: Estados de carga para mejor UX

## Integración con APIs

### RENTALS-BACK
- CRUD de debtors, units, leases, payments
- Generación y visualización de recibos
- Reportes y exportación de datos

### RENTALS-SDK
- Checkout de pagos cripto
- Estado de transacciones
- Webhooks de confirmación

## Performance

- **Code splitting**: Lazy loading de rutas
- **Bundle optimization**: Tree shaking y minificación
- **Image optimization**: Lazy loading de imágenes
- **Caching**: React Query para cache de datos
- **PWA ready**: Service worker para offline

## Testing

```bash
npm run test          # Tests unitarios
npm run test:e2e      # Tests end-to-end
npm run test:coverage # Coverage report
```

## Contribución

1. Fork del repositorio
2. Crear feature branch (`git checkout -b feature/amazing-feature`)
3. Commit de cambios (`git commit -m 'Add amazing feature'`)
4. Push al branch (`git push origin feature/amazing-feature`)
5. Abrir Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT.
