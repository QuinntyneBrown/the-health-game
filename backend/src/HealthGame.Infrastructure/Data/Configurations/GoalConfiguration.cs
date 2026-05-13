using HealthGame.Domain.Goals;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HealthGame.Infrastructure.Data.Configurations;

internal sealed class GoalConfiguration : IEntityTypeConfiguration<Goal>
{
    public void Configure(EntityTypeBuilder<Goal> builder)
    {
        builder.ToTable("Goals");

        builder.HasKey(goal => goal.Id);

        builder.Property(goal => goal.Id)
            .ValueGeneratedNever();

        builder.Property(goal => goal.UserId)
            .HasMaxLength(128)
            .IsRequired();

        builder.Property(goal => goal.Name)
            .HasMaxLength(120)
            .IsRequired();

        builder.Property(goal => goal.Description)
            .HasMaxLength(500);

        builder.Property(goal => goal.TargetQuantity)
            .HasColumnType("decimal(18,4)")
            .IsRequired();

        builder.Property(goal => goal.TargetUnit)
            .HasMaxLength(32)
            .IsRequired();

        builder.Property(goal => goal.TimeZoneId)
            .HasMaxLength(128)
            .IsRequired();

        builder.Property(goal => goal.WeekStartsOn)
            .HasConversion<string>()
            .HasMaxLength(16)
            .IsRequired();

        builder.Property(goal => goal.CreatedAtUtc)
            .IsRequired();

        builder.Property(goal => goal.UpdatedAtUtc);

        builder.Property(goal => goal.DeletedAtUtc);

        builder.OwnsOne(goal => goal.Cadence, cadence =>
        {
            cadence.Property(value => value.Type)
                .HasConversion<string>()
                .HasMaxLength(32)
                .IsRequired();

            cadence.Property(value => value.Interval)
                .IsRequired();
        });

        builder.Ignore(goal => goal.IsDeleted);

        builder.HasIndex(goal => new { goal.UserId, goal.DeletedAtUtc, goal.Name });

        builder.HasMany(goal => goal.ActivityEntries)
            .WithOne()
            .HasForeignKey(activityEntry => activityEntry.GoalId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Navigation(goal => goal.ActivityEntries)
            .UsePropertyAccessMode(PropertyAccessMode.Field);

        builder.HasMany(goal => goal.Rewards)
            .WithOne()
            .HasForeignKey(reward => reward.GoalId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Navigation(goal => goal.Rewards)
            .UsePropertyAccessMode(PropertyAccessMode.Field);
    }
}
