using OnlineExamPlatform.Core.Entities;

namespace OnlineExamPlatform.API.DTOs
{
    public class ExamDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int TimeLimit { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public bool IsActive { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; }
        public int MaxAttempts { get; set; }
        public bool ShuffleQuestions { get; set; }
        public bool ShowResultsImmediately { get; set; }
        public string CreatorName { get; set; } = string.Empty;
    }

    public class ExamDetailDto : ExamDto
    {
        public IList<QuestionDto> Questions { get; set; } = new List<QuestionDto>();
    }

    public class CreateExamDto
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int TimeLimit { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int MaxAttempts { get; set; } = 1;
        public bool ShuffleQuestions { get; set; } = false;
        public bool ShowResultsImmediately { get; set; } = true;
        public IList<CreateQuestionDto> Questions { get; set; } = new List<CreateQuestionDto>();
    }

    public class UpdateExamDto
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int TimeLimit { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public bool IsActive { get; set; }
        public int MaxAttempts { get; set; }
        public bool ShuffleQuestions { get; set; }
        public bool ShowResultsImmediately { get; set; }
    }

    public class AssignExamDto
    {
        public IList<int> StudentIds { get; set; } = new List<int>();
        public DateTime? DueDate { get; set; }
    }
}