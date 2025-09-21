variable "railway_token" {
  description = "Railway API token"
  type        = string
  sensitive   = true
}

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "online-exam-platform"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "jwt_secret" {
  description = "JWT secret key"
  type        = string
  sensitive   = true
  default     = "your-super-secret-jwt-key-change-in-production"
}

variable "cors_origins" {
  description = "CORS allowed origins"
  type        = string
  default     = "https://mayrafc.github.io"
}
