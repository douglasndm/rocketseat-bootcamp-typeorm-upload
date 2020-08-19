import fs from 'fs';
import path from 'path';
import csvParse from 'csv-parse';
import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';

import uploadConfig from '../config/upload';

import CreateTransactionService from './CreateTransactionService';

interface Request {
  fileName: string;
}
class ImportTransactionsService {
  async execute({ fileName }: Request): Promise<Transaction[]> {
    try {
      const filePath = path.resolve(uploadConfig.directory, fileName);
      const readCSVStream = fs.createReadStream(filePath);

      const parseStream = csvParse({
        from_line: 2,
        ltrim: true,
        rtrim: true,
      });

      const parseCSV = readCSVStream.pipe(parseStream);

      const lines: string[] = [];

      parseCSV.on('data', line => {
        lines.push(line);
      });

      await new Promise(resolve => {
        parseCSV.on('end', resolve);
      });

      const allTransactionsImported: Transaction[] = [];

      for (const l of lines) {
        const transactionService = new CreateTransactionService();
        const transac = await transactionService.execute({
          title: l[0],
          type: l[1] === 'income' ? 'income' : 'outcome',
          value: Number(l[2]),
          category: l[3],
        });

        allTransactionsImported.push(transac);
      }

      await fs.promises.unlink(filePath);

      return allTransactionsImported;
    } catch (err) {
      throw new AppError(err.message, 400);
    }
  }
}

export default ImportTransactionsService;
