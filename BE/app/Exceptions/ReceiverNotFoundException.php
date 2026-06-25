<?php

namespace App\Exceptions;

use Exception;

class ReceiverNotFoundException extends Exception
{
    public function __construct(string $message = 'Penerima tidak ditemukan.')
    {
        parent::__construct($message);
    }
}
