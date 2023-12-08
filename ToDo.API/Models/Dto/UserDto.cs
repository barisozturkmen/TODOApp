using System.ComponentModel.DataAnnotations;

namespace ToDo.API.Models.Dto
{
    public class UserDto
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string Username { get; set; }
        public string? ProfileImage { get; set; }
    }
}
