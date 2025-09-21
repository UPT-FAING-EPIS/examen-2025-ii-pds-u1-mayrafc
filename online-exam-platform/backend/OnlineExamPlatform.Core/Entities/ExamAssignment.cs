namespace OnlineExamPlatform.Core.Entities
{
    public class ExamAssignment
    {
        public int Id { get; set; }
        
        public int ExamId { get; set; }
        
        public int UserId { get; set; }
        
        public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime? DueDate { get; set; }
        
        public bool IsCompleted { get; set; } = false;
        
        // Navigation properties
        public Exam Exam { get; set; } = null!;
        public User User { get; set; } = null!;
    }
}