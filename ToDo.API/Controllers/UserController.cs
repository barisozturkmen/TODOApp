using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.RegularExpressions;
using ToDo.API.Context;
using ToDo.API.Helpers;
using ToDo.API.Models;
using ToDo.API.Models.Dto;
using ToDo.API.UtilityService;

namespace ToDo.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private const int MIN_PASSWORD_LENGTH = 8;
        private const int MAX_PASSWORD_LENGTH = 20;
        //private const string JWT_KEY = "super secret key"; // TODO: Move this somewhere safe
        private const int JWT_EXPIRATION_DAYS = 1;
        private const int SET_PASSWORD_EXPIRATION_HOURS = 1;

        private readonly AppDbContext _appDbContext;
        private readonly IConfiguration _config;
        private readonly IEmailService _emailService;
        public UserController(
            AppDbContext appDbContext, 
            IConfiguration config,
            IEmailService emailService)
        {
            _appDbContext = appDbContext;
            _config = config;
            _emailService = emailService;
        }

        [HttpPost("authenticate")]
        public async Task<IActionResult> Authenticate([FromBody] User userObject)
        {
            if (userObject == null)
                return BadRequest(new { Message = "Login failed. Username or password is incorrect." });

            var user = await _appDbContext.Users.FirstOrDefaultAsync(x => x.Username == userObject.Username);
            if (user == null)
                return NotFound(new { Message = "User not found." });

            bool incorrectPassword = !PasswordHasher.VerifyPassword(userObject.Password, user.Password);
            if (incorrectPassword)
                return BadRequest( new { Message = "Password is incorrect." });

            user.Token = GenerateJwtToken(user);

            string profileImage = "";
            if (user.ProfileImage != null)
                profileImage = Encoding.Default.GetString(user.ProfileImage);

            return Ok(new {
                Token = user.Token,
                Message = "Login successful.",
                ProfileImage = profileImage
            });
        }

        [HttpPost("register")]
        public async Task<IActionResult> RegisterUser([FromBody] UserDto userDto)
        {
            if (userDto == null)
                return BadRequest(new { Message = "Something went wrong." });

            if (await CheckUsernameExists(userDto.Username))
                return BadRequest(new { Message = "Username already exists." });

            if (await CheckEmailExists(userDto.Email))
                return BadRequest(new { Message = "Account with this email already exists." });

            byte[] profileImageBytes = null;
            if (userDto.ProfileImage != null)
                profileImageBytes = Encoding.Default.GetBytes(userDto.ProfileImage);

            var user = new User
            {
                FirstName = userDto.FirstName,
                LastName = userDto.LastName,
                Username = userDto.Username,
                Email = userDto.Email,
                ProfileImage = profileImageBytes,
                Role = "User",
                Token = "",
            };

            await _appDbContext.Users.AddAsync(user);
            await _appDbContext.SaveChangesAsync();

            return Ok(new { Message = "Account created successfully." });
        }

        [HttpPost("send-password-link/{emailAddress}")]
        public async Task<IActionResult> SendPasswordEmail(string emailAddress)
        {
            var user = await _appDbContext.Users.FirstOrDefaultAsync(x => x.Email == emailAddress);
            if (user == null)
                return NotFound(new { Message = "No account matches email address." });

            var token = Guid.NewGuid().ToString();
            user.SetPasswordToken = token;
            user.SetPasswordExpiry = DateTime.UtcNow.AddHours(SET_PASSWORD_EXPIRATION_HOURS);
            string from = _config["EmailSettings:From"];

            var email = new Email(emailAddress, "Set new password", EmailBody.SetPassword(emailAddress, token));
            _emailService.SendEmail(email);

            await _appDbContext.SaveChangesAsync();

            return Ok(new { Message = "Set password email sent." });
        }

        [HttpPost("set-password")]
        public async Task<IActionResult> SetPassword(SetPasswordDto setPasswordDto)
        {
            var freshToken = setPasswordDto.EmailToken.Replace(" ", "+");
            var user = await _appDbContext.Users
                .FirstOrDefaultAsync(x => x.Email == setPasswordDto.Email);

            if (user == null)
                return NotFound(new { Message = "No account matches email address." });

            var tokenCode = user.SetPasswordToken;
            DateTime tokenExpiry = user.SetPasswordExpiry;
            bool invalidToken = tokenCode != 
                setPasswordDto.EmailToken || tokenExpiry < DateTime.UtcNow;
            if (invalidToken)
                return BadRequest(new { Message = "Invalid link." });

            var passwordStrengthResponse = CheckPasswordStrength(setPasswordDto.NewPassword);
            var passwordTooWeak = !string.IsNullOrEmpty(passwordStrengthResponse);
            if (passwordTooWeak)
                return BadRequest(new { Message = passwordStrengthResponse });

            user.Password = PasswordHasher.HashPassword(setPasswordDto.NewPassword);
            _appDbContext.Entry(user).State = EntityState.Modified;
            await _appDbContext.SaveChangesAsync();

            return Ok(new { Message = "Password set successfully." });
        }

        [Authorize]
        [HttpPut("update-profile")]
        public async Task<IActionResult> UpdateProfile(UserDto userDto)
        {
            if (userDto == null)
                return BadRequest(new { Message = "Something went wrong." });

            var userIdentityString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            int.TryParse(userIdentityString, out int parsedUserId);

            var user = await _appDbContext.Users.FirstOrDefaultAsync(x => x.Id == parsedUserId);
            if (user == null)
                return NotFound(new { Message = "User not found." });

            user.FirstName = userDto.FirstName;
            user.LastName = userDto.LastName;
            if (userDto.ProfileImage != null)
                user.ProfileImage = Encoding.Default.GetBytes(userDto.ProfileImage);

            _appDbContext.Entry(user).State = EntityState.Modified;
            await _appDbContext.SaveChangesAsync();

            user.Token = GenerateJwtToken(user);

            return Ok(new
            {
                Token = user.Token,
                Message = "Profile updated successfully.",
                ProfileImage = userDto.ProfileImage
            });
        }

        private async Task<bool> CheckUsernameExists(string username)
        {
            return await _appDbContext.Users.AnyAsync(x => x.Username == username);
        }

        private async Task<bool> CheckEmailExists(string email)
        {
            return await _appDbContext.Users.AnyAsync(x => x.Email == email);
        }

        private string CheckPasswordStrength(string password)
        {
            StringBuilder sb = new StringBuilder();

            bool passwordTooShort = password.Length < MIN_PASSWORD_LENGTH;
            if (passwordTooShort)
                sb.Append("Password must be at least 8 characters long." + Environment.NewLine);

            bool passwordTooLong = password.Length > MAX_PASSWORD_LENGTH;
            if (passwordTooLong)
                sb.Append("Password must be no longer than 20 characters." + Environment.NewLine);

            bool passwordMissingUpperLowerOrNumber = 
                !(Regex.IsMatch(password, "[a-z]") &&
                Regex.IsMatch(password, "[A-Z]") &&
                Regex.IsMatch(password, "[0-9]"));
            if (passwordMissingUpperLowerOrNumber)
                sb.Append("Password must contain at least one uppercase letter, one lowercase letter, and one number." + Environment.NewLine);
            
            bool passwordMissingSpecialCharacter = !Regex.IsMatch(password, "[^a-zA-Z0-9]");
            if (passwordMissingSpecialCharacter)
                sb.Append("Password must contain at least one special character." + Environment.NewLine);
        
            return sb.ToString();
        }

        private string GenerateJwtToken(User user)
        {
            var jwtTokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_config["JwtSettings:Key"]);
            var identity = new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim("FirstName", user.FirstName),
                new Claim("LastName", user.LastName),
            });

            var credentials = new SigningCredentials(
                new SymmetricSecurityKey(key), 
                SecurityAlgorithms.HmacSha256);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = identity,
                Expires = DateTime.UtcNow.AddDays(JWT_EXPIRATION_DAYS),
                SigningCredentials = credentials,
            };

            var token = jwtTokenHandler.CreateToken(tokenDescriptor);

            return jwtTokenHandler.WriteToken(token);
        }
    }
}
