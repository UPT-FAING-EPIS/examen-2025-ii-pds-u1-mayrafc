using Microsoft.EntityFrameworkCore;
using OnlineExamPlatform.Core.Entities;

namespace OnlineExamPlatform.Infrastructure.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Exam> Exams { get; set; }
        public DbSet<Question> Questions { get; set; }
        public DbSet<QuestionOption> QuestionOptions { get; set; }
        public DbSet<ExamAssignment> ExamAssignments { get; set; }
        public DbSet<ExamSubmission> ExamSubmissions { get; set; }
        public DbSet<Answer> Answers { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User configuration
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.Email).IsUnique();
                entity.Property(e => e.Email).IsRequired();
                entity.Property(e => e.FirstName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.LastName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.PasswordHash).IsRequired();
            });

            // Exam configuration
            modelBuilder.Entity<Exam>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Description).HasMaxLength(1000);

                entity.HasOne(e => e.Creator)
                    .WithMany(u => u.CreatedExams)
                    .HasForeignKey(e => e.CreatedBy)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Question configuration
            modelBuilder.Entity<Question>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Text).IsRequired().HasMaxLength(1000);

                entity.HasOne(q => q.Exam)
                    .WithMany(e => e.Questions)
                    .HasForeignKey(q => q.ExamId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // QuestionOption configuration
            modelBuilder.Entity<QuestionOption>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Text).IsRequired().HasMaxLength(500);

                entity.HasOne(o => o.Question)
                    .WithMany(q => q.Options)
                    .HasForeignKey(o => o.QuestionId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // ExamAssignment configuration
            modelBuilder.Entity<ExamAssignment>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.HasOne(ea => ea.Exam)
                    .WithMany(e => e.Assignments)
                    .HasForeignKey(ea => ea.ExamId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(ea => ea.User)
                    .WithMany(u => u.AssignedExams)
                    .HasForeignKey(ea => ea.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => new { e.ExamId, e.UserId }).IsUnique();
            });

            // ExamSubmission configuration
            modelBuilder.Entity<ExamSubmission>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.HasOne(es => es.Exam)
                    .WithMany(e => e.Submissions)
                    .HasForeignKey(es => es.ExamId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(es => es.User)
                    .WithMany(u => u.Submissions)
                    .HasForeignKey(es => es.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Answer configuration
            modelBuilder.Entity<Answer>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.TextAnswer).HasMaxLength(2000);

                entity.HasOne(a => a.Submission)
                    .WithMany(s => s.Answers)
                    .HasForeignKey(a => a.SubmissionId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(a => a.Question)
                    .WithMany(q => q.Answers)
                    .HasForeignKey(a => a.QuestionId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(a => a.SelectedOption)
                    .WithMany()
                    .HasForeignKey(a => a.SelectedOptionId)
                    .OnDelete(DeleteBehavior.SetNull);

                entity.HasIndex(e => new { e.SubmissionId, e.QuestionId }).IsUnique();
            });
        }
    }
}

