# 🇨🇴 Colombia Comparte Sim
### Markov Simulation Dashboard

Simulación de Cadenas de Markov para modelar el comportamiento de usuarios en el programa Colombia Comparte. Construida con React + TypeScript + Vite.

🌐 **Demo en vivo:** https://colombia-comparte-sim-33b51.web.app

---

## 📋 Requisitos previos

Antes de instalar el proyecto necesitas tener instalado:

| Herramienta | Versión mínima | Descarga |
|---|---|---|
| Node.js | 18 o superior | https://nodejs.org |
| npm | viene con Node.js | — |
| Firebase CLI | última versión | ver abajo |

---

## 🚀 Instalación

### 1. Clonar el proyecto

```bash
git clone https://github.com/JuanDiegoVel/colombia-comparte-sim.git
cd colombia-comparte-sim
```

### 2. Instalar dependencias

```bash
npm install
```

Esto instala automáticamente todas las librerías del proyecto:

- **React 19** — interfaz de usuario
- **TypeScript** — tipado estático
- **Vite** — bundler y servidor de desarrollo
- **Recharts** — gráficas y visualizaciones
- **Tailwind CSS** — estilos
- **Motion** — animaciones
- **Lucide React** — íconos
- **XLSX** — exportación a Excel
- **clsx / tailwind-merge** — utilidades de clases CSS

### 3. Instalar tipos de TypeScript para React

```bash
npm i --save-dev @types/react @types/react-dom
```

### 4. Configurar variables de entorno

Copia el archivo de ejemplo y edítalo:

```bash
cp .env.example .env
```

Edita `.env` con tus valores:

```dotenv
APP_URL="http://localhost:3000"
```

---

## 💻 Correr en desarrollo

```bash
npm run dev
```

La app estará disponible en: `http://localhost:3000`

---

## 🏗️ Build para producción

```bash
npm run build
```

Genera la carpeta `dist/` con los archivos listos para subir.

---

## 🌐 Deploy en Firebase Hosting

### Instalar Firebase CLI

```bash
npm install -g firebase-tools
```

### Iniciar sesión

```bash
firebase login
```

### Inicializar hosting (solo la primera vez)

```bash
firebase init hosting
```

Responder así:
- **Public directory:** `dist`
- **Single-page app:** `Yes`
- **Automatic builds with GitHub:** `No`

### Subir a producción

```bash
npm run build
firebase deploy
```

La app queda disponible en: `https://colombia-comparte-sim-33b51.web.app`

---

## 📁 Estructura del proyecto

```
colombia-comparte-sim/
├── public/
│   └── Logo.png                  # Logo de Colombia Comparte
├── src/
│   ├── lib/
│   │   └── simulation.ts         # Lógica de Cadenas de Markov
│   ├── App.tsx                   # Componente principal y dashboard
│   ├── main.tsx                  # Punto de entrada
│   ├── index.css                 # Estilos globales
│   ├── simulation.worker.ts      # Web Worker para simulaciones grandes
│   └── vite-env.d.ts             # Tipos para Vite
├── .env.example                  # Variables de entorno de ejemplo
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🧮 Equivalencias tecnológicas

| Python | Este proyecto |
|---|---|
| NumPy | `simulation.ts` con arreglos TypeScript y `Math.random()` |
| Pandas | Objetos e interfaces TypeScript para matrices |
| Matplotlib / Seaborn | Recharts |
| Streamlit | React + Tailwind CSS |

---

## 📊 Funcionalidades

- **Dashboard** — 5 KPIs: éxito, abandono, fallo técnico, pasos promedio y seguimiento
- **Estados** — tabla completa de los 32 estados del sistema con código, nombre, descripción y tipo
- **Recorridos Base** — dataset histórico de 63 rutas predefinidas
- **Matrices** — matriz de conteos y matriz de probabilidades de transición
- **Mejoras** — análisis de estados críticos y propuestas de mejora
- **Exportar a Excel** — descarga las matrices y resultados de simulación en 3 hojas
- **Modo oscuro** — interfaz adaptable
- **Responsive** — funciona en móvil, tablet y desktop
- **Web Worker** — simulaciones de hasta 100,000 usuarios sin bloquear el navegador

---

## 🔄 Actualizar el proyecto

Cuando hagas cambios:

```bash
git add .
git commit -m "descripción del cambio"
git push
```

Para actualizar Firebase:

```bash
npm run build
firebase deploy
```

---

## 📝 Notas

- El archivo `.env` **nunca** se sube a GitHub (está en `.gitignore`)
- El límite máximo de pasos por simulación es **20**
- El límite máximo de usuarios simulados es **100,000**
- El plan gratuito de Firebase (Spark) es suficiente para esta app
