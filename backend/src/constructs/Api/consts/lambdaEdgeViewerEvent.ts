export const lambdaEdgeViewerEvent = {
  Records: [
    {
      cf: {
        config: {
          distributionDomainName: 'd111111abcdef8.cloudfront.net',
          distributionId: 'EDFDVBD6EXAMPLE',
          eventType: 'viewer-request',
          requestId: '4TyzHTaYWb1GX1qTfsHhEqV6HUDd_BzoBZnwfnvQc_1oF26ClkoUSEQ==',
        },
        request: {
          clientIp: '203.0.113.178',
          headers: {
            host: [
              {
                key: 'Host',
                value: 'd111111abcdef8.cloudfront.net',
              },
            ],
            'user-agent': [
              {
                key: 'User-Agent',
                value: 'curl/7.66.0',
              },
            ],
            accept: [
              {
                key: 'accept',
                value: '*/*',
              },
            ],
            cookie: [
              {
                key: 'cookie',
                value: 'dummyCookieValue',
              },
            ],
          },
          method: 'GET',
          querystring: '',
          uri: '/',
        },
      },
    },
  ],
};
