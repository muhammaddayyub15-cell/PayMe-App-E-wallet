<?php

namespace App\Exceptions;

use Exception;

class InsufficientBalanceException extends Exception
{
    public function __construct(string $message = 'Saldo tidak cukup.')
    {
        parent::__construct($message);
    }
}
