provider "railway" {
  token = var.railway_token
}

# Create Railway project
resource "railway_project" "main" {
  name = var.project_name
}

# PostgreSQL database service
resource "railway_service" "database" {
  name       = "${var.project_name}-db"
  project_id = railway_project.main.id
  
  source {
    image = "postgres:15"
  }

  variables = {
    POSTGRES_DB       = "examplatform"
    POSTGRES_USER     = "examuser"
    POSTGRES_PASSWORD = "exampass123"
    PGDATA           = "/var/lib/postgresql/data/pgdata"
  }

  volumes = [
    {
      mount_path = "/var/lib/postgresql/data"
      size       = 1 # 1GB
    }
  ]
}

# Backend API service
resource "railway_service" "backend" {
  name       = "${var.project_name}-api"
  project_id = railway_project.main.id
  
  source {
    repo = "your-github-username/online-exam-platform"
    branch = "main"
    root_directory = "backend"
  }

  variables = {
    ASPNETCORE_ENVIRONMENT = "Production"
    ASPNETCORE_URLS       = "http://0.0.0.0:$PORT"
    ConnectionStrings__DefaultConnection = "Host=${railway_service.database.private_domain};Port=5432;Database=examplatform;Username=examuser;Password=exampass123"
    Jwt__Key      = var.jwt_secret
    Jwt__Issuer   = "OnlineExamPlatform"
    Jwt__Audience = "OnlineExamPlatformUsers"
    CORS__Origins = var.cors_origins
  }

  depends_on = [railway_service.database]
}

# Redis cache service (optional)
resource "railway_service" "redis" {
  name       = "${var.project_name}-cache"
  project_id = railway_project.main.id
  
  source {
    image = "redis:7-alpine"
  }

  variables = {
    REDIS_PASSWORD = "redis123"
  }
}