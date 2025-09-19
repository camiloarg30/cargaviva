# CargaViva - MVP

Un marketplace web para conectar generadores de carga con transportistas.

## 🚀 Características

- **Interfaz moderna** con tema oscuro y glassmorphism
- **Autenticación completa** con Supabase
- **Gestión de cargas** (CRUD completo)
- **Subida de fotos** con preview
- **Actualizaciones en tiempo real**
- **Responsive design** para móviles y desktop
- **Notificaciones** integradas

## 🛠️ Tecnologías

- **HTML5** - Estructura
- **CSS3** - Estilos con variables CSS
- **JavaScript (Vanilla)** - Lógica de aplicación
- **Supabase** - Backend-as-a-Service
- **Inter Font** - Tipografía moderna

## 📁 Estructura del Proyecto

```
vanilla-mvp/
├── index.html          # Página principal
├── css/
│   ├── globals.css     # Variables CSS y estilos base
│   └── components.css  # Estilos de componentes
├── js/
│   ├── config.js       # Configuración de la aplicación
│   ├── supabase.js     # Cliente y operaciones de Supabase
│   ├── ui.js           # Gestión de interfaz de usuario
│   ├── loads.js        # Gestión de cargas
│   ├── storage.js      # Gestión de archivos
│   └── app.js          # Inicialización de la aplicación
└── README.md           # Esta documentación
```

## 🚀 Inicio Rápido

### 1. Configurar Supabase

1. Crear cuenta en [Supabase](https://supabase.com)
2. Crear nuevo proyecto
3. Obtener URL y clave anónima
4. Actualizar `js/config.js`:

```javascript
const CONFIG = {
  SUPABASE: {
    URL: 'tu-supabase-url',
    ANON_KEY: 'tu-anon-key'
  }
  // ... resto de configuración
};
```

### 2. Configurar Base de Datos

Ejecutar en el SQL Editor de Supabase:

```sql
-- Crear tabla de usuarios
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  role TEXT CHECK (role IN ('generator', 'transporter')),
  name TEXT,
  email TEXT UNIQUE,
  phone TEXT,
  company_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de cargas
CREATE TABLE cargas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  generador_id UUID REFERENCES users(id),
  origen TEXT NOT NULL,
  destino TEXT NOT NULL,
  tipo_mercancia TEXT NOT NULL,
  peso_kg NUMERIC NOT NULL,
  dimensiones JSONB,
  fecha_requerida DATE NOT NULL,
  tarifa_sugerida NUMERIC,
  requisitos TEXT,
  fotos_urls TEXT[],
  estado TEXT DEFAULT 'published' CHECK (estado IN ('draft', 'published', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Políticas RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cargas ENABLE ROW LEVEL SECURITY;

-- Políticas para usuarios
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Políticas para cargas
CREATE POLICY "Generators can CRUD own loads" ON cargas
  FOR ALL USING (auth.uid() = generador_id);

-- Storage bucket para fotos
INSERT INTO storage.buckets (id, name, public)
VALUES ('load-photos', 'load-photos', true);
```

### 3. Ejecutar la Aplicación

#### Opción A: Servidor Local Simple
```bash
cd vanilla-mvp
node -e "
const http = require('http');
const fs = require('fs');
const path = require('path');
const server = http.createServer((req, res) => {
  let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('File not found');
      return;
    }
    res.writeHead(200);
    res.end(data);
  });
});
server.listen(3000, () => console.log('Server running at http://localhost:3000'));
"
```

#### Opción B: Usar un servidor web
- Colocar archivos en un servidor web (Apache, Nginx, etc.)
- O usar extensiones de VS Code como "Live Server"

### 4. Acceder a la Aplicación

Abrir `http://localhost:3000` en el navegador.

## 📱 Uso de la Aplicación

### Para Generadores de Carga

1. **Registro/Inicio de Sesión**
   - Hacer clic en "Iniciar Sesión"
   - Crear cuenta o iniciar sesión

2. **Publicar Carga**
   - Hacer clic en "Nueva Carga"
   - Completar formulario:
     - Origen y destino
     - Tipo de mercancía
     - Peso y dimensiones
     - Fecha requerida
     - Tarifa sugerida (opcional)
     - Requisitos especiales (opcional)
     - Fotos de la carga (opcional, máximo 5)

3. **Gestionar Cargas**
   - Ver todas las cargas publicadas
   - Editar cargas existentes
   - Eliminar cargas
   - Ver detalles de cargas

## 🎨 Diseño del Sistema

### Colores
- **Primary**: `#007AFF` (Azul iOS)
- **Background**: Gradientes oscuros con glassmorphism
- **Text**: Blanco con diferentes opacidades
- **Semantic**: Verde (éxito), Rojo (error), Naranja (advertencia)

### Tipografía
- **Fuente**: Inter (Google Fonts)
- **Pesos**: 300, 400, 500, 600, 700
- **Escala**: De 0.75rem a 2.25rem

### Componentes
- **Glass Cards**: Efectos de vidrio con backdrop-filter
- **Buttons**: Primarios, secundarios y ghost
- **Forms**: Inputs modernos con focus states
- **Modals**: Overlays con animaciones
- **Notifications**: Toast messages

## 🔧 Desarrollo

### Arquitectura
- **UIManager**: Gestión de UI y eventos
- **SupabaseManager**: Cliente de base de datos
- **LoadsManager**: Gestión de cargas
- **StorageManager**: Gestión de archivos

### Patrones Implementados
- **Observer Pattern**: Para actualizaciones en tiempo real
- **Module Pattern**: Para organización del código
- **Factory Pattern**: Para creación de componentes
- **Singleton Pattern**: Para instancias globales

## 🚀 Despliegue

### Netlify
1. Conectar repositorio a Netlify
2. Configurar build settings:
   - Build command: (ninguno, archivos estáticos)
   - Publish directory: `/`
3. Agregar variables de entorno en Netlify:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### Vercel
1. Conectar repositorio a Vercel
2. Configurar proyecto como estático
3. Agregar variables de entorno

## 📊 Estado del Proyecto

### ✅ Completado
- [x] Estructura del proyecto
- [x] Diseño del sistema (CSS variables)
- [x] Autenticación con Supabase
- [x] Gestión de cargas (CRUD)
- [x] Subida de archivos
- [x] Actualizaciones en tiempo real
- [x] Diseño responsive
- [x] Notificaciones
- [x] Manejo de errores

### 🔄 Pendiente
- [ ] Integración con Make para notificaciones
- [ ] Optimizaciones de rendimiento
- [ ] Pruebas automatizadas
- [ ] Documentación de API

## 🐛 Solución de Problemas

### Error: "SupabaseManager is not defined"
- Verificar que `js/supabase.js` se carga antes que otros archivos JS
- Revisar que la instancia se crea correctamente al final del archivo

### Error: "UI is not defined"
- Verificar orden de carga de scripts en `index.html`
- Asegurar que `js/ui.js` se carga antes de archivos que lo usan

### Fotos no se suben
- Verificar configuración de Storage en Supabase
- Revisar permisos del bucket `load-photos`
- Verificar tamaño y tipo de archivo

### Problemas de conexión
- Verificar URL y clave de Supabase en `config.js`
- Revisar configuración de CORS en Supabase
- Verificar conexión a internet

## 📄 Licencia

Este proyecto es parte del curso de desarrollo web y está disponible para fines educativos.

---

**CargaViva** - Conectando cargas con oportunidades 🚛✨