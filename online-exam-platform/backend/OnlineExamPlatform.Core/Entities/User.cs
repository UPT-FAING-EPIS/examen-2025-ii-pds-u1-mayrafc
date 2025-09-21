using System.ComponentModel.DataAnnotations;

namespace OnlineExamPlatform.Core.Entities
{
    public class User
    {
        public int Id { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string FirstName { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(100)]
        public string LastName { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(100)]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(255)]
        public string PasswordHash { get; set; } = string.Empty;
        
        public UserRole Role { get; set; } = UserRole.Student;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public bool IsActive { get; set; } = true;
        
        // Navigation properties
        public ICollection<Exam> CreatedExams { get; set; } = new List<Exam>();
        public ICollection<ExamSubmission> Submissions { get; set; } = new List<ExamSubmission>();
        public ICollection<ExamAssignment> AssignedExams { get; set; } = new List<ExamAssignment>();
    }

    public enum UserRole
    {
        Student = 1,
        Teacher = 2,
        Admin = 3
    }
}