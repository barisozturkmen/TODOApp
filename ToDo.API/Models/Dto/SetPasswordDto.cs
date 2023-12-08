namespace ToDo.API.Models.Dto
{
    public class SetPasswordDto
    {
        public string Email { get; set; }
        public string EmailToken { get; set; }
        public string NewPassword { get; set; }
    }
}
