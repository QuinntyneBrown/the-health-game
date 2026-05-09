using HealthGame.Domain.Goals;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HealthGame.Infrastructure.Data.Configurations;

internal sealed class RewardConfiguration : IEntityTypeConfiguration<Reward>
{
    public void Configure(EntityTypeBuilder<Reward> builder)
    {
        builder.ToTable("Rewards");

        builder.HasKey(reward => reward.Id);

        builder.Property(reward => reward.GoalId)
            .IsRequired();

        builder.Property(reward => reward.UserId)
            .HasMaxLength(128)
            .IsRequired();

        builder.Property(reward => reward.Name)
            .HasMaxLength(120)
            .IsRequired();

        builder.Property(reward => reward.Description)
            .HasMaxLength(500);

        builder.Property(reward => reward.IsEarned)
            .IsRequired();

        builder.Property(reward => reward.EarnedAtUtc);

        builder.Property(reward => reward.CreatedAtUtc)
            .IsRequired();

        builder.Property(reward => reward.UpdatedAtUtc);

        builder.OwnsOne(reward => reward.Condition, condition =>
        {
            condition.Property(value => value.Type)
                .HasConversion<string>()
                .HasMaxLength(32)
                .IsRequired();

            condition.Property(value => value.RequiredStreakCount)
                .IsRequired();
        });

        builder.HasIndex(reward => new
        {
            reward.UserId,
            reward.GoalId,
            reward.Name
        });
    }
}
