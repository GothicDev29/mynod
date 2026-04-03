# MyNod — Fast polls. Real answers.

Plataforma de encuestas en tiempo real para equipos, comunidades y eventos. Crea una encuesta en segundos, compártela con un link y ve los resultados actualizarse en vivo.

---

## Stack

| Tecnología | Uso |
|---|---|
| **Next.js 15** | Framework principal con App Router |
| **TypeScript** | Tipado estático en todo el proyecto |
| **Tailwind CSS** | Estilos utilitarios |
| **PostgreSQL** | Base de datos principal |
| **Redis** | Caché y pub/sub para tiempo real |
| **Dokploy** | Despliegue y gestión de infraestructura |

---

## Estructura del Proyecto

```
mynod/
├── app/          # Rutas, páginas y layouts (App Router de Next.js)
├── components/   # Componentes React reutilizables
├── lib/          # Utilidades, clientes de BD, helpers
├── types/        # Definiciones de tipos TypeScript compartidos
└── public/       # Archivos estáticos (imágenes, íconos, fuentes)
```

---

## Requisitos Previos

- **Node.js** 18 o superior
- **npm** 9 o superior

---

## Desarrollo Local

```bash
# 1. Clonar el repositorio
git clone https://github.com/Juliuuslm/mynod.git
cd mynod

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Edita .env.local con tus credenciales locales

# 4. Iniciar el servidor de desarrollo
npm run dev
```

La app estará disponible en [http://localhost:3000](http://localhost:3000).

---

## Flujo de Git

```
main        → Producción. Solo recibe merges desde develop (pull requests).
develop     → Rama de integración. Todo el trabajo se une aquí antes de ir a main.
feature/*   → Ramas de trabajo. Una por feature o tarea.
```

### Ejemplo de trabajo diario

```bash
git checkout develop
git pull origin develop
git checkout -b feature/mi-nueva-feature
# ... trabajas ...
git push origin feature/mi-nueva-feature
# Abre un Pull Request hacia develop en GitHub
```

---

## Equipo

| Persona | Rol |
|---|---|
| **Julio** | Co-fundador / Desarrollo |
| **Gothic4** | Co-fundador / Desarrollo |

---

## Cómo Contribuir

1. Haz fork del repositorio
2. Crea una rama desde `develop`: `git checkout -b feature/tu-feature`
3. Haz tus cambios y commitea con mensajes claros
4. Abre un Pull Request hacia `develop`
5. Espera revisión antes del merge

---

## Licencia

MIT © 2026 MyNod
