import { getRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    try {
      if (!title || !value || !type || !category) {
        throw new AppError('Check the data', 400);
      }

      const categoryRepository = getRepository(Category);

      const checkIfCategoryExists = await categoryRepository.findOne({
        where: { title: category },
      });

      let categoryId: string;

      if (!checkIfCategoryExists) {
        const categoryRepo = categoryRepository.create({ title: category });

        await categoryRepository.save(categoryRepo);

        categoryId = categoryRepo.id;
      } else {
        categoryId = checkIfCategoryExists.id;
      }

      const transactionsRepository = getRepository(Transaction);

      const transaction = transactionsRepository.create({
        title,
        value,
        type,
        category_id: categoryId,
      });

      const transactionResult = await transactionsRepository.save(transaction);

      return transactionResult;
    } catch (err) {
      throw new AppError(err.message, 400);
    }
  }
}

export default CreateTransactionService;
