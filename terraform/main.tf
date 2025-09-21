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
}

# Servicio Redis  
resource "railway_service" "redis" {
  project_id = railway_project.main.id
  name       = "${var.project_name}-cache"
}

# Servicio Backend (.NET API)
resource "railway_service" "backend" {
  project_id = railway_project.main.id
  name       = "${var.project_name}-api"

  depends_on = [railway_service.database, railway_service.redis]
}