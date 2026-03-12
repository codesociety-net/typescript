export abstract class DataMiner {
  // Template method — defines the algorithm skeleton
  mine(source: string): string[] {
    const raw = this.extractData(source);
    const parsed = this.parseData(raw);
    const filtered = this.filterData(parsed);
    this.reportResults(filtered);
    return filtered;
  }

  protected abstract extractData(source: string): string;
  protected abstract parseData(raw: string): string[];

  // Hook — subclasses may override
  protected filterData(data: string[]): string[] {
    return data;
  }

  // Default implementation
  protected reportResults(data: string[]): void {
    console.log(`Mined ${data.length} records.`);
  }
}

export class CsvMiner extends DataMiner {
  protected extractData(source: string): string {
    return `CSV content of ${source}`;
  }

  protected parseData(raw: string): string[] {
    return raw.split("\n").filter(Boolean);
  }
}

export class JsonMiner extends DataMiner {
  protected extractData(source: string): string {
    return `{"data": ["a","b","c"]}`;
  }

  protected parseData(raw: string): string[] {
    return JSON.parse(raw).data as string[];
  }

  protected filterData(data: string[]): string[] {
    return data.filter(item => item !== "b");
  }
}


// Demo (runs when executed directly)
if (import.meta.url === `file://${process.argv[1]}`) {
  new CsvMiner().mine("report.csv");
  new JsonMiner().mine("api/v1/data");
}
