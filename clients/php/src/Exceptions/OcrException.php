<?php

namespace Dmsandhika\OcrClient\Exceptions;

use Exception;

class OcrException extends Exception
{
    protected ?int $statusCode;
    protected mixed $responseBody;

    public function __construct(string $message, ?int $statusCode = null, mixed $responseBody = null, ?\Throwable $previous = null)
    {
        parent::__construct($message, $statusCode ?? 0, $previous);
        $this->statusCode = $statusCode;
        $this->responseBody = $responseBody;
    }

    public function getStatusCode(): ?int
    {
        return $this->statusCode;
    }

    public function getResponseBody(): mixed
    {
        return $this->responseBody;
    }
}
