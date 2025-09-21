using OnlineExamPlatform.Core.Entities;

namespace OnlineExamPlatform.API.DTOs
{
    public class ExamSubmissionDto
    {
        public int Id { get; set; }
        public int ExamId { get; set; }
        public int UserId { get; set; }
        public DateTime StartedAt { get; set; }
        public DateTime? SubmittedAt { get; set; }
        public int? Score { get; set; }
        public int? MaxScore { get; set; }
        public SubmissionStatus Status { get; set; }
        public int AttemptNumber { get; set; }
        public string ExamTitle { get; set; } = string.Empty;
    }

    public class StartExamDto
    {
        public int ExamId { get; set; }
    }

    public class SubmitAnswerDto
    {
        public int QuestionId { get; set; }
        public int? SelectedOptionId { get; set; }
        public string? TextAnswer { get; set; }
    }

    public class ExamResultDto
    {
        public int Id { get; set; }
        public string ExamTitle { get; set; } = string.Empty;
        public DateTime SubmittedAt { get; set; }
        public int Score { get; set; }
        public int MaxScore { get; set; }
        public double Percentage { get; set; }
        public int AttemptNumber { get; set; }
        public SubmissionStatus Status { get; set; }
    }
}
