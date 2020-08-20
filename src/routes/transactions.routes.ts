import { Router } from 'express';

import { getRepository, getCustomRepository } from 'typeorm';
import multer from 'multer';
import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import Transaction from '../models/Transaction';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

import uploadConfig from '../config/upload';

const upload = multer(uploadConfig);

const transactionsRouter = Router();

transactionsRouter.get('/', async (request, response) => {
  const transactionsRepository = new TransactionsRepository();
  const transactionsRepo = getRepository(Transaction);

  const transactions = await transactionsRepo.find();
  const balance = await transactionsRepository.getBalance();

  const result = { transactions, balance };

  return response.status(200).json(result);
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;

  if (type !== 'income' || type !== 'outcome') {
    throw new AppError('Check the transaction type', 400);
  }

  const transactionRepo = getCustomRepository(TransactionsRepository);

  const balance = await transactionRepo.getBalance();

  if (type === 'outcome' && balance.total < value) {
    throw new AppError("You don't have enough money", 400);
  }

  const createTransaction = new CreateTransactionService();
  const responseTransaction = await createTransaction.execute({
    title,
    value,
    type,
    category,
  });

  return response.status(201).json(responseTransaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;

  const deleteTransaction = new DeleteTransactionService();
  await deleteTransaction.execute({ transaction_id: id });

  return response.status(204).send('deleted');
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const importTransactions = new ImportTransactionsService();
    const result = await importTransactions.execute({
      fileName: request.file.filename,
    });
    return response.send(result);
  },
);

export default transactionsRouter;
