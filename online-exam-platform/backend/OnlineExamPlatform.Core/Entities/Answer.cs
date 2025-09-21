using System.ComponentModel.DataAnnotations;

namespace OnlineExamPlatform.Core.Entities
{
    public class Answer
    {
        public int Id { get; set; }
        
        public int SubmissionId { get; set; }
        
        public int QuestionId { get; set; }
        
        public int? SelectedOptionId { get; set; }
        
        [MaxLength(2000)]
        public string? TextAnswer { get; set; }
        
        public bool? IsCorrect { get; set; }
        
        public int? Points { get; set; }
        
        public DateTime AnsweredAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public ExamSubmission Submission { get; set; } = null!;
        public Question Question { get; set; } = null!;
        public QuestionOption? SelectedOption { get; set; }
    }
}