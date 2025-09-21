namespace OnlineExamPlatform.Core.Entities
{
    public class ExamSubmission
    {
        public int Id { get; set; }
        
        public int ExamId { get; set; }
        
        public int UserId { get; set; }
        
        public DateTime StartedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime? SubmittedAt { get; set; }
        
        public int? Score { get; set; }
        
        public int? MaxScore { get; set; }
        
        public SubmissionStatus Status { get; set; } = SubmissionStatus.InProgress;
        
        public int AttemptNumber { get; set; } = 1;
        
        // Navigation properties
        public Exam Exam { get; set; } = null!;
        public User User { get; set; } = null!;
        public ICollection<Answer> Answers { get; set; } = new List<Answer>();
    }

    public enum SubmissionStatus
    {
        InProgress = 1,
        Submitted = 2,
        Graded = 3,
        TimedOut = 4
    }
}