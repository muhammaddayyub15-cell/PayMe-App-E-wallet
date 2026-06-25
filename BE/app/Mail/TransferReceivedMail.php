<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TransferReceivedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly string $receiverName,
        public readonly string $senderName,
        public readonly int    $amount,
        public readonly int    $balanceAfter,
        public readonly string $transactedAt,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Dana Masuk — PayMe',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.transfer-received',
            with: [
                'receiverName' => $this->receiverName,
                'senderName'   => $this->senderName,
                'amount'       => $this->amount,
                'balanceAfter' => $this->balanceAfter,
                'transactedAt' => $this->transactedAt,
            ],
        );
    }
}