# HealthGame.Cli

Installable .NET tool for HealthGame database maintenance and CSV data transfer.

Common commands:

```powershell
healthgame reset-database --username quinn --password Password1!
healthgame export users .\users.csv
healthgame import users .\users.csv --default-password Password1!
```

Set `ConnectionStrings__HealthGame` or `HEALTHGAME_ConnectionStrings__HealthGame` to target a specific SQL Server database.
