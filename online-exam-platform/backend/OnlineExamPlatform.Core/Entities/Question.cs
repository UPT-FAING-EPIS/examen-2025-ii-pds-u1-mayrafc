using System.ComponentModel.DataAnnotations;

namespace OnlineExamPlatform.Core.Entities
{
    public class Question
    {
        public int Id { get; set; }
        
        public int ExamId { get; set; }
        
        [Required]
        [MaxLength(1000)]
        public string Text { get; set; } = string.Empty;
        
        public QuestionType Type { get; set; }
        
        public int Order { get; set; }
        
        public int Points { get; set; } = 1;
        
        public bool IsRequired { get; set; } = true;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public Exam Exam { get; set; } = null!;
        public ICollection<QuestionOption> Options { get; set; } = new List<QuestionOption>();
        public ICollection<Answer> Answers { get; set; } = new List<Answer>();
    }

    public enum QuestionType
    {
        MultipleChoice = 1,
        TrueFalse = 2,
        OpenEnded = 3
    }
}