using Microsoft.EntityFrameworkCore;
using OnlineExamPlatform.Core.Entities;
using OnlineExamPlatform.Core.Interfaces;
using OnlineExamPlatform.Infrastructure.Data;

namespace OnlineExamPlatform.Infrastructure.Repositories
{
    public class ExamRepository : Repository<Exam>, IExamRepository
    {
        public ExamRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Exam>> GetExamsByTeacherAsync(int teacherId)
        {
            return await _dbSet
                .Where(e => e.CreatedBy == teacherId)
                .Include(e => e.Questions)
                .Include(e => e.Assignments)
                .OrderByDescending(e => e.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Exam>> GetActiveExamsAsync()
        {
            var now = DateTime.UtcNow;
            return await _dbSet
                .Where(e => e.IsActive && e.StartDate <= now && e.EndDate >= now)
                .Include(e => e.Creator)
                .ToListAsync();
        }

        public async Task<Exam?> GetExamWithQuestionsAsync(int examId)
        {
            return await _dbSet
                .Include(e => e.Questions)
                    .ThenInclude(q => q.Options)
                .Include(e => e.Creator)
                .FirstOrDefaultAsync(e => e.Id == examId);
        }

        public async Task<IEnumerable<Exam>> GetAssignedExamsAsync(int userId)
        {
            return await _context.ExamAssignments
                .Where(ea => ea.UserId == userId)
                .Include(ea => ea.Exam)
                    .ThenInclude(e => e.Creator)
                .Select(ea => ea.Exam)
                .ToListAsync();
        }
    }
}