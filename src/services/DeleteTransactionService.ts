import { getRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';

interface Request {
  transaction_id: string;
}
class DeleteTransactionService {
  public async execute({ transaction_id }: Request): Promise<void> {
    const transactionsRepository = getRepository(Transaction);

    const repoExists = await transactionsRepository.findOne({
      where: { id: transaction_id },
    });

    if (!repoExists) {
      throw new AppError('Transaction not found', 400);
    }

    await transactionsRepository.remove(repoExists);
  }
}

export default DeleteTransactionService;
