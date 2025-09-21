using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OnlineExamPlatform.API.DTOs;
using OnlineExamPlatform.Core.Entities;
using OnlineExamPlatform.Core.Interfaces;
using AutoMapper;
using System.Security.Claims;

namespace OnlineExamPlatform.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class SubmissionsController : ControllerBase
    {
        private readonly IRepository<ExamSubmission> _submissionRepository;
        private readonly IRepository<Answer> _answerRepository;
        private readonly IExamRepository _examRepository;
        private readonly IRepository<ExamAssignment> _assignmentRepository;
        private readonly IMapper _mapper;

        public SubmissionsController(
            IRepository<ExamSubmission> submissionRepository,
            IRepository<Answer> answerRepository,
            IExamRepository examRepository,
            IRepository<ExamAssignment> assignmentRepository,
            IMapper mapper)
        {
            _submissionRepository = submissionRepository;
            _answerRepository = answerRepository;
            _examRepository = examRepository;
            _assignmentRepository = assignmentRepository;
            _mapper = mapper;
        }

        [HttpPost]
        public async Task<ActionResult<ExamSubmissionDto>> StartExam(StartExamDto startExamDto)
        {
            var userId = GetUserId();
            var exam = await _examRepository.GetByIdAsync(startExamDto.ExamId);
            
            if (exam == null)
            {
                return NotFound("Exam not found");
            }

            // Check if user is assigned to this exam
            var isAssigned = await _assignmentRepository.ExistsAsync(
                ea => ea.ExamId == startExamDto.ExamId && ea.UserId == userId);
            
            if (!isAssigned && !User.IsInRole("Admin"))
            {
                return Forbid();
            }

            // Check if exam is active
            var now = DateTime.UtcNow;
            if (!exam.IsActive || now < exam.StartDate || now > exam.EndDate)
            {
                return BadRequest("Exam is not available");
            }

            // Check attempt limit
            var attemptCount = await _submissionRepository.CountAsync(
                s => s.ExamId == startExamDto.ExamId && s.UserId == userId);
            
            if (attemptCount >= exam.MaxAttempts)
            {
                return BadRequest("Maximum attempts exceeded");
            }

            // Check for existing in-progress submission
            var existingSubmission = await _submissionRepository.GetFirstAsync(
                s => s.ExamId == startExamDto.ExamId && s.UserId == userId && s.Status == SubmissionStatus.InProgress);
            
            if (existingSubmission != null)
            {
                return Ok(_mapper.Map<ExamSubmissionDto>(existingSubmission));
            }

            var submission = new ExamSubmission
            {
                ExamId = startExamDto.ExamId,
                UserId = userId,
                AttemptNumber = attemptCount + 1,
                Status = SubmissionStatus.InProgress
            };

            var createdSubmission = await _submissionRepository.AddAsync(submission);
            return Ok(_mapper.Map<ExamSubmissionDto>(createdSubmission));
        }

        [HttpPost("{submissionId}/answers")]
        public async Task<IActionResult> SubmitAnswer(int submissionId, SubmitAnswerDto submitAnswerDto)
        {
            var userId = GetUserId();
            var submission = await _submissionRepository.GetFirstAsync(
                s => s.Id == submissionId && s.UserId == userId);

            if (submission == null)
            {
                return NotFound("Submission not found");
            }

            if (submission.Status != SubmissionStatus.InProgress)
            {
                return BadRequest("Submission is not in progress");
            }

            // Check if time limit exceeded
            var exam = await _examRepository.GetByIdAsync(submission.ExamId);
            if (exam != null && exam.TimeLimit > 0)
            {
                var timeElapsed = DateTime.UtcNow - submission.StartedAt;
                if (timeElapsed.TotalMinutes > exam.TimeLimit)
                {
                    submission.Status = SubmissionStatus.TimedOut;
                    await _submissionRepository.UpdateAsync(submission);
                    return BadRequest("Time limit exceeded");
                }
            }

            // Update or create answer
            var existingAnswer = await _answerRepository.GetFirstAsync(
                a => a.SubmissionId == submissionId && a.QuestionId == submitAnswerDto.QuestionId);

            if (existingAnswer != null)
            {
                existingAnswer.SelectedOptionId = submitAnswerDto.SelectedOptionId;
                existingAnswer.TextAnswer = submitAnswerDto.TextAnswer;
                existingAnswer.AnsweredAt = DateTime.UtcNow;
                await _answerRepository.UpdateAsync(existingAnswer);
            }
            else
            {
                var answer = new Answer
                {
                    SubmissionId = submissionId,
                    QuestionId = submitAnswerDto.QuestionId,
                    SelectedOptionId = submitAnswerDto.SelectedOptionId,
                    TextAnswer = submitAnswerDto.TextAnswer
                };
                await _answerRepository.AddAsync(answer);
            }

            return Ok();
        }

        [HttpPost("{submissionId}/submit")]
        public async Task<IActionResult> SubmitExam(int submissionId)
        {
            var userId = GetUserId();
            var submission = await _submissionRepository.GetFirstAsync(
                s => s.Id == submissionId && s.UserId == userId);

            if (submission == null)
            {
                return NotFound("Submission not found");
            }

            if (submission.Status != SubmissionStatus.InProgress)
            {
                return BadRequest("Submission is not in progress");
            }

            submission.SubmittedAt = DateTime.UtcNow;
            submission.Status = SubmissionStatus.Submitted;

            // Calculate score
            await CalculateScore(submission);

            await _submissionRepository.UpdateAsync(submission);

            // Mark assignment as completed
            var assignment = await _assignmentRepository.GetFirstAsync(
                ea => ea.ExamId == submission.ExamId && ea.UserId == userId);
            
            if (assignment != null)
            {
                assignment.IsCompleted = true;
                await _assignmentRepository.UpdateAsync(assignment);
            }

            return Ok();
        }

        [HttpGet("results/{userId}")]
        public async Task<ActionResult<IEnumerable<ExamResultDto>>> GetResults(int userId)
        {
            var currentUserId = GetUserId();
            var userRole = GetUserRole();

            // Students can only see their own results
            if (userRole == "Student" && currentUserId != userId)
            {
                return Forbid();
            }

            var submissions = await _submissionRepository.GetAsync(
                s => s.UserId == userId && s.Status == SubmissionStatus.Graded);

            return Ok(_mapper.Map<IEnumerable<ExamResultDto>>(submissions));
        }

        private async Task CalculateScore(ExamSubmission submission)
        {
            var exam = await _examRepository.GetExamWithQuestionsAsync(submission.ExamId);
            if (exam == null) return;

            var answers = await _answerRepository.GetAsync(a => a.SubmissionId == submission.Id);
            
            int totalScore = 0;
            int maxScore = 0;

            foreach (var question in exam.Questions)
            {
                maxScore += question.Points;
                var answer = answers.FirstOrDefault(a => a.QuestionId == question.Id);
                
                if (answer != null)
                {
                    int questionScore = 0;

                    if (question.Type == QuestionType.MultipleChoice || question.Type == QuestionType.TrueFalse)
                    {
                        var correctOption = question.Options.FirstOrDefault(o => o.IsCorrect);
                        if (correctOption != null && answer.SelectedOptionId == correctOption.Id)
                        {
                            questionScore = question.Points;
                        }
                    }
                    // Open-ended questions require manual grading
                    else if (question.Type == QuestionType.OpenEnded)
                    {
                        questionScore = 0; // Will be graded manually
                    }

                    answer.Points = questionScore;
                    answer.IsCorrect = questionScore > 0;
                    await _answerRepository.UpdateAsync(answer);
                    
                    totalScore += questionScore;
                }
            }

            submission.Score = totalScore;
            submission.MaxScore = maxScore;
            submission.Status = SubmissionStatus.Graded;
        }

        private int GetUserId()
        {
            return int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        }

        private string GetUserRole()
        {
            return User.FindFirst(ClaimTypes.Role)?.Value ?? "Student";
        }
    }
}