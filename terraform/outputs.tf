output "project_id" {
  description = "Railway project ID"
  value       = railway_project.main.id
}

output "database_url" {
  description = "Database connection URL"
  value       = "postgresql://examuser:exampass123@${railway_service.database.id}:5432/examplatform"
  sensitive   = true
}

output "backend_url" {
  description = "Backend API URL"
  value       = railway_service.backend.domains[0]
}

output "redis_url" {
  description = "Redis connection URL"
  value       = "redis://default:redis123@${railway_service.redis.id}:6379"
  sensitive   = true
}
