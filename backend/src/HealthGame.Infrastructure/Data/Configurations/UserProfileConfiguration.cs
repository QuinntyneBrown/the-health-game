using HealthGame.Domain.Users;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace HealthGame.Infrastructure.Data.Configurations;

internal sealed class UserProfileConfiguration : IEntityTypeConfiguration<UserProfile>
{
    public void Configure(EntityTypeBuilder<UserProfile> builder)
    {
        builder.ToTable("UserProfiles");

        builder.HasKey(profile => profile.Id);

        builder.Property(profile => profile.Id)
            .ValueGeneratedNever();

        builder.Property(profile => profile.SubjectId)
            .HasMaxLength(128)
            .IsRequired();

        builder.Property(profile => profile.DisplayName)
            .HasMaxLength(120)
            .IsRequired();

        builder.Property(profile => profile.Email)
            .HasMaxLength(254)
            .IsRequired();

        builder.Property(profile => profile.TimeZoneId)
            .HasMaxLength(128)
            .IsRequired();

        builder.Property(profile => profile.CreatedAtUtc)
            .IsRequired();

        builder.Property(profile => profile.UpdatedAtUtc);

        builder.Property(profile => profile.DeletedAtUtc);

        builder.Ignore(profile => profile.IsDeleted);
        builder.Ignore(profile => profile.Roles);

        var rolesConverter = new ValueConverter<List<UserRole>, string>(
            roles => string.Join(",", roles.Select(role => role.ToString())),
            text => string.IsNullOrEmpty(text)
                ? new List<UserRole>()
                : text
                    .Split(',', StringSplitOptions.RemoveEmptyEntries)
                    .Select(value => Enum.Parse<UserRole>(value, ignoreCase: true))
                    .ToList());

        var rolesComparer = new ValueComparer<List<UserRole>>(
            (left, right) => left!.SequenceEqual(right!),
            roles => roles.Aggregate(0, (hash, role) => HashCode.Combine(hash, role)),
            roles => roles.ToList());

        builder.Property(typeof(List<UserRole>), "_roles")
            .HasField("_roles")
            .UsePropertyAccessMode(PropertyAccessMode.Field)
            .HasColumnName("Roles")
            .HasMaxLength(256)
            .IsRequired()
            .HasConversion(rolesConverter, rolesComparer);

        builder.HasIndex(profile => profile.SubjectId)
            .IsUnique()
            .HasFilter("[DeletedAtUtc] IS NULL");

        builder.HasIndex(profile => profile.DeletedAtUtc);
    }
}
