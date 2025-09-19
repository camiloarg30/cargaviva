# CargaViva - Plataforma de Matching de Cargas

Una aplicación web moderna para conectar generadores de carga con transportistas en Colombia, reduciendo viajes en vacío y optimizando la logística.

## 🚀 Características

- ✅ **Autenticación OTP** por email
- ✅ **Dashboard responsivo** para móviles
- ✅ **Publicación de cargas** con validación
- ✅ **Sistema de asignaciones** de transportistas
- ✅ **Documentos y evidencias** con subida de archivos
- ✅ **Notificaciones en tiempo real**
- ✅ **Interfaz iOS-style** minimalista

## 🛠️ Tecnologías

- **Frontend**: React + TypeScript + Vite
- **Backend**: Supabase (Auth + Database + Storage + Realtime)
- **Estilos**: CSS Variables + Design System
- **Despliegue**: Netlify/Vercel

## 📱 Instalación y Desarrollo

### Prerrequisitos

- Node.js 18+
- npm o yarn
- Cuenta de Supabase

### Instalación

```bash
# Clonar el repositorio
git clone <tu-repositorio>
cd cargaviva

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de Supabase
```

### Desarrollo Local

```bash
# Iniciar servidor de desarrollo
npm run dev

# Construir para producción
npm run build

# Vista previa de producción
npm run preview
```

## 🚀 Despliegue en Netlify

### Opción 1: Despliegue Automático (Recomendado)

1. **Sube tu código a GitHub/GitLab**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Ve a [netlify.com](https://netlify.com)** y regístrate

3. **Conecta tu repositorio**:
   - Clic en "New site from Git"
   - Selecciona tu proveedor Git
   - Autoriza acceso a tu repositorio
   - Selecciona el repositorio `cargaviva`

4. **Configuración de build**:
   - **Branch**: `main` (o tu branch principal)
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`

5. **Variables de entorno** (Environment variables):
   ```
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-anon-key
   ```

6. **Deploy**: Clic en "Deploy site"

### Opción 2: Despliegue Manual

1. **Construir localmente**:
   ```bash
   npm run build
   ```

2. **Subir carpeta `dist`**:
   - Ve a [netlify.com](https://netlify.com)
   - Arrastra la carpeta `dist` al área de drop
   - ¡Listo!

## 🔧 Configuración de Supabase

### 1. Crear Proyecto

1. Ve a [supabase.com](https://supabase.com)
2. Crea un nuevo proyecto
3. Espera a que se configure

### 2. Configurar Base de Datos

Ejecuta estos comandos en el SQL Editor de Supabase:

```sql
-- Crear tablas
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  role TEXT CHECK (role IN ('generator', 'transporter')) NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company_name TEXT,
  vehicle_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE cargas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  generador_id UUID REFERENCES users(id) NOT NULL,
  origen TEXT NOT NULL,
  destino TEXT NOT NULL,
  tipo_mercancia TEXT NOT NULL,
  peso_kg DECIMAL NOT NULL,
  dimensiones JSONB,
  fecha_requerida TIMESTAMP WITH TIME ZONE NOT NULL,
  estado TEXT CHECK (estado IN ('published', 'assigned', 'in_transit', 'delivered', 'cancelled')) DEFAULT 'published',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE asignaciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  carga_id UUID REFERENCES cargas(id) NOT NULL,
  transportista_id UUID REFERENCES users(id) NOT NULL,
  tarifa DECIMAL,
  estado TEXT CHECK (estado IN ('pending', 'accepted', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
  accepted_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(carga_id, transportista_id)
);

CREATE TABLE documentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  carga_id UUID REFERENCES cargas(id) NOT NULL,
  tipo TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  uploaded_by UUID REFERENCES users(id) NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE notificaciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) NOT NULL,
  canal TEXT CHECK (canal IN ('whatsapp', 'telegram', 'email', 'in_app')) NOT NULL,
  template TEXT NOT NULL,
  payload JSONB NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE
);

-- Políticas RLS simples
CREATE POLICY "users_simple" ON users FOR ALL USING (auth.uid() = id);
CREATE POLICY "cargas_simple_select" ON cargas FOR SELECT USING (auth.uid() = generador_id);
CREATE POLICY "cargas_simple_insert" ON cargas FOR INSERT WITH CHECK (auth.uid() = generador_id);
CREATE POLICY "cargas_simple_update" ON cargas FOR UPDATE USING (auth.uid() = generador_id);
CREATE POLICY "asignaciones_simple" ON asignaciones FOR ALL USING (auth.uid() = transportista_id);
CREATE POLICY "documentos_simple" ON documentos FOR ALL USING (auth.uid() = uploaded_by);
CREATE POLICY "notificaciones_simple" ON notificaciones FOR ALL USING (auth.uid() = user_id);

-- Habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cargas ENABLE ROW LEVEL SECURITY;
ALTER TABLE asignaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;
```

### 3. Configurar Autenticación

1. Ve a **Authentication → Settings**
2. Habilita **Email authentication**
3. Configura **Site URL** con tu dominio de Netlify

### 4. Obtener Credenciales

1. Ve a **Settings → API**
2. Copia:
   - **Project URL**
   - **anon/public key**

## 📱 Uso de la Aplicación

### Para Generadores de Carga:
1. Regístrate como generador
2. Publica cargas con detalles completos
3. Recibe notificaciones de transportistas interesados
4. Gestiona documentos y seguimiento

### Para Transportistas:
1. Regístrate como transportista
2. Explora cargas disponibles
3. Acepta asignaciones
4. Sube evidencias de entrega

## 🎨 Diseño

- **Tema Generador**: Fondo oscuro, acentos azules
- **Tema Transportista**: Fondo claro, sidebar, acentos verdes
- **Mobile-first**: Optimizado para móviles
- **iOS-style**: Interfaz minimalista y moderna

## 📊 Estado del Proyecto

- ✅ **Autenticación completa**
- ✅ **Dashboard funcional**
- ✅ **Publicación de cargas**
- ✅ **Sistema de asignaciones**
- ✅ **Documentos y evidencias**
- ✅ **Interfaz responsive**
- ✅ **Despliegue configurado**

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 📞 Contacto

Para preguntas o soporte, abre un issue en el repositorio.

---

**¡CargaViva - Conectando cargas, moviendo Colombia! 🇨🇴**
