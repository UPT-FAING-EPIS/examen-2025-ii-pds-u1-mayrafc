# Provider configuration
terraform {
  required_version = ">= 1.0"
  required_providers {
    railway = {
      source  = "terraform-community-providers/railway"
      version = "~> 0.3.0"
    }
  }
}

provider "railway" {
  token = var.railway_token
}

# Create Railway project
resource "railway_project" "main" {
  name = var.project_name
}

# PostgreSQL Database Service
resource "railway_service" "database" {
  project_id = railway_project.main.id
  name       = "${var.project_name}-db"

  # Railway services are created with specific templates
  # For PostgreSQL, we need to use the template approach
  source_template = "postgres"

  # Environment variables for the service
  environment = {
    POSTGRES_DB       = "examplatform"
    POSTGRES_USER     = "examuser"
    POSTGRES_PASSWORD = "exampass123"
  }
}

# Redis Cache Service
resource "railway_service" "redis" {
  project_id = railway_project.main.id
  name       = "${var.project_name}-cache"

  # For Redis, we also use template approach
  source_template = "redis"

  environment = {
    REDIS_PASSWORD = "redis123"
  }
}

# Backend API Service (.NET)
resource "railway_service" "backend" {
  project_id = railway_project.main.id
  name       = "${var.project_name}-api"

  # For custom applications, we connect to GitHub repo
  source_repo = "your-github-username/online-exam-platform"
  branch      = "main"
  root_directory = "backend"

  environment = {
    ASPNETCORE_ENVIRONMENT              = "Production"
    ASPNETCORE_URLS                     = "http://0.0.0.0:$PORT"
    ConnectionStrings__DefaultConnection = "Host=${railway_service.database.private_domain};Port=5432;Database=examplatform;Username=examuser;Password=exampass123"
    Jwt__Key                            = var.jwt_secret
    Jwt__Issuer                         = "OnlineExamPlatform"
    Jwt__Audience                       = "OnlineExamPlatformUsers"
    CORS__Origins                       = var.cors_origins
  }

  depends_on = [railway_service.database]
}