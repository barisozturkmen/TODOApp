using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using ToDo.API.Context;
using ToDo.API.Models;
using ToDo.API.Models.Dto;
using ToDo.API.UtilityService;

namespace ToDo.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ToDoController : ControllerBase
    {
        private readonly AppDbContext _appDbContext;
        private readonly IHubContext<NotificationHub> _hubContext;

        public ToDoController(
            AppDbContext appDbContext,
            IHubContext<NotificationHub> hubContext)
        {
            _appDbContext = appDbContext;
            _hubContext = hubContext;
        }

        [Authorize]
        [HttpGet("get-todos")]
        public async Task<IActionResult> GetToDos()
        {
            if (UserIdIsNull())
            {
                return BadRequest(new { Message = "Invalid user identifier." });
            }

            if (IsAdmin())
            {
                var allToDos = await _appDbContext.ToDos.ToListAsync();
                return Ok(allToDos);
            }

            var userToDos = await _appDbContext.ToDos
                .Where(todo => todo.CreatedByUserId == GetUserId())
                .ToListAsync();

            return Ok(userToDos);
        }

        [Authorize]
        [HttpPost("add-todo")]
        public async Task<IActionResult> AddToDo(ToDoTask todoDto)
        {
            if (UserIdIsNull())
            {
                return BadRequest(new { Message = "Invalid user identifier." });
            }

            var newToDo = new ToDoTask
            {
                CreatedByUserId = (int)GetUserId(),
                CreatedByUsername = GetUsername(),
                Name = todoDto.Name,
                Description = todoDto.Description,
                IsCompleted = false,
                CompletionDate = null,
            };

            await _appDbContext.ToDos.AddAsync(newToDo);
            await _appDbContext.SaveChangesAsync();

            string username = GetUsername();
            await _hubContext.Clients.All.SendAsync("ReceiveNotification",
                    new
                    {
                        Username = username,
                        Message = username + " has added a new todo: " +
                        newToDo.Name
                    }
                );

            return Ok(new { Message = "ToDo has been added." });
        }

        [Authorize]
        [HttpPut("update-todo")]
        public async Task<IActionResult> UpdateTodo(ToDoTask todoDto)
        {
            if (UserIdIsNull())
                return BadRequest(new { Message = "Invalid user identifier." });

            ToDoTask existingTodo = null;
            existingTodo = await _appDbContext.ToDos
                .FirstOrDefaultAsync(todo => todo.Id == todoDto.Id);

            bool isValidToDo = existingTodo != null;
            if (!isValidToDo)
                return BadRequest(new { Message = "Todo not found." });

            if (IsAdmin() || existingTodo.CreatedByUserId == GetUserId())
            {
                existingTodo.IsCompleted = todoDto.IsCompleted;

                if (existingTodo.IsCompleted)
                    existingTodo.CompletionDate = DateTime.UtcNow;
                else
                    existingTodo.CompletionDate = null;

                _appDbContext.Entry(existingTodo).State = EntityState.Modified;
                await _appDbContext.SaveChangesAsync();

                string username = GetUsername();
                await _hubContext.Clients.All.SendAsync("ReceiveNotification", 
                    new { 
                        Username = username, 
                        Message = username + " has marked " + 
                        existingTodo.Name + " " + GetCompletedText(existingTodo.IsCompleted) 
                    }
                );

                return Ok(new { Message = "Todo has been updated." });
            }

            return BadRequest(new { Message = "Something went wrong." });
        }

        private bool IsAdmin()
        {
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            return (userRole != null && userRole == "Admin");
        }

        private int? GetUserId()
        {
            var userIdentityString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            int.TryParse(userIdentityString, out int parsedUserId);
            return parsedUserId;
        }

        private bool UserIdIsNull()
        {
            return GetUserId() == null;
        }

        private string GetUsername()
        {
            var username = User.FindFirst(ClaimTypes.Name)?.Value;
            return username;
        }

        private string GetCompletedText(bool isCompleted)
        {
            return isCompleted ? "completed." : "incomplete.";
        }
    }
}
