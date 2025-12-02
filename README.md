# MisGastos App

Una aplicación móvil desarrollada con Ionic y Angular para gestionar gastos e ingresos personales de manera eficiente.

## 📱 Características

- ✅ Registro de ingresos y gastos
- ✅ Categorización de transacciones
- ✅ Balance general y filtrado por períodos
- ✅ Búsqueda de transacciones
- ✅ Interfaz moderna con diseño glassmórfico
- ✅ Persistencia local de datos
- ✅ Autenticación de usuarios con EmailJS
- ✅ Sistema de recuperación de contraseña
- ✅ Diseño responsive

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js (v14 o superior)
- npm (v6 o superior)
- Ionic CLI
- Angular CLI

```bash
# Instalar Ionic CLI globalmente
npm install -g @ionic/cli @angular/cli
```

### Instalación

1. Clonar el repositorio
```bash
git clone https://github.com/zetdev0612/misgastos-app.git
cd misgastos-app
```

2. Instalar dependencias
```bash
npm install
```

3. Iniciar servidor de desarrollo
```bash
ionic serve
```

La aplicación estará disponible en `http://localhost:8100`

## 🔑 Credenciales de Prueba

Para probar la aplicación, puedes usar las siguientes credenciales:

- Email: test@example.com
- Contraseña: password

## 🛠️ Tecnologías Utilizadas

- **Ionic Framework 8** - Framework móvil
- **Angular 20** - Framework front-end
- **TypeScript** - Lenguaje de programación
- **SCSS** - Estilos avanzados
- **Capacitor 7** - Acceso a APIs nativas
- **LocalStorage/Preferences** - Persistencia de datos local
- **EmailJS** - Servicio de correos para recuperación de contraseña
- **RxJS** - Manejo reactivo de estado

## 📱 Capacidades

La aplicación permite:

- Registrar transacciones (ingresos y gastos)
- Categorizar movimientos
- Ver balance general
- Filtrar por períodos (día, semana, mes, todo)
- Buscar transacciones
- Editar y eliminar movimientos

## 📁 Estructura del Proyecto

```
src/app/
├── pages/                    # Páginas principales
│   ├── login/               # Página de inicio de sesión
│   ├── registro/            # Página de registro
│   ├── recuperar-password/  # Recuperación de contraseña
│   ├── reset-password/      # Reseteo de contraseña
│   ├── home/                # Dashboard principal
│   └── categorias/          # Gestión de categorías
├── services/                # Servicios
│   ├── auth.ts             # Autenticación
│   ├── categoria.ts        # Gestión de categorías
│   ├── transaccion.ts      # Gestión de transacciones
│   └── email.service.ts    # Envío de correos
├── guards/                  # Guards de rutas
│   └── auth.guard.ts       # Protección de rutas
├── models/                  # Modelos de datos
├── components/              # Componentes reutilizables
└── config/                  # Configuración
```

## 💅 Diseño

La interfaz utiliza un moderno diseño glassmórfico con:

- Efectos de cristal (glassmorphism)
- Gradientes modernos
- Animaciones suaves
- Diseño responsive
- Modo claro/oscuro (próximamente)

## 🔄 Estado del Proyecto

El proyecto está completado con todas las funcionalidades principales implementadas:

- [x] Autenticación de usuarios
- [x] Sistema de recuperación de contraseña
- [x] Registro de ingresos y gastos
- [x] Categorización de transacciones
- [x] Balance general
- [x] Filtrado por períodos
- [x] Búsqueda de transacciones
- [x] Gestión de categorías
- [x] Persistencia de datos local
- [x] Diseño glassmórfico
- [x] Interfaz responsive

### Futuras mejoras:
- [ ] Sincronización en la nube
- [ ] Reportes y estadísticas avanzadas
- [ ] Modo oscuro
- [ ] Notificaciones push
- [ ] Exportación de datos (CSV, PDF)
- [ ] Gráficos y visualización de datos

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para más detalles.

## ✨ Contribuir

Las contribuciones son bienvenidas. Por favor, abre un issue primero para discutir los cambios que te gustaría hacer.

1. Fork el proyecto
2. Crea tu rama de características (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request
