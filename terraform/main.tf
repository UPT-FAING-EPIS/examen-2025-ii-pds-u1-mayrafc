provider "railway" {
  token = var.railway_token
}

# Crear proyecto Railway
resource "railway_project" "main" {
  name = var.project_name
}

# Servicio PostgreSQL
resource "railway_service" "database" {
  project_id = railway_project.main.id
  name       = "${var.project_name}-db"

  environment = {
    POSTGRES_DB       = "examplatform"
    POSTGRES_USER     = "examuser"
    POSTGRES_PASSWORD = "exampass123"
  }
}

# Servicio Redis
resource "railway_service" "redis" {
  project_id = railway_project.main.id
  name       = "${var.project_name}-cache"

  environment = {
    REDIS_PASSWORD = "redis123"
  }
}

# Servicio Backend (.NET API)
resource "railway_service" "backend" {
  project_id     = railway_project.main.id
  name           = "${var.project_name}-api"
  repo           = "your-github-username/online-exam-platform"
  branch         = "main"
  root_directory = "backend"

  environment = {
    ASPNETCORE_ENVIRONMENT              = "Production"
    ASPNETCORE_URLS                      = "http://0.0.0.0:$PORT"
    ConnectionStrings__DefaultConnection = "Host=${railway_service.database.private_domain};Port=5432;Database=examplatform;Username=examuser;Password=exampass123"
    Jwt__Key                             = var.jwt_secret
    Jwt__Issuer                          = "OnlineExamPlatform"
    Jwt__Audience                        = "OnlineExamPlatformUsers"
    CORS__Origins                        = var.cors_origins
  }

  depends_on = [railway_service.database]
}