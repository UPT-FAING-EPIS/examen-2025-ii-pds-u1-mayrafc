using AutoMapper;
using OnlineExamPlatform.API.DTOs;
using OnlineExamPlatform.Core.Entities;

namespace OnlineExamPlatform.API.Mapping
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // User mappings
            CreateMap<User, UserDto>();
            CreateMap<RegisterDto, User>()
                .ForMember(dest => dest.PasswordHash, opt => opt.Ignore());

            // Exam mappings
            CreateMap<Exam, ExamDto>()
                .ForMember(dest => dest.CreatorName, opt => opt.MapFrom(src => $"{src.Creator.FirstName} {src.Creator.LastName}"));
            CreateMap<Exam, ExamDetailDto>()
                .ForMember(dest => dest.CreatorName, opt => opt.MapFrom(src => $"{src.Creator.FirstName} {src.Creator.LastName}"));
            CreateMap<CreateExamDto, Exam>();
            CreateMap<UpdateExamDto, Exam>();

            // Question mappings
            CreateMap<Question, QuestionDto>();
            CreateMap<CreateQuestionDto, Question>();
            CreateMap<UpdateQuestionDto, Question>();

            // Question option mappings
            CreateMap<QuestionOption, QuestionOptionDto>();
            CreateMap<CreateQuestionOptionDto, QuestionOption>();

            // Submission mappings
            CreateMap<ExamSubmission, ExamSubmissionDto>()
                .ForMember(dest => dest.ExamTitle, opt => opt.MapFrom(src => src.Exam.Title));
            CreateMap<ExamSubmission, ExamResultDto>()
                .ForMember(dest => dest.ExamTitle, opt => opt.MapFrom(src => src.Exam.Title))
                .ForMember(dest => dest.SubmittedAt, opt => opt.MapFrom(src => src.SubmittedAt ?? DateTime.MinValue))
                .ForMember(dest => dest.Percentage, opt => opt.MapFrom(src => src.MaxScore > 0 ? (double)(src.Score ?? 0) / src.MaxScore.Value * 100 : 0));
        }
    }
}