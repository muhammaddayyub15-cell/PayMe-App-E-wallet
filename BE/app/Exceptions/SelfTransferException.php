<?php

namespace App\Exceptions;

use Exception;

class SelfTransferException extends Exception
{
    public function __construct(string $message = 'Tidak bisa transfer ke diri sendiri.')
    {
        parent::__construct($message);
    }
}
