provider "railway" {
  token = var.railway_token
}

# Create Railway project
resource "railway_project" "main" {
  name = var.project_name
}

# PostgreSQL database service
resource "railway_service" "database" {
  project_id = railway_project.main.id
  name       = "${var.project_name}-db"
  service    = "postgres"
}

# Redis cache service (optional)
resource "railway_service" "redis" {
  project_id = railway_project.main.id
  name       = "${var.project_name}-cache"
  service    = "redis"
  env_vars = {
    REDIS_PASSWORD = "redis123"
  }
}

# Backend API service
resource "railway_service" "backend" {
  project_id = railway_project.main.id
  name       = "${var.project_name}-api"
  service    = "docker"
  repo       = "mayrafc/online-exam-platform"
  branch     = "main"
  root_dir   = "backend"

  env_vars = {
    ASPNETCORE_ENVIRONMENT            = "Production"
    ASPNETCORE_URLS                   = "http://0.0.0.0:$PORT"
    ConnectionStrings__DefaultConnection = "Host=${railway_service.database.id};Port=5432;Database=examplatform;Username=examuser;Password=exampass123"
    Jwt__Key                          = var.jwt_secret
    Jwt__Issuer                       = "OnlineExamPlatform"
    Jwt__Audience                     = "OnlineExamPlatformUsers"
    CORS__Origins                      = var.cors_origins
  }

  depends_on = [
    railway_service.database
  ]
}
