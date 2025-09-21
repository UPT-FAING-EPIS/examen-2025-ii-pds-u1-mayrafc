# Online Exam Platform 🎓
[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/A-aUFMBb)
[![Open in Codespaces](https://classroom.github.com/assets/launch-codespace-2972f46106e565e64193e422d61a12cf1da4916b45550586e14ef0a7c637dd04.svg)](https://classroom.github.com/open-in-codespaces?assignment_repo_id=20617031)


Una plataforma web completa para la creación, gestión y realización de exámenes en línea, desarrollada con **.NET 8**, **React 18** y **PostgreSQL**.


## ✨ Funcionalidades

### Para Estudiantes
- 📚 Visualizar exámenes asignados
- ⏰ Realizar exámenes con temporizador
- 📊 Ver resultados y historial de intentos
- 🔄 Navegación entre preguntas durante el examen

### Para Docentes
- 📝 Crear y editar exámenes
- ❓ Gestionar banco de preguntas (Opción múltiple, Verdadero/Falso, Abiertas)
- 👥 Asignar exámenes a estudiantes específicos
- 📈 Revisar resultados y generar reportes
- ⚙️ Configurar tiempo límite y número de intentos

### Características del Sistema
- 🔐 Autenticación JWT segura
- 📱 Interfaz responsive con Material-UI
- 🚀 Calificación automática
- 💾 Guardado automático de respuestas
- 🔒 Validación de permisos por roles

## 🏗️ Arquitectura

### Backend (.NET 8)
```
OnlineExamPlatform/
├── OnlineExamPlatform.API/          # Web API Controllers
├── OnlineExamPlatform.Core/         # Entidades de dominio
├── OnlineExamPlatform.Infrastructure/ # Repositorios y DbContext
└── OnlineExamPlatform.Tests/        # Pruebas unitarias
```

### Frontend (React 18 + TypeScript)
```
frontend/
├── src/
│   ├── components/     # Componentes React
│   ├── services/       # Servicios API
│   ├── contexts/       # Context de autenticación
│   ├── types/          # Definiciones TypeScript
│   └── utils/          # Utilidades
└── public/
```

### Infraestructura
- **Base de datos**: PostgreSQL 15
- **Cache**: Redis 7
- **Hosting Backend**: Railway
- **Hosting Frontend**: GitHub Pages
- **CI/CD**: GitHub Actions

## 🚀 Endpoints API

### Autenticación
```
POST   /api/auth/login       # Iniciar sesión
POST   /api/auth/register    # Registrar usuario
GET    /api/auth/me          # Obtener usuario actual
```
