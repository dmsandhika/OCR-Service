<?php

namespace Dmsandhika\OcrClient;

use GuzzleHttp\Client as GuzzleClient;
use GuzzleHttp\ClientInterface;
use GuzzleHttp\Exception\BadResponseException;
use GuzzleHttp\Psr7\Utils;
use Dmsandhika\OcrClient\Exceptions\AuthenticationException;
use Dmsandhika\OcrClient\Exceptions\OcrException;

class OcrClient
{
    protected string $baseUrl;
    protected string $apiKey;
    protected ClientInterface $httpClient;

    public function __construct(string $baseUrl, string $apiKey, ?ClientInterface $httpClient = null)
    {
        $this->baseUrl = rtrim($baseUrl, '/');
        $this->apiKey = $apiKey;
        $this->httpClient = $httpClient ?? new GuzzleClient([
            'base_uri' => $this->baseUrl,
            'timeout'  => 60.0,
        ]);
    }

    /**
     * Check if the OCR service is operational.
     */
    public function health(): bool
    {
        try {
            $response = $this->httpClient->request('GET', "{$this->baseUrl}/health");
            if ($response->getStatusCode() === 200) {
                $body = json_decode((string) $response->getBody(), true);
                return ($body['status'] ?? null) === 'ok';
            }
            return false;
        } catch (\Throwable $e) {
            return false;
        }
    }

    /**
     * Scan an image file from a local path.
     *
     * @param string $filePath Absolute or relative path to the image file
     * @param string|null $type Document parser type ('ktp', 'ic', 'passport', 'struk')
     * @return array
     * @throws OcrException
     */
    public function scan(string $filePath, ?string $type = null): array
    {
        if (!file_exists($filePath) || !is_readable($filePath)) {
            throw new OcrException("File does not exist or is not readable: {$filePath}");
        }

        $stream = Utils::streamFor(fopen($filePath, 'r'));
        $filename = basename($filePath);

        return $this->sendScanRequest($stream, $filename, $type);
    }

    /**
     * Scan raw image binary content directly.
     *
     * @param string $binaryContent Binary content of the image
     * @param string $filename Name of the file, e.g. 'ktp.jpg'
     * @param string|null $type Document parser type ('ktp', 'ic', 'passport', 'struk')
     * @return array
     * @throws OcrException
     */
    public function scanContents(string $binaryContent, string $filename = 'image.jpg', ?string $type = null): array
    {
        $stream = Utils::streamFor($binaryContent);
        return $this->sendScanRequest($stream, $filename, $type);
    }

    /**
     * Internal handler to dispatch the multipart request.
     */
    protected function sendScanRequest($stream, string $filename, ?string $type = null): array
    {
        $multipart = [
            [
                'name'     => 'file',
                'contents' => $stream,
                'filename' => $filename,
            ],
        ];

        if ($type !== null) {
            $multipart[] = [
                'name'     => 'type',
                'contents' => $type,
            ];
        }

        try {
            $response = $this->httpClient->request('POST', "{$this->baseUrl}/ocr", [
                'headers' => [
                    'x-api-key' => $this->apiKey,
                ],
                'multipart' => $multipart,
            ]);

            return json_decode((string) $response->getBody(), true) ?? [];
        } catch (BadResponseException $e) {
            $statusCode = $e->getResponse()->getStatusCode();
            $body = json_decode((string) $e->getResponse()->getBody(), true);
            $message = $body['error'] ?? $e->getMessage();

            if ($statusCode === 401) {
                throw new AuthenticationException($message, $statusCode, $body, $e);
            }

            throw new OcrException($message, $statusCode, $body, $e);
        } catch (\Throwable $e) {
            throw new OcrException($e->getMessage(), 0, null, $e);
        }
    }
}
