import { execFileSync } from 'node:child_process';

const server = process.env['E2E_SQL_SERVER'] ?? '.\\SQLEXPRESS';
const database = process.env['E2E_SQL_DATABASE'] ?? 'HealthGameE2E';

export class SqlExpressDatabase {
  execute(sql: string): void {
    execFileSync('sqlcmd', ['-S', server, '-d', database, '-E', '-b', '-Q', withRequiredSetOptions(sql)], {
      stdio: 'pipe',
      encoding: 'utf8',
    });
  }

  scalar(sql: string): string {
    const output = execFileSync(
      'sqlcmd',
      [
        '-S',
        server,
        '-d',
        database,
        '-E',
        '-b',
        '-h',
        '-1',
        '-W',
        '-Q',
        withRequiredSetOptions(`SET NOCOUNT ON; ${sql}`),
      ],
      {
        stdio: 'pipe',
        encoding: 'utf8',
      },
    );

    return output
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)[0] ?? '';
  }

  cleanupUser(userId: string): void {
    const safeUserId = escapeSql(userId);

    this.execute(`
      DELETE FROM ActivityEntries WHERE UserId = N'${safeUserId}';
      DELETE FROM Rewards WHERE UserId = N'${safeUserId}';
      DELETE FROM Goals WHERE UserId = N'${safeUserId}';
      DELETE FROM UserProfiles WHERE SubjectId = N'${safeUserId}';
    `);
  }
}

export function escapeSql(value: string): string {
  return value.replace(/'/g, "''");
}

function withRequiredSetOptions(sql: string): string {
  return `SET QUOTED_IDENTIFIER ON; SET ANSI_NULLS ON; ${sql}`;
}
