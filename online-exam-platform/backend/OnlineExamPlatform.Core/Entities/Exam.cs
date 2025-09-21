using System.ComponentModel.DataAnnotations;

namespace OnlineExamPlatform.Core.Entities
{
    public class Exam
    {
        public int Id { get; set; }
        
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;
        
        [MaxLength(1000)]
        public string Description { get; set; } = string.Empty;
        
        public int TimeLimit { get; set; } // in minutes
        
        public DateTime StartDate { get; set; }
        
        public DateTime EndDate { get; set; }
        
        public bool IsActive { get; set; } = true;
        
        public int CreatedBy { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public int MaxAttempts { get; set; } = 1;
        
        public bool ShuffleQuestions { get; set; } = false;
        
        public bool ShowResultsImmediately { get; set; } = true;
        
        // Navigation properties
        public User Creator { get; set; } = null!;
        public ICollection<Question> Questions { get; set; } = new List<Question>();
        public ICollection<ExamSubmission> Submissions { get; set; } = new List<ExamSubmission>();
        public ICollection<ExamAssignment> Assignments { get; set; } = new List<ExamAssignment>();
    }
}