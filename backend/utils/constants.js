const TRANSACTION_CATEGORIES = {
  EXPENSE: ['food', 'transport', 'entertainment', 'bills', 'shopping', 'health', 'education', 'other'],
  INCOME: ['salary', 'freelance', 'investment', 'gift', 'other']
};

const TRANSACTION_TYPES = {
  INCOME: 'income',
  EXPENSE: 'expense'
};

const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
};

module.exports = {
  TRANSACTION_CATEGORIES,
  TRANSACTION_TYPES,
  HTTP_STATUS
};
