# InventoryPro - Sistema de Gestión de Inventario y Restaurante

Sistema completo de punto de venta con gestión de inventario, carrito de compras y administración de mesas de restaurante.

## 🚀 Características

### 📦 Gestión de Productos
- **Inventario en tiempo real** con control de stock
- **Carrito de compra** interactivo con drag & drop
- Búsqueda y filtrado de productos
- Control automático de cantidades disponibles
- Cálculo de totales en tiempo real

### 🍽️ Gestión de Restaurante
- **Visualización de mesas** con estados (Disponible, Ocupada, Reservada)
- **Menú digital** organizado por categorías
- Sistema de pedidos por mesa
- Gestión de órdenes en tiempo real
- Cálculo automático de cuentas

### 🎨 Diseño
- Paleta de colores **Crevasse** (Teal, Mint, Navy, Gray)
- Interfaz moderna y transparente con efectos de blur
- Totalmente responsive
- Animaciones suaves y feedback visual

## 🛠️ Tecnologías

- **Next.js 15** - Framework React
- **React 18** - Biblioteca UI
- **TypeScript** - Tipado estático
- **Tailwind CSS 4** - Estilos
- **Radix UI** - Componentes accesibles
- **Pragmatic Drag and Drop** - Funcionalidad drag & drop
- **Lucide React** - Iconos

## 📋 Requisitos Previos

- Node.js 18+ o superior
- npm, pnpm o yarn

## 🔧 Instalación

1. Clona el repositorio:
```bash
git clone <tu-repositorio>
cd puntoventa
```

2. Instala las dependencias:
```bash
npm install --legacy-peer-deps
# o
pnpm install
# o
yarn install
```

3. Ejecuta el servidor de desarrollo:
```bash
npm run dev
# o
pnpm dev
# o
yarn dev
```

4. Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📁 Estructura del Proyecto

```
puntoventa/
├── app/
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   ├── products/      # Gestión de productos
│   │   │   ├── restaurant/    # Gestión de restaurante
│   │   │   ├── sales/         # Ventas
│   │   │   ├── purchases/     # Compras
│   │   │   ├── clients/       # Clientes
│   │   │   ├── invoices/      # Facturas
│   │   │   └── reports/       # Reportes
│   │   └── layout.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ui/                    # Componentes UI base
│   ├── app-sidebar.tsx        # Sidebar de navegación
│   ├── products-sections.tsx  # Sistema de inventario/carrito
│   └── restaurant-tables.tsx  # Sistema de mesas
├── lib/
│   └── utils.ts
└── public/
```

## 🎯 Funcionalidades Principales

### Sistema de Productos
- Arrastra productos del inventario al carrito
- Ajusta cantidades con botones +/-
- Elimina productos del carrito
- Procesa compras con cálculo automático

### Sistema de Restaurante
- 3 mesas configurables (2 de 3 asientos, 1 de 5 asientos)
- Menú con 4 categorías: Entradas, Platos Principales, Bebidas, Postres
- Gestión de pedidos por mesa
- Cambio de estado de mesas
- Cierre de cuentas

## 🎨 Paleta de Colores Crevasse

- **Teal**: `#159A9C` - Color principal
- **Mint**: `#DEEFE7` - Fondos suaves
- **Navy**: `#002333` - Textos
- **Gray**: `#B4BEC9` - Bordes y elementos secundarios
- **White**: `#FFFFFF` - Fondos

## 📝 Scripts Disponibles

```bash
npm run dev      # Inicia el servidor de desarrollo
npm run build    # Construye la aplicación para producción
npm run start    # Inicia el servidor de producción
npm run lint     # Ejecuta el linter
```

## 🚀 Despliegue

El proyecto está optimizado para desplegarse en [Vercel](https://vercel.com):

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno si es necesario
3. Despliega automáticamente

## 📄 Licencia

Este proyecto es privado y de uso interno.

## 👥 Autor

Desarrollado con ❤️ para gestión de inventario y restaurante.
