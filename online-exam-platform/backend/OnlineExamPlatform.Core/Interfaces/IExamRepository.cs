using OnlineExamPlatform.Core.Entities;

namespace OnlineExamPlatform.Core.Interfaces
{
    public interface IExamRepository : IRepository<Exam>
    {
        Task<IEnumerable<Exam>> GetExamsByTeacherAsync(int teacherId);
        Task<IEnumerable<Exam>> GetActiveExamsAsync();
        Task<Exam?> GetExamWithQuestionsAsync(int examId);
        Task<IEnumerable<Exam>> GetAssignedExamsAsync(int userId);
    }
}