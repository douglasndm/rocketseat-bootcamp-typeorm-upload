import {
  EntityRepository,
  Repository,
  getRepository,
  getCustomRepository,
} from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactionsRepository = getRepository(Transaction);

    const allTransactions = await transactionsRepository.find();

    let income = 0;
    let outcome = 0;
    let total = 0;

    allTransactions.map(t => {
      if (t.type === 'income') {
        income += t.value;
      } else if (t.type === 'outcome') {
        outcome += t.value;
      }
    });

    total = income - outcome;

    const balance: Balance = {
      income,
      outcome,
      total,
    };

    return balance;
  }
}

export default TransactionsRepository;
