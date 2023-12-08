namespace ToDo.API.Models
{
    public class Email
    {
        public string To { get; set; }
        public string Subject { get; set; }
        public string HtmlContent { get; set; }
        public Email(string to, string subject, string htmlContent) 
        {
            To = to;
            Subject = subject;
            HtmlContent = htmlContent;
        }
    }
}
