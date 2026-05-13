using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HealthGame.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class SyncModelForE2E : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "DisabledAtUtc",
                table: "UserProfiles",
                type: "datetimeoffset",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "FailedSignInCount",
                table: "UserProfiles",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "LastSignInAtUtc",
                table: "UserProfiles",
                type: "datetimeoffset",
                nullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "LockoutEndsAtUtc",
                table: "UserProfiles",
                type: "datetimeoffset",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PasswordHash",
                table: "UserProfiles",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Username",
                table: "UserProfiles",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DisabledAtUtc",
                table: "UserProfiles");

            migrationBuilder.DropColumn(
                name: "FailedSignInCount",
                table: "UserProfiles");

            migrationBuilder.DropColumn(
                name: "LastSignInAtUtc",
                table: "UserProfiles");

            migrationBuilder.DropColumn(
                name: "LockoutEndsAtUtc",
                table: "UserProfiles");

            migrationBuilder.DropColumn(
                name: "PasswordHash",
                table: "UserProfiles");

            migrationBuilder.DropColumn(
                name: "Username",
                table: "UserProfiles");
        }
    }
}
