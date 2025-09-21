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
    public class ExamsController : ControllerBase
    {
        private readonly IExamRepository _examRepository;
        private readonly IRepository<ExamAssignment> _assignmentRepository;
        private readonly IMapper _mapper;

        public ExamsController(
            IExamRepository examRepository,
            IRepository<ExamAssignment> assignmentRepository,
            IMapper mapper)
        {
            _examRepository = examRepository;
            _assignmentRepository = assignmentRepository;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ExamDto>>> GetExams()
        {
            var userId = GetUserId();
            var userRole = GetUserRole();

            IEnumerable<Exam> exams;

            if (userRole == "Teacher" || userRole == "Admin")
            {
                exams = await _examRepository.GetExamsByTeacherAsync(userId);
            }
            else
            {
                exams = await _examRepository.GetAssignedExamsAsync(userId);
            }

            return Ok(_mapper.Map<IEnumerable<ExamDto>>(exams));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ExamDetailDto>> GetExam(int id)
        {
            var exam = await _examRepository.GetExamWithQuestionsAsync(id);
            if (exam == null)
            {
                return NotFound();
            }

            var userId = GetUserId();
            var userRole = GetUserRole();

            // Check permissions
            if (userRole == "Student")
            {
                var isAssigned = await _assignmentRepository.ExistsAsync(
                    ea => ea.ExamId == id && ea.UserId == userId);
                
                if (!isAssigned)
                {
                    return Forbid();
                }
            }

            return Ok(_mapper.Map<ExamDetailDto>(exam));
        }

        [HttpPost]
        [Authorize(Roles = "Teacher,Admin")]
        public async Task<ActionResult<ExamDto>> CreateExam(CreateExamDto createExamDto)
        {
            var exam = _mapper.Map<Exam>(createExamDto);
            exam.CreatedBy = GetUserId();

            var createdExam = await _examRepository.AddAsync(exam);
            return CreatedAtAction(nameof(GetExam), new { id = createdExam.Id }, 
                _mapper.Map<ExamDto>(createdExam));
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Teacher,Admin")]
        public async Task<IActionResult> UpdateExam(int id, UpdateExamDto updateExamDto)
        {
            var exam = await _examRepository.GetByIdAsync(id);
            if (exam == null)
            {
                return NotFound();
            }

            var userId = GetUserId();
            if (exam.CreatedBy != userId && !User.IsInRole("Admin"))
            {
                return Forbid();
            }

            _mapper.Map(updateExamDto, exam);
            await _examRepository.UpdateAsync(exam);

            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Teacher,Admin")]
        public async Task<IActionResult> DeleteExam(int id)
        {
            var exam = await _examRepository.GetByIdAsync(id);
            if (exam == null)
            {
                return NotFound();
            }

            var userId = GetUserId();
            if (exam.CreatedBy != userId && !User.IsInRole("Admin"))
            {
                return Forbid();
            }

            await _examRepository.DeleteAsync(exam);
            return NoContent();
        }

        [HttpPost("{id}/assign")]
        [Authorize(Roles = "Teacher,Admin")]
        public async Task<IActionResult> AssignExam(int id, AssignExamDto assignExamDto)
        {
            var exam = await _examRepository.GetByIdAsync(id);
            if (exam == null)
            {
                return NotFound();
            }

            var userId = GetUserId();
            if (exam.CreatedBy != userId && !User.IsInRole("Admin"))
            {
                return Forbid();
            }

            foreach (var studentId in assignExamDto.StudentIds)
            {
                var existingAssignment = await _assignmentRepository.GetFirstAsync(
                    ea => ea.ExamId == id && ea.UserId == studentId);

                if (existingAssignment == null)
                {
                    var assignment = new ExamAssignment
                    {
                        ExamId = id,
                        UserId = studentId,
                        DueDate = assignExamDto.DueDate
                    };
                    await _assignmentRepository.AddAsync(assignment);
                }
            }

            return Ok();
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