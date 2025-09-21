output "project_id" {
  description = "Railway project ID"
  value       = railway_project.main.id
}

output "database_service_id" {
  description = "Database service ID"
  value       = railway_service.database.id
}

output "redis_service_id" {
  description = "Redis service ID"
  value       = railway_service.redis.id
}

output "backend_service_id" {
  description = "Backend service ID"
  value       = railway_service.backend.id
}