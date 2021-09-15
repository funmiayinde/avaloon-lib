export default () => ({
  app: {
    environment: process.env.NODE_ENV || 'development',
    encryption_key: process.env.SERVER_SECRET || 'AppSecret',
  },
  service: {
    name: 'Avaloon lib',
    port: 4003,
    host: `${process.env.BASE_URL || 'http//localhost'}:${
      process.env.PORT || 4003
    }`,
    url: `${process.env.BASE_URL || 'http//localhost'}:${
      process.env.PORT || 4003
    }`,
    version: 1,
    lang: 'en',
    pagination: {
      items_per_page: 10,
    },
    database: {
      mongodb: {
        url: process.env.DB_URL,
        test: process.env.DB_TEST_URL,
      },
    },
    google: {
      gcs: {
        projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
        keyFile: process.env.GOOGLE_CLOUD_KEYFILE,
        bucket: process.env.GOOGLE_CLOUD_STORAGE_BUCKET,
      },
    },
    rabbitMQ: {
      url: process.env.RABBITMQ_URL || '',
    },
    amazon: {
      s3: {
        key: process.env.AWS_ACCESS_KEY,
        secret: process.env.AWS_SECRET_KEY,
        bucket: process.env.AWS_BUCKET,
        region: process.env.AWS_REGION,
      },
    },
  },
});
