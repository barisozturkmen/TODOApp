using ToDo.API.Models;

namespace ToDo.API.UtilityService
{
    public interface IEmailService
    {
        void SendEmail(Email email);
    }
}
