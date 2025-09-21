using AutoMapper;
using Microsoft.IdentityModel.Tokens;
using OnlineExamPlatform.API.DTOs;
using OnlineExamPlatform.Core.Entities;
using OnlineExamPlatform.Core.Interfaces;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace OnlineExamPlatform.API.Services
{
    public class AuthService : IAuthService
    {
        private readonly IRepository<User> _userRepository;
        private readonly IMapper _mapper;
        private readonly IConfiguration _configuration;

        public AuthService(
            IRepository<User> userRepository,
            IMapper mapper,
            IConfiguration configuration)
        {
            _userRepository = userRepository;
            _mapper = mapper;
            _configuration = configuration;
        }

        public async Task<AuthResponseDto?> LoginAsync(LoginDto loginDto)
        {
            var user = await _userRepository.GetFirstAsync(u => u.Email == loginDto.Email && u.IsActive);
            
            if (user == null || !VerifyPassword(loginDto.Password, user.PasswordHash))
            {
                return null;
            }

            var token = GenerateJwtToken(user);
            var userDto = _mapper.Map<UserDto>(user);

            return new AuthResponseDto
            {
                Token = token,
                User = userDto
            };
        }

        public async Task<AuthResponseDto?> RegisterAsync(RegisterDto registerDto)
        {
            // Check if user already exists
            var existingUser = await _userRepository.GetFirstAsync(u => u.Email == registerDto.Email);
            if (existingUser != null)
            {
                return null;
            }

            var user = _mapper.Map<User>(registerDto);
            user.PasswordHash = HashPassword(registerDto.Password);

            var createdUser = await _userRepository.AddAsync(user);
            var token = GenerateJwtToken(createdUser);
            var userDto = _mapper.Map<UserDto>(createdUser);

            return new AuthResponseDto
            {
                Token = token,
                User = userDto
            };
        }

        public async Task<UserDto?> GetUserByIdAsync(int userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            return user != null ? _mapper.Map<UserDto>(user) : null;
        }

        private string GenerateJwtToken(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"]!);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.Name, $"{user.FirstName} {user.LastName}"),
                    new Claim(ClaimTypes.Role, user.Role.ToString())
                }),
                Expires = DateTime.UtcNow.AddDays(7),
                Issuer = _configuration["Jwt:Issuer"],
                Audience = _configuration["Jwt:Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        private static string HashPassword(string password)
        {
            using var rng = RandomNumberGenerator.Create();
            var salt = new byte[32];
            rng.GetBytes(salt);

            using var pbkdf2 = new Rfc2898DeriveBytes(password, salt, 10000, HashAlgorithmName.SHA256);
            var hash = pbkdf2.GetBytes(32);

            var saltAndHash = new byte[64];
            Array.Copy(salt, 0, saltAndHash, 0, 32);
            Array.Copy(hash, 0, saltAndHash, 32, 32);

            return Convert.ToBase64String(saltAndHash);
        }

        private static bool VerifyPassword(string password, string hashedPassword)
        {
            var saltAndHash = Convert.FromBase64String(hashedPassword);
            var salt = new byte[32];
            var hash = new byte[32];

            Array.Copy(saltAndHash, 0, salt, 0, 32);
            Array.Copy(saltAndHash, 32, hash, 0, 32);

            using var pbkdf2 = new Rfc2898DeriveBytes(password, salt, 10000, HashAlgorithmName.SHA256);
            var computedHash = pbkdf2.GetBytes(32);

            return computedHash.SequenceEqual(hash);
        }
    }
}
