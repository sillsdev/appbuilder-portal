import { context } from '@opentelemetry/api';
import { Logger as OTLogger } from '@opentelemetry/api-logs';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-grpc';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { LoggerProvider, SimpleLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';

class Logger {
  private logger: OTLogger;
  private enableDev: boolean;
  constructor(logger: OTLogger, enableDev: boolean) {
    this.logger = logger;
    this.enableDev = enableDev;
  }
  public info(message: string, attributes = {}) {
    this.logger.emit({
      body: message,
      severityText: 'INFO',
      attributes,
      context: context.active()
    });
  }
  public dev(message: string, attributes = {}) {
    if (this.enableDev) {
      this.logger.emit({
        body: message,
        severityText: 'INFO - DEV',
        attributes,
        context: context.active()
      });
    }
  }
  public error(message: string, attributes = {}) {
    this.logger.emit({
      body: message,
      severityText: 'ERROR',
      attributes,
      context: context.active()
    });
  }
}

export default class OTEL {
  private static _instance: OTEL;
  private sdk: NodeSDK;
  private initialized = false;
  private _logger: Logger;

  private constructor() {
    const isDev = process.env.NODE_ENV === 'development';
    const endpoint = `http://${isDev ? 'localhost' : 'otel-collector'}:6317`;

    const resource = resourceFromAttributes({
      [ATTR_SERVICE_NAME]: 'scriptoria',
      [ATTR_SERVICE_VERSION]: '1.0'
    });

    const logProcessor = new SimpleLogRecordProcessor(
      new OTLPLogExporter({
        url: endpoint
      })
    );

    this._logger = new Logger(
      new LoggerProvider({
        resource,
        processors: [logProcessor]
      }).getLogger('scriptoria-logger'),
      isDev
    );

    this.sdk = new NodeSDK({
      resource,
      traceExporter: new OTLPTraceExporter({ url: endpoint }),
      metricReader: new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter({ url: endpoint })
      }),
      instrumentations: [
        getNodeAutoInstrumentations({
          '@opentelemetry/instrumentation-fs': {
            enabled: false
          }
        })
      ],
      logRecordProcessors: [logProcessor]
    });
  }

  public static get instance(): OTEL {
    if (!OTEL._instance) {
      OTEL._instance = new OTEL();
    }
    return OTEL._instance;
  }

  public start() {
    if (!this.initialized) {
      this.initialized = true;
      this.sdk.start();
    }
  }

  public get logger() {
    return this._logger;
  }
}
