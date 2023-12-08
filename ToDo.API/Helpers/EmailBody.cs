namespace ToDo.API.Helpers
{
    public static class EmailBody
    {
        public static string SetPassword(string email, string token)
        {
            return $"<p>Click <a href='http://todoappwebbaz9173client.azurewebsites.net/#/set-password?email={email}&code={token}'>here</a> to set your new password.</p>";
        }
    }
}
