using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OnlineExamPlatform.API.DTOs;
using OnlineExamPlatform.Core.Entities;
using OnlineExamPlatform.Core.Interfaces;
using AutoMapper;

namespace OnlineExamPlatform.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class QuestionsController : ControllerBase
    {
        private readonly IRepository<Question> _questionRepository;
        private readonly IExamRepository _examRepository;
        private readonly IMapper _mapper;

        public QuestionsController(
            IRepository<Question> questionRepository,
            IExamRepository examRepository,
            IMapper mapper)
        {
            _questionRepository = questionRepository;
            _examRepository = examRepository;
            _mapper = mapper;
        }

        [HttpGet("exam/{examId}")]
        public async Task<ActionResult<IEnumerable<QuestionDto>>> GetQuestionsByExam(int examId)
        {
            var exam = await _examRepository.GetByIdAsync(examId);
            if (exam == null)
            {
                return NotFound();
            }

            var questions = await _questionRepository.GetAsync(q => q.ExamId == examId);
            return Ok(_mapper.Map<IEnumerable<QuestionDto>>(questions.OrderBy(q => q.Order)));
        }

        [HttpPost]
        [Authorize(Roles = "Teacher,Admin")]
        public async Task<ActionResult<QuestionDto>> CreateQuestion(CreateQuestionDto createQuestionDto)
        {
            var exam = await _examRepository.GetByIdAsync(createQuestionDto.ExamId);
            if (exam == null)
            {
                return NotFound("Exam not found");
            }

            var userId = GetUserId();
            if (exam.CreatedBy != userId && !User.IsInRole("Admin"))
            {
                return Forbid();
            }

            var question = _mapper.Map<Question>(createQuestionDto);
            var createdQuestion = await _questionRepository.AddAsync(question);

            return CreatedAtAction(nameof(GetQuestionsByExam), 
                new { examId = createQuestionDto.ExamId }, 
                _mapper.Map<QuestionDto>(createdQuestion));
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Teacher,Admin")]
        public async Task<IActionResult> UpdateQuestion(int id, UpdateQuestionDto updateQuestionDto)
        {
            var question = await _questionRepository.GetByIdAsync(id);
            if (question == null)
            {
                return NotFound();
            }

            var exam = await _examRepository.GetByIdAsync(question.ExamId);
            var userId = GetUserId();
            if (exam?.CreatedBy != userId && !User.IsInRole("Admin"))
            {
                return Forbid();
            }

            _mapper.Map(updateQuestionDto, question);
            await _questionRepository.UpdateAsync(question);

            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Teacher,Admin")]
        public async Task<IActionResult> DeleteQuestion(int id)
        {
            var question = await _questionRepository.GetByIdAsync(id);
            if (question == null)
            {
                return NotFound();
            }

            var exam = await _examRepository.GetByIdAsync(question.ExamId);
            var userId = GetUserId();
            if (exam?.CreatedBy != userId && !User.IsInRole("Admin"))
            {
                return Forbid();
            }

            await _questionRepository.DeleteAsync(question);
            return NoContent();
        }

        private int GetUserId()
        {
            return int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
        }
    }
}