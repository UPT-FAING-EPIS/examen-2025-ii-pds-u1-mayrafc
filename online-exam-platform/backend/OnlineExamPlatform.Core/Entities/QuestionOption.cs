using System.ComponentModel.DataAnnotations;

namespace OnlineExamPlatform.Core.Entities
{
    public class QuestionOption
    {
        public int Id { get; set; }
        
        public int QuestionId { get; set; }
        
        [Required]
        [MaxLength(500)]
        public string Text { get; set; } = string.Empty;
        
        public bool IsCorrect { get; set; } = false;
        
        public int Order { get; set; }
        
        // Navigation property
        public Question Question { get; set; } = null!;
    }
}