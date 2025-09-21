using OnlineExamPlatform.Core.Entities;

namespace OnlineExamPlatform.API.DTOs
{
    public class QuestionDto
    {
        public int Id { get; set; }
        public int ExamId { get; set; }
        public string Text { get; set; } = string.Empty;
        public QuestionType Type { get; set; }
        public int Order { get; set; }
        public int Points { get; set; }
        public bool IsRequired { get; set; }
        public IList<QuestionOptionDto> Options { get; set; } = new List<QuestionOptionDto>();
    }

    public class CreateQuestionDto
    {
        public int ExamId { get; set; }
        public string Text { get; set; } = string.Empty;
        public QuestionType Type { get; set; }
        public int Order { get; set; }
        public int Points { get; set; } = 1;
        public bool IsRequired { get; set; } = true;
        public IList<CreateQuestionOptionDto> Options { get; set; } = new List<CreateQuestionOptionDto>();
    }

    public class UpdateQuestionDto
    {
        public string Text { get; set; } = string.Empty;
        public QuestionType Type { get; set; }
        public int Order { get; set; }
        public int Points { get; set; }
        public bool IsRequired { get; set; }
    }

    public class QuestionOptionDto
    {
        public int Id { get; set; }
        public int QuestionId { get; set; }
        public string Text { get; set; } = string.Empty;
        public bool IsCorrect { get; set; }
        public int Order { get; set; }
    }

    public class CreateQuestionOptionDto
    {
        public string Text { get; set; } = string.Empty;
        public bool IsCorrect { get; set; }
        public int Order { get; set; }
    }
}