using System.Security.Cryptography;

namespace HealthGame.Cli.Services;

public static class PasswordHashing
{
    public static string Hash(string password)
    {
        if (string.IsNullOrWhiteSpace(password))
        {
            throw new ArgumentException("Password is required.", nameof(password));
        }

        var salt = RandomNumberGenerator.GetBytes(16);
        var hash = Rfc2898DeriveBytes.Pbkdf2(
            password,
            salt,
            100_000,
            HashAlgorithmName.SHA256,
            32);

        return string.Join(
            "$",
            "pbkdf2-sha256",
            "100000",
            Convert.ToBase64String(salt),
            Convert.ToBase64String(hash));
    }
}
