import { Router } from 'express';

import { getRepository } from 'typeorm';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import Transaction from '../models/Transaction';
// import DeleteTransactionService from '../services/DeleteTransactionService';
// import ImportTransactionsService from '../services/ImportTransactionsService';

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
  // TODO
});

transactionsRouter.post('/import', async (request, response) => {
  // TODO
});

export default transactionsRouter;
