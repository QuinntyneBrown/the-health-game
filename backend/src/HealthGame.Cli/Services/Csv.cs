namespace HealthGame.Cli.Services;

public static class Csv
{
    public static string Row(params string[] values)
    {
        return string.Join(",", values.Select(Escape));
    }

    public static async Task<IReadOnlyList<IReadOnlyDictionary<string, string>>> ReadAsync(
        FileInfo file,
        CancellationToken cancellationToken)
    {
        using var stream = file.OpenRead();
        using var reader = new StreamReader(stream);

        var headerLine = await reader.ReadLineAsync(cancellationToken)
            ?? throw new InvalidOperationException("CSV file is empty.");
        var headers = ParseLine(headerLine);
        var records = new List<IReadOnlyDictionary<string, string>>();

        while (!reader.EndOfStream)
        {
            cancellationToken.ThrowIfCancellationRequested();
            var line = await reader.ReadLineAsync(cancellationToken);
            if (string.IsNullOrWhiteSpace(line))
            {
                continue;
            }

            var values = ParseLine(line);
            var record = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
            for (var i = 0; i < headers.Count; i++)
            {
                record[headers[i]] = i < values.Count ? values[i] : string.Empty;
            }

            records.Add(record);
        }

        return records;
    }

    private static string Escape(string value)
    {
        return value.Any(ch => ch is ',' or '"' or '\r' or '\n')
            ? $"\"{value.Replace("\"", "\"\"", StringComparison.Ordinal)}\""
            : value;
    }

    private static IReadOnlyList<string> ParseLine(string line)
    {
        var values = new List<string>();
        var current = new System.Text.StringBuilder();
        var inQuotes = false;

        for (var i = 0; i < line.Length; i++)
        {
            var ch = line[i];
            if (ch == '"')
            {
                if (inQuotes && i + 1 < line.Length && line[i + 1] == '"')
                {
                    current.Append('"');
                    i++;
                    continue;
                }

                inQuotes = !inQuotes;
                continue;
            }

            if (ch == ',' && !inQuotes)
            {
                values.Add(current.ToString());
                current.Clear();
                continue;
            }

            current.Append(ch);
        }

        values.Add(current.ToString());
        return values;
    }
}
