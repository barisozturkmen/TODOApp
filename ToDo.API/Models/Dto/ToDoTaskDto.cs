using System.ComponentModel.DataAnnotations;

namespace ToDo.API.Models.Dto
{
    public class ToDoTaskDto
    {
        public int Id { get; set; }
        public int CreatedByUserId { get; set; }
        public string CreatedByUsername { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public bool IsCompleted { get; set; }
        public string CompletionDate { get; set; }
    }
}
