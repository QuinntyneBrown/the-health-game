using HealthGame.Domain.Goals;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HealthGame.Infrastructure.Data.Configurations;

internal sealed class ActivityEntryConfiguration : IEntityTypeConfiguration<ActivityEntry>
{
    public void Configure(EntityTypeBuilder<ActivityEntry> builder)
    {
        builder.ToTable("ActivityEntries");

        builder.HasKey(activityEntry => activityEntry.Id);

        builder.Property(activityEntry => activityEntry.Id)
            .ValueGeneratedNever();

        builder.Property(activityEntry => activityEntry.GoalId)
            .IsRequired();

        builder.Property(activityEntry => activityEntry.UserId)
            .HasMaxLength(128)
            .IsRequired();

        builder.Property(activityEntry => activityEntry.OccurredAtUtc)
            .IsRequired();

        builder.Property(activityEntry => activityEntry.Quantity)
            .HasColumnType("decimal(18,4)")
            .IsRequired();

        builder.Property(activityEntry => activityEntry.Notes)
            .HasMaxLength(1000);

        builder.Property(activityEntry => activityEntry.CreatedAtUtc)
            .IsRequired();

        builder.Property(activityEntry => activityEntry.UpdatedAtUtc);

        builder.Property(activityEntry => activityEntry.DeletedAtUtc);

        builder.Ignore(activityEntry => activityEntry.IsDeleted);

        builder.HasIndex(activityEntry => new
        {
            activityEntry.UserId,
            activityEntry.GoalId,
            activityEntry.OccurredAtUtc
        });

        builder.HasIndex(activityEntry => activityEntry.DeletedAtUtc);
    }
}
